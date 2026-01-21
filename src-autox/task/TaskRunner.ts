/**
 * 任务运行器
 */

/* eslint-disable ts/no-this-alias */

import type { Task } from './Task'
import type {
  InterruptRequest,
  RunnerOptions,
  StackFrame,
  TaskContext,
  TaskEventCallback,
  TaskEventType,
  TaskResult,
} from './types'
import { createLogger } from '../core/logger'
import { Navigator } from './Navigator'
import { EnterReason, ExecuteResult, InterruptPriority, LeaveReason, RunnerState } from './types'

const DEFAULT_INTERVAL = 800
const CHECKPOINT_INTERVAL = 200

/**
 * 任务句柄
 */
interface TaskHandle {
  /** 暂停任务 */
  pause: () => void
  /** 恢复任务 */
  resume: () => void
  /** 停止任务 */
  stop: () => void
  /** 获取当前状态 */
  readonly state: RunnerState
  /** 获取当前上下文 */
  readonly context: TaskContext
  /** 事件监听 */
  on: (event: TaskEventType, callback: TaskEventCallback) => void
  /** 移除事件监听 */
  off: (event: TaskEventType, callback: TaskEventCallback) => void
  /** 等待任务完成 */
  wait: () => TaskResult
}

/**
 * 任务运行器
 */
class TaskRunner {
  private _state: RunnerState = RunnerState.IDLE
  private currentTask: Task | null = null
  private currentOptions: RunnerOptions = {}
  private ctx: TaskContext = this.createEmptyContext()
  private eventListeners: Map<TaskEventType, TaskEventCallback[]> = new Map()
  private taskStack: StackFrame[] = []
  private interruptQueue: InterruptRequest[] = []
  private interruptLock = threads.lock()
  private pauseLock = threads.lock()
  private pauseCondition = this.pauseLock.newCondition()
  private result: TaskResult | null = null
  private inInterrupt = false
  private log = createLogger('TaskRunner')

  /**
   * 获取当前状态
   */
  get state(): RunnerState {
    return this._state
  }

  /**
   * 启动任务（非阻塞，返回句柄）
   */
  start(task: Task, options?: RunnerOptions): TaskHandle {
    if (this._state === RunnerState.RUNNING || this._state === RunnerState.PAUSED) {
      throw new Error('Runner is already running')
    }

    this.reset()
    this.currentTask = task
    this.currentOptions = options ?? {}
    this._state = RunnerState.RUNNING

    const self = this

    threads.start(() => {
      try {
        self.runTask()
      }
      catch (e) {
        self.log.error(`任务执行异常: ${e}`)
        self.result = {
          successCount: self.ctx.count,
          totalLoops: self.ctx.loops,
          duration: Date.now() - self.ctx.startTime,
          reason: 'error',
          error: e as Error,
        }
        self._state = RunnerState.STOPPED
        self.emit('error', e)
      }
      finally {
        self.emit('finish', self.result)
      }
    })

    return this.createHandle()
  }

  /**
   * 可中断的 sleep
   */
  sleep(ms: number): void {
    const endTime = Date.now() + ms
    while (Date.now() < endTime) {
      if (this._state === RunnerState.STOPPED)
        return
      this.checkPause()
      this.pollInterrupt()
      const remaining = endTime - Date.now()
      if (remaining > 0) {
        sleep(Math.min(remaining, CHECKPOINT_INTERVAL))
      }
    }
  }

  /**
   * 可中断的等待
   */
  waitUntil(condition: () => boolean, timeout = 30000, interval = 500): boolean {
    const endTime = Date.now() + timeout
    while (Date.now() < endTime) {
      if (this._state === RunnerState.STOPPED)
        return false
      this.checkPause()
      this.pollInterrupt()
      if (condition())
        return true
      const remaining = endTime - Date.now()
      if (remaining > 0) {
        sleep(Math.min(remaining, interval))
      }
    }
    return false
  }

  /**
   * 暂停任务
   */
  pause(): void {
    if (this._state === RunnerState.RUNNING) {
      this._state = RunnerState.PAUSED
      this.emit('pause')
    }
  }

  /**
   * 恢复任务
   */
  resume(): void {
    if (this._state === RunnerState.PAUSED) {
      this.pauseLock.lock()
      try {
        this._state = RunnerState.RUNNING
        this.pauseCondition.signalAll()
      }
      finally {
        this.pauseLock.unlock()
      }
      this.emit('resume')
    }
  }

  /**
   * 停止任务
   */
  stop(): void {
    if (this._state === RunnerState.RUNNING || this._state === RunnerState.PAUSED) {
      const wasPaused = this._state === RunnerState.PAUSED
      this._state = RunnerState.STOPPED
      if (wasPaused) {
        this.pauseLock.lock()
        try {
          this.pauseCondition.signalAll()
        }
        finally {
          this.pauseLock.unlock()
        }
      }
      this.emit('stop')
    }
  }

  /**
   * 添加中断请求
   */
  addInterrupt(request: InterruptRequest): void {
    this.interruptLock.lock()
    try {
      const insertIndex = this.interruptQueue.findIndex(item => item.priority < request.priority)
      if (insertIndex === -1) {
        this.interruptQueue.push(request)
      }
      else {
        this.interruptQueue.splice(insertIndex, 0, request)
      }
    }
    finally {
      this.interruptLock.unlock()
    }
  }

  /**
   * 清除所有事件监听器
   */
  clearListeners(): void {
    this.eventListeners.clear()
  }

  private runTask(): void {
    const task = this.currentTask!
    const options = this.currentOptions
    const times = options.times ?? Infinity
    const interval = options.interval ?? DEFAULT_INTERVAL

    this.ctx = {
      count: 0,
      times,
      loops: 0,
      startTime: Date.now(),
      params: options.params ?? {},
    }

    task._injectContext(this.ctx)
    task._injectRunner({
      sleep: ms => this.sleep(ms),
      waitUntil: (condition, timeout, interval) => this.waitUntil(condition, timeout, interval),
    })

    this.emit('start')

    // 记录离开原因
    let leaveReason: LeaveReason = LeaveReason.COMPLETE

    try {
      task.onEnter?.(EnterReason.START)
    }
    catch (e) {
      this.log.error(`onEnter 异常: ${e}`)
      throw e
    }

    try {
      while (this.ctx.count < times && !this.isStopped()) {
        this.checkPause()
        if (this.isStopped()) {
          leaveReason = LeaveReason.STOP
          break
        }

        let result: ExecuteResult
        try {
          result = task.execute()
        }
        catch (e) {
          this.log.error(`execute 异常: ${e}`)
          result = ExecuteResult.ERROR
        }

        this.ctx.loops++
        this.emit('loop', { result, loops: this.ctx.loops })

        switch (result) {
          case ExecuteResult.CONTINUE:
            break
          case ExecuteResult.SUCCESS:
            this.ctx.count++
            this.emit('success', { count: this.ctx.count })
            // 只在 SUCCESS 时才检查中断（安全中断点）
            this.pollInterrupt()
            break
          case ExecuteResult.STOP:
            this._state = RunnerState.STOPPED
            leaveReason = LeaveReason.STOP
            break
          case ExecuteResult.ERROR:
            this._state = RunnerState.STOPPED
            leaveReason = LeaveReason.ERROR
            this.result = {
              successCount: this.ctx.count,
              totalLoops: this.ctx.loops,
              duration: Date.now() - this.ctx.startTime,
              reason: 'error',
            }
            break
        }

        if (this._state === RunnerState.STOPPED)
          break

        this.sleep(interval)
      }
    }
    finally {
      if (this._state === RunnerState.STOPPED && leaveReason === LeaveReason.COMPLETE) {
        leaveReason = LeaveReason.STOP
      }
      try {
        task.onLeave?.(leaveReason)
      }
      catch (e) {
        this.log.error(`onLeave 异常: ${e}`)
      }
    }

    if (!this.result) {
      this.result = {
        successCount: this.ctx.count,
        totalLoops: this.ctx.loops,
        duration: Date.now() - this.ctx.startTime,
        reason: this._state === RunnerState.STOPPED ? 'stopped' : 'completed',
      }
    }

    if (this._state !== RunnerState.STOPPED) {
      this._state = RunnerState.FINISHED
    }
  }

  private checkPause(): void {
    if (this._state === RunnerState.PAUSED) {
      this.pauseLock.lock()
      try {
        while (this._state === RunnerState.PAUSED) {
          this.pauseCondition.await()
        }
      }
      finally {
        this.pauseLock.unlock()
      }
    }
  }

  private pollInterrupt(): void {
    // 防止中断任务执行期间重入
    if (this.inInterrupt)
      return

    let request: InterruptRequest | undefined

    this.interruptLock.lock()
    try {
      request = this.interruptQueue.shift()
    }
    finally {
      this.interruptLock.unlock()
    }

    if (!request)
      return

    this.inInterrupt = true
    try {
      // 调用 onLeave('suspend') 钩子（挂起当前任务）
      if (this.currentTask) {
        try {
          this.currentTask.onLeave?.(LeaveReason.SUSPEND)
        }
        catch (e) {
          this.log.error(`onLeave(suspend) 异常: ${e}`)
        }
      }

      // 保存主任务状态（只保存一次，栈为空时才 push）
      if (this.currentTask && this.taskStack.length === 0) {
        this.taskStack.push({
          task: this.currentTask,
          options: this.currentOptions,
          context: { ...this.ctx },
          state: this.deepCloneState(this.currentTask.getState()),
        })
      }

      // 处理所有中断任务，直到队列为空
      while (request) {
        this.log.info(`处理中断: ${request.name}`)
        this.runInterruptTask(request)

        // 检查是否还有中断任务
        this.interruptLock.lock()
        try {
          request = this.interruptQueue.shift()
        }
        finally {
          this.interruptLock.unlock()
        }
      }

      // 所有中断任务完成后，恢复主任务
      try {
        this.restoreFromStack()
      }
      catch (e) {
        this.log.error(`恢复主任务异常: ${e}`)
      }
    }
    finally {
      this.inInterrupt = false
    }
  }

  private runInterruptTask(request: InterruptRequest): void {
    const task = request.task
    const options = request.options ?? {}
    const times = options.times ?? 1
    const interval = options.interval ?? DEFAULT_INTERVAL

    const interruptCtx: TaskContext = {
      count: 0,
      times,
      loops: 0,
      startTime: Date.now(),
      params: options.params ?? {},
    }

    task._injectContext(interruptCtx)
    task._injectRunner({
      sleep: ms => this.sleep(ms),
      waitUntil: (condition, timeout, interval) => this.waitUntil(condition, timeout, interval),
    })

    try {
      task.onEnter?.(EnterReason.START)
    }
    catch (e) {
      this.log.error(`中断任务 onEnter 异常: ${e}`)
      return
    }

    let leaveReason: LeaveReason = LeaveReason.COMPLETE

    try {
      while (interruptCtx.count < times && !this.isStopped()) {
        this.checkPause()
        if (this.isStopped()) {
          leaveReason = LeaveReason.STOP
          break
        }

        let result: ExecuteResult
        try {
          result = task.execute()
        }
        catch (e) {
          this.log.error(`中断任务 execute 异常: ${e}`)
          leaveReason = LeaveReason.ERROR
          break
        }

        interruptCtx.loops++

        switch (result) {
          case ExecuteResult.SUCCESS:
            interruptCtx.count++
            break
          case ExecuteResult.STOP:
            leaveReason = LeaveReason.STOP
            break
          case ExecuteResult.ERROR:
            leaveReason = LeaveReason.ERROR
            break
        }

        if (result === ExecuteResult.STOP || result === ExecuteResult.ERROR)
          break

        this.sleep(interval)
      }
    }
    finally {
      try {
        task.onLeave?.(leaveReason)
      }
      catch (e) {
        this.log.error(`中断任务 onLeave 异常: ${e}`)
      }
    }

    this.log.info(`中断任务完成: ${request.name}`)
  }

  private restoreFromStack(): void {
    const frame = this.taskStack.pop()
    if (!frame)
      return

    this.currentTask = frame.task
    this.currentOptions = frame.options
    this.ctx = frame.context
    frame.task.setState(frame.state)

    frame.task._injectContext(this.ctx)
    frame.task._injectRunner({
      sleep: ms => this.sleep(ms),
      waitUntil: (condition, timeout, interval) => this.waitUntil(condition, timeout, interval),
    })

    this.ensureScene(frame.task)

    // 调用 onEnter('resume') 钩子（恢复任务）
    try {
      frame.task.onEnter?.(EnterReason.RESUME)
    }
    catch (e) {
      this.log.error(`onEnter(resume) 异常: ${e}`)
    }

    this.log.info('已恢复主任务')
  }

  private ensureScene(task: Task): void {
    try {
      if (!Navigator.ensureScene(task)) {
        this.log.warn('任务场景恢复失败')
      }
    }
    catch (e) {
      this.log.error(`恢复任务场景异常: ${e}`)
    }
  }

  private emit(event: TaskEventType, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data)
        }
        catch (e) {
          this.log.error(`事件回调异常: ${e}`)
        }
      }
    }
  }

  private createHandle(): TaskHandle {
    const self = this
    return {
      pause: () => self.pause(),
      resume: () => self.resume(),
      stop: () => self.stop(),
      get state() {
        return self._state
      },
      get context() {
        return self.ctx
      },
      on(event: TaskEventType, callback: TaskEventCallback) {
        let listeners = self.eventListeners.get(event)
        if (!listeners) {
          listeners = []
          self.eventListeners.set(event, listeners)
        }
        listeners.push(callback)
      },
      off(event: TaskEventType, callback: TaskEventCallback) {
        const listeners = self.eventListeners.get(event)
        if (listeners) {
          const index = listeners.indexOf(callback)
          if (index !== -1) {
            listeners.splice(index, 1)
          }
        }
      },
      wait(): TaskResult {
        while (self._state === RunnerState.RUNNING || self._state === RunnerState.PAUSED) {
          sleep(100)
        }
        return self.result ?? {
          successCount: 0,
          totalLoops: 0,
          duration: 0,
          reason: 'error',
          error: new Error('Task result unavailable'),
        }
      },
    }
  }

  private createEmptyContext(): TaskContext {
    return {
      count: 0,
      times: 0,
      loops: 0,
      startTime: 0,
      params: {},
    }
  }

  private reset(): void {
    this._state = RunnerState.IDLE
    this.currentTask = null
    this.currentOptions = {}
    this.ctx = this.createEmptyContext()
    // 不清除 eventListeners，避免 start 后注册的监听器丢失事件
    this.taskStack = []
    this.interruptQueue = []
    this.result = null
    this.inInterrupt = false
  }

  /**
   * 深拷贝状态，避免引用类型导致状态污染
   */
  private deepCloneState(state: Record<string, any>): Record<string, any> {
    try {
      return JSON.parse(JSON.stringify(state))
    }
    catch {
      // 如果序列化失败，返回浅拷贝
      return { ...state }
    }
  }

  private isStopped(): boolean {
    return this._state === RunnerState.STOPPED
  }
}

export { TaskRunner }
export type { TaskHandle }
