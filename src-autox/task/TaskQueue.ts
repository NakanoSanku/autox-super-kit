/**
 * 任务队列
 */

import type { Task } from './Task'
import type { RunnerOptions, TaskResult } from './types'

/**
 * 队列中的任务项
 */
interface QueuedTask {
  task: Task
  options?: RunnerOptions
}

/**
 * 队列结果
 */
interface QueueResult {
  /** 各任务结果 */
  results: TaskResult[]
  /** 总耗时 */
  totalDuration: number
  /** 完成的任务数 */
  completedCount: number
}

/**
 * 队列事件回调
 */
interface QueueEvents {
  /** 任务开始 */
  onTaskStart?: (task: Task, index: number) => void
  /** 任务结束 */
  onTaskEnd?: (task: Task, result: TaskResult, index: number) => void
  /** 队列完成 */
  onQueueEnd?: (result: QueueResult) => void
}

/**
 * 任务队列
 */
class TaskQueue {
  private queue: QueuedTask[] = []
  private _currentIndex = 0
  private events: QueueEvents

  constructor(events?: QueueEvents) {
    this.events = events ?? {}
  }

  /**
   * 添加任务到队列
   */
  add(task: Task, options?: RunnerOptions): this {
    this.queue.push({ task, options })
    return this
  }

  /**
   * 批量添加任务
   */
  addAll(tasks: QueuedTask[]): this {
    this.queue.push(...tasks)
    return this
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
    this._currentIndex = 0
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length
  }

  /**
   * 获取当前任务索引
   */
  get currentIndex(): number {
    return this._currentIndex
  }

  /**
   * 获取队列中的任务
   */
  getTasks(): readonly QueuedTask[] {
    return this.queue.slice()
  }

  /**
   * 获取事件回调
   */
  getEvents(): QueueEvents {
    return this.events
  }

  /**
   * 设置当前索引（由 Runner 调用）
   * @internal
   */
  _setCurrentIndex(index: number): void {
    this._currentIndex = index
  }

  /**
   * 重置队列状态
   */
  reset(): void {
    this._currentIndex = 0
  }
}

export { TaskQueue }
export type { QueuedTask, QueueEvents, QueueResult }
