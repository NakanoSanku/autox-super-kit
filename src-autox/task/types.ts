/**
 * 任务框架类型定义
 */

import type { Task } from './Task'

/**
 * 任务执行结果
 */
export enum ExecuteResult {
  /** 继续下一次循环 */
  CONTINUE,
  /** 本次成功，计数+1，继续循环 */
  SUCCESS,
  /** 停止任务 */
  STOP,
  /** 发生错误，停止任务 */
  ERROR,
}

/**
 * 运行器状态
 */
export enum RunnerState {
  /** 空闲 */
  IDLE,
  /** 运行中 */
  RUNNING,
  /** 已暂停 */
  PAUSED,
  /** 已停止（外部调用 stop） */
  STOPPED,
  /** 已完成（自然结束） */
  FINISHED,
}

/**
 * 中断优先级
 */
export enum InterruptPriority {
  /** 低优先级，队列末尾 */
  LOW = 0,
  /** 普通优先级 */
  NORMAL = 1,
  /** 高优先级，队列前部 */
  HIGH = 2,
  /** 紧急，立即执行（下一个 checkpoint） */
  URGENT = 3,
}

/**
 * 任务上下文
 */
export interface TaskContext {
  /** 当前成功次数 */
  count: number
  /** 目标执行次数 */
  times: number
  /** 总循环次数 */
  loops: number
  /** 任务开始时间 */
  startTime: number
  /** 自定义参数 */
  params: Record<string, any>
}

/**
 * 运行器选项
 */
export interface RunnerOptions {
  /** 执行次数，默认无限 */
  times?: number
  /** 循环间隔(ms)，默认 800 */
  interval?: number
  /** 自定义参数 */
  params?: Record<string, any>
}

/**
 * 任务结果
 */
export interface TaskResult {
  /** 成功执行次数 */
  successCount: number
  /** 总循环次数 */
  totalLoops: number
  /** 耗时(ms) */
  duration: number
  /** 停止原因 */
  reason: 'completed' | 'stopped' | 'error'
  /** 错误信息（如果有） */
  error?: Error
}

/**
 * 任务状态快照
 */
export interface TaskSnapshot {
  /** 任务类名（用于验证） */
  taskName: string
  /** 运行选项 */
  options: RunnerOptions
  /** Runner 上下文 */
  context: TaskContext
  /** 任务内部状态（只包含 stateKeys 声明的字段） */
  state: Record<string, any>
}

/**
 * 栈帧（用于中断恢复）
 */
export interface StackFrame {
  /** 任务实例 */
  task: Task
  /** 运行选项 */
  options: RunnerOptions
  /** 上下文 */
  context: TaskContext
  /** 任务状态 */
  state: Record<string, any>
}

/**
 * 中断请求
 */
export interface InterruptRequest {
  /** 任务名称 */
  name: string
  /** 要执行的任务 */
  task: Task
  /** 任务选项 */
  options?: RunnerOptions
  /** 优先级 */
  priority: InterruptPriority
}

/**
 * 任务事件类型
 */
export type TaskEventType = 'start' | 'loop' | 'success' | 'pause' | 'resume' | 'stop' | 'error' | 'finish'

/**
 * 进入任务的原因
 */
export enum EnterReason {
  /** 首次启动 */
  START = 'start',
  /** 从中断恢复 */
  RESUME = 'resume',
}

/**
 * 离开任务的原因
 */
export enum LeaveReason {
  /** 正常完成 */
  COMPLETE = 'complete',
  /** 被中断挂起 */
  SUSPEND = 'suspend',
  /** 外部停止 */
  STOP = 'stop',
  /** 发生错误 */
  ERROR = 'error',
}

/**
 * 事件回调
 */
export type TaskEventCallback = (data?: any) => void
