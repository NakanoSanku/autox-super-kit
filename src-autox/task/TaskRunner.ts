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
import { ExecuteResult, InterruptPriority, RunnerState } from './types'

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
      if (request.priority === InterruptPriority.URGENT) {
        this.interruptQueue.unshift(request)
      }
      else if (request.priority === InterruptPriority.HIGH) {
        const urgentCount = this.interruptQueue.filter(r => r.priority === InterruptPriority.URGENT).length
        this.interruptQueue.splice(urgentCount, 0, request)
      }
      else {
        this.interruptQueue.push(request)
      }
    }
    finally {
      this.interruptLock.unlock()
    }
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

    try {
      task.setup?.()
    }
    catch (e) {
      this.log.error(`setup 异常: ${e}`)
      throw e
    }

    while (this.ctx.count < times && !this.isStopped()) {
      this.checkPause()
      if (this.isStopped())
        break

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
          break
        case ExecuteResult.ERROR:
          this._state = RunnerState.STOPPED
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

    try {
      task.cleanup?.()
    }
    catch (e) {
      this.log.error(`cleanup 异常: ${e}`)
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

    // 保存主任务状态（只在第一次中断时保存）
    this.taskStack.push({
      task: this.currentTask!,
      options: this.currentOptions,
      context: { ...this.ctx },
      state: this.currentTask!.getState(),
    })

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
    this.restoreFromStack()
  }

  private runInterruptTask(request: InterruptRequest): void {
    const task = request.task as Task
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
      task.setup?.()
    }
    catch (e) {
      this.log.error(`中断任务 setup 异常: ${e}`)
      return
    }

    while (interruptCtx.count < times && !this.isStopped()) {
      this.checkPause()
      if (this.isStopped())
        break

      let result: ExecuteResult
      try {
        result = task.execute()
      }
      catch (e) {
        this.log.error(`中断任务 execute 异常: ${e}`)
        break
      }

      interruptCtx.loops++

      switch (result) {
        case ExecuteResult.SUCCESS:
          interruptCtx.count++
          break
        case ExecuteResult.STOP:
        case ExecuteResult.ERROR:
          break
      }

      if (result === ExecuteResult.STOP || result === ExecuteResult.ERROR)
        break

      this.sleep(interval)
    }

    try {
      task.cleanup?.()
    }
    catch (e) {
      this.log.error(`中断任务 cleanup 异常: ${e}`)
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

    this.log.info('已恢复主任务')
  }

  private ensureScene(task: Task): void {
    if (task.isInScene?.())
      return

    this.log.info('尝试恢复任务场景')

    for (let i = 0; i < 5; i++) {
      back()
      this.sleep(500)
    }

    task.entryScene?.()
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
      wait(): TaskResult {
        while (self._state === RunnerState.RUNNING || self._state === RunnerState.PAUSED) {
          sleep(100)
        }
        return self.result!
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
    this.eventListeners.clear()
    this.taskStack = []
    this.interruptQueue = []
    this.result = null
  }

  private isStopped(): boolean {
    return this._state === RunnerState.STOPPED
  }
}

export { TaskRunner }
export type { TaskHandle }
