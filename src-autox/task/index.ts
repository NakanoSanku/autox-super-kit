/**
 * 任务框架入口
 */

export { $ } from '../core/matcher'
export { Navigator } from './Navigator'

export { Scheduler } from './Scheduler'
export type { EventJob, IntervalJob, QueueHandle, TimedJob } from './Scheduler'

export { ExecuteResult, Task } from './Task'
export type { RunnerOptions, TaskContext } from './Task'

export { TaskQueue } from './TaskQueue'
export type { QueuedTask, QueueEvents, QueueResult } from './TaskQueue'

export { TaskRunner } from './TaskRunner'

export type { TaskHandle } from './TaskRunner'

export {
  InterruptPriority,
  ExecuteResult as Result,
  RunnerState,
} from './types'

export type {
  InterruptRequest,
  StackFrame,
  TaskEventCallback,
  TaskEventType,
  TaskResult,
  TaskSnapshot,
} from './types'
