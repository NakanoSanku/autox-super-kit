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
  /** 优先级 */
  priority: InterruptPriority
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
  private timedJobs: Map<string, TimedJob & { lastRunDate?: string }> = new Map()
  private intervalJobs: Map<string, IntervalJob> = new Map()
  private eventJobs: Map<string, EventJob & { lastCheckAt?: number }> = new Map()
  private running = false
  private checkThread: any = null
  private currentHandle: TaskHandle | null = null
  private skipRequested = false
  private queueResults: TaskResult[] = []
  private queueStartTime = 0

  /**
   * 注册定时任务
   */
  schedule(job: TimedJob): this {
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

    return this.createQueueHandle(queue)
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

      if (this.skipRequested) {
        this.skipRequested = false
      }

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
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const currentDate = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

    for (const [name, job] of this.timedJobs) {
      if (job.time === currentTime && job.lastRunDate !== currentDate) {
        job.lastRunDate = currentDate
        this.enqueueInterrupt(name, job)
      }
    }
  }

  private checkIntervalJobs(): void {
    const now = Date.now()

    for (const [name, job] of this.intervalJobs) {
      if (job.nextRunAt && now >= job.nextRunAt) {
        job.nextRunAt = now + job.interval
        this.enqueueInterrupt(name, job)
      }
    }
  }

  private checkEventJobs(): void {
    const now = Date.now()

    for (const [name, job] of this.eventJobs) {
      const checkInterval = job.checkInterval ?? 30000
      if (now - (job.lastCheckAt ?? 0) >= checkInterval) {
        job.lastCheckAt = now
        try {
          if (job.condition()) {
            this.enqueueInterrupt(name, job)
          }
        }
        catch (e) {
          log.error(`事件检测异常 [${name}]: ${e}`)
        }
      }
    }
  }

  private enqueueInterrupt(name: string, job: Job): void {
    const request: InterruptRequest = {
      name,
      task: job.task,
      options: job.options,
      priority: job.priority,
    }

    log.info(`触发中断: ${name}`)
    this.runner.addInterrupt(request)
  }

  private createQueueHandle(queue: TaskQueue): QueueHandle {
    const self = this

    return {
      pause() {
        self.currentHandle?.pause()
      },
      resume() {
        self.currentHandle?.resume()
      },
      skip() {
        self.skipRequested = true
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
}

export { Scheduler }
export type { EventJob, IntervalJob, QueueHandle, TimedJob }
