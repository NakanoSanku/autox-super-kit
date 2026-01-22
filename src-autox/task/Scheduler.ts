/**
 * 调度器
 */

/* eslint-disable ts/no-this-alias */

import type { Task } from './Task'
import type { QueueResult, TaskQueue } from './TaskQueue'
import type { TaskHandle } from './TaskRunner'
import type { InterruptPriority, InterruptRequest, RunnerOptions, TaskResult } from './types'
import { createLogger } from '../core/logger'
import { TaskRunner } from './TaskRunner'
import { RunnerState } from './types'

const log = createLogger('Scheduler')

/**
 * 定时任务
 */
interface TimedJob {
  /** 任务名称 */
  name: string
  /** 时间点: "07:00" 或 "HH:mm" 格式 */
  time: string
  /** 要执行的任务 */
  task: Task
  /** 任务选项 */
  options?: RunnerOptions
  /** 优先级 */
  priority: InterruptPriority
  /** 上次运行时间戳（内部维护） */
  lastRunAt?: number
}

/**
 * 周期任务
 */
interface IntervalJob {
  /** 任务名称 */
  name: string
  /** 间隔时间(ms) */
  interval: number
  /** 要执行的任务 */
  task: Task
  /** 任务选项 */
  options?: RunnerOptions
  /** 优先级 */
  priority: InterruptPriority
  /** 下次执行时间（内部维护） */
  nextRunAt?: number
}

/**
 * 事件任务
 * 触发后在独立线程中并行执行，不会中断主任务
 */
interface EventJob {
  /** 任务名称 */
  name: string
  /** 触发条件 */
  condition: () => boolean
  /** 检测间隔(ms)，默认 30000 */
  checkInterval?: number
  /** 要执行的任务 */
  task: Task
  /** 任务选项 */
  options?: RunnerOptions
}

type Job = TimedJob | IntervalJob | EventJob

/**
 * 队列句柄
 */
interface QueueHandle {
  /** 暂停当前任务 */
  pause: () => void
  /** 恢复当前任务 */
  resume: () => void
  /** 跳过当前任务 */
  skip: () => void
  /** 停止整个队列 */
  stop: () => void
  /** 获取当前状态 */
  readonly state: RunnerState
  /** 等待队列完成 */
  wait: () => QueueResult
}

/**
 * 调度器
 */
class Scheduler {
  private runner = new TaskRunner()
  private timedJobs: Map<string, TimedJob> = new Map()
  private intervalJobs: Map<string, IntervalJob> = new Map()
  private eventJobs: Map<string, EventJob & { lastCheckAt?: number; isRunning?: boolean }> = new Map()
  private running = false
  private checkThread: any = null
  private currentHandle: TaskHandle | null = null
  private queueResults: TaskResult[] = []
  private queueStartTime = 0
  private eventThreads: Map<string, any> = new Map()

  /**
   * 注册定时任务
   */
  schedule(job: TimedJob): this {
    if (!this.parseTime(job.time)) {
      throw new Error(`Invalid time format for job "${job.name}": ${job.time}`)
    }
    this.timedJobs.set(job.name, job)
    log.info(`注册定时任务: ${job.name} @ ${job.time}`)
    return this
  }

  /**
   * 注册周期任务
   */
  every(job: IntervalJob): this {
    job.nextRunAt = Date.now() + job.interval
    this.intervalJobs.set(job.name, job)
    log.info(`注册周期任务: ${job.name} 每 ${job.interval}ms`)
    return this
  }

  /**
   * 注册事件任务
   */
  on(job: EventJob): this {
    this.eventJobs.set(job.name, { ...job, lastCheckAt: 0 })
    log.info(`注册事件任务: ${job.name}`)
    return this
  }

  /**
   * 移除任务
   */
  remove(name: string): this {
    this.timedJobs.delete(name)
    this.intervalJobs.delete(name)
    this.eventJobs.delete(name)
    log.info(`移除任务: ${name}`)
    return this
  }

  /**
   * 启动调度器并运行主任务队列
   */
  start(queue: TaskQueue): QueueHandle {
    if (this.running) {
      throw new Error('Scheduler is already running')
    }

    this.running = true
    this.queueResults = []
    this.queueStartTime = Date.now()
    queue.reset()

    this.startCheckThread()

    const self = this

    threads.start(() => {
      self.runQueue(queue)
    })

    return this.createQueueHandle()
  }

  /**
   * 停止调度器
   */
  stop(): void {
    this.running = false
    this.currentHandle?.stop()
    if (this.checkThread) {
      this.checkThread.interrupt()
      this.checkThread = null
    }
    // 停止所有事件任务线程
    for (const [name, { runner, thread }] of this.eventThreads) {
      try {
        runner.stop()
        thread.interrupt()
        log.info(`停止事件任务线程: ${name}`)
      }
      catch (e) {
        log.error(`停止事件任务线程异常 [${name}]: ${e}`)
      }
    }
    this.eventThreads.clear()
  }

  private runQueue(queue: TaskQueue): void {
    const tasks = queue.getTasks()
    const events = queue.getEvents()

    for (let i = 0; i < tasks.length && this.running; i++) {
      queue._setCurrentIndex(i)
      const { task, options } = tasks[i]

      events.onTaskStart?.(task, i)

      this.currentHandle = this.runner.start(task, options)
      const result = this.currentHandle.wait()

      this.queueResults.push(result)
      events.onTaskEnd?.(task, result, i)

      if (!this.running)
        break
    }

    this.running = false
    this.stopCheckThread()

    const queueResult: QueueResult = {
      results: this.queueResults,
      totalDuration: Date.now() - this.queueStartTime,
      completedCount: this.queueResults.filter(r => r.reason === 'completed').length,
    }

    events.onQueueEnd?.(queueResult)
  }

  private startCheckThread(): void {
    const self = this

    this.checkThread = threads.start(() => {
      while (self.running) {
        try {
          self.checkTimedJobs()
          self.checkIntervalJobs()
          self.checkEventJobs()
        }
        catch (e) {
          log.error(`检查线程异常: ${e}`)
        }

        sleep(1000)
      }
    })
  }

  private stopCheckThread(): void {
    if (this.checkThread) {
      this.checkThread.interrupt()
      this.checkThread = null
    }
  }

  private checkTimedJobs(): void {
    const now = Date.now()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    for (const [name, job] of Array.from(this.timedJobs)) {
      const parsed = this.parseTime(job.time)
      if (!parsed) {
        log.warn(`定时任务时间格式无效: ${name} @ ${job.time}`)
        continue
      }
      const { hours, minutes } = parsed
      const todayTriggerTime = today.getTime() + hours * 3600000 + minutes * 60000

      // 在触发时间之后，且上次运行在今天触发时间之前（或从未运行）
      if (now >= todayTriggerTime && (job.lastRunAt ?? 0) < todayTriggerTime) {
        job.lastRunAt = now
        this.enqueueInterrupt(name, job)
      }
    }
  }

  private checkIntervalJobs(): void {
    const now = Date.now()

    for (const [name, job] of Array.from(this.intervalJobs)) {
      if (job.nextRunAt && now >= job.nextRunAt) {
        job.nextRunAt = now + job.interval
        this.enqueueInterrupt(name, job)
      }
    }
  }

  private checkEventJobs(): void {
    const now = Date.now()

    for (const [name, job] of Array.from(this.eventJobs)) {
      // 如果事件任务正在运行，跳过
      if (job.isRunning)
        continue

      const checkInterval = job.checkInterval ?? 30000
      if (now - (job.lastCheckAt ?? 0) >= checkInterval) {
        job.lastCheckAt = now
        try {
          if (job.condition()) {
            this.runEventJob(name, job)
          }
        }
        catch (e) {
          log.error(`事件检测异常 [${name}]: ${e}`)
        }
      }
    }
  }

  /**
   * 在独立线程中执行事件任务
   */
  private runEventJob(name: string, job: EventJob & { lastCheckAt?: number; isRunning?: boolean }): void {
    job.isRunning = true
    log.info(`启动事件任务线程: ${name}`)

    const self = this
    const eventRunner = new TaskRunner()
    const thread = threads.start(() => {
      try {
        const handle = eventRunner.start(job.task, job.options)
        handle.wait()
        log.info(`事件任务完成: ${name}`)
      }
      catch (e) {
        log.error(`事件任务执行异常 [${name}]: ${e}`)
      }
      finally {
        job.isRunning = false
        self.eventThreads.delete(name)
      }
    })

    this.eventThreads.set(name, { thread, runner: eventRunner })
  }

  private enqueueInterrupt(name: string, job: TimedJob | IntervalJob): void {
    const request: InterruptRequest = {
      name,
      task: job.task,
      options: job.options,
      priority: job.priority,
    }

    log.info(`触发中断: ${name}`)
    this.runner.addInterrupt(request)
  }

  private createQueueHandle(): QueueHandle {
    const self = this

    return {
      pause() {
        self.currentHandle?.pause()
      },
      resume() {
        self.currentHandle?.resume()
      },
      skip() {
        // 停止当前任务，for 循环自然进入下一个任务
        self.currentHandle?.stop()
      },
      stop() {
        self.stop()
      },
      get state() {
        return self.currentHandle?.state ?? RunnerState.IDLE
      },
      wait(): QueueResult {
        while (self.running) {
          sleep(100)
        }
        return {
          results: self.queueResults,
          totalDuration: Date.now() - self.queueStartTime,
          completedCount: self.queueResults.filter(r => r.reason === 'completed').length,
        }
      },
    }
  }

  private parseTime(time: string): { hours: number; minutes: number } | null {
    const parts = time.split(':')
    if (parts.length !== 2)
      return null

    const hours = Number(parts[0])
    const minutes = Number(parts[1])
    if (!Number.isInteger(hours) || !Number.isInteger(minutes))
      return null
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
      return null
    return { hours, minutes }
  }
}

export { Scheduler }
export type { EventJob, IntervalJob, QueueHandle, TimedJob }
