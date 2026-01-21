/**
 * 任务基类
 */

import type { RunnerOptions, TaskContext } from './types'
import { createLogger } from '../core/logger'
import { ExecuteResult } from './types'

/**
 * 任务基类
 * @abstract
 */
abstract class Task {
  /**
   * 声明需要保存的状态字段
   * 用于中断恢复，只保存这些字段
   */
  static stateKeys: string[] = []

  /**
   * 任务上下文，由 Runner 注入
   */
  protected ctx!: TaskContext

  /**
   * 日志记录器
   */
  protected log = createLogger(this.constructor.name)

  /**
   * Runner 引用，由 Runner 注入
   * 用于调用可中断的 sleep/waitUntil
   */
  protected runner!: {
    sleep: (ms: number) => void
    waitUntil: (condition: () => boolean, timeout?: number, interval?: number) => boolean
  }

  /**
   * 任务初始化（可选）
   * 在第一次 execute 前调用一次
   */
  setup?(): void

  /**
   * 单次循环体逻辑
   * @returns 执行结果，决定是否继续/成功/停止
   */
  abstract execute(): ExecuteResult

  /**
   * 任务清理（可选）
   * 在任务结束后调用一次
   */
  cleanup?(): void

  /**
   * 检测是否在任务场景内（可选）
   * 用于中断恢复后判断是否需要重新导航
   */
  isInScene?(): boolean

  /**
   * 导航到任务入口场景（可选）
   * 用于中断恢复后重新进入任务场景
   */
  entryScene?(): void

  /**
   * 获取任务状态（只包含 stateKeys 声明的字段）
   * @returns 状态对象
   */
  getState(): Record<string, any> {
    const keys = (this.constructor as typeof Task).stateKeys
    const state: Record<string, any> = {}
    for (const key of keys) {
      state[key] = (this as any)[key]
    }
    return state
  }

  /**
   * 恢复任务状态
   * @param state - 状态对象
   */
  setState(state: Record<string, any>): void {
    const keys = (this.constructor as typeof Task).stateKeys
    for (const key of keys) {
      if (key in state) {
        (this as any)[key] = state[key]
      }
    }
  }

  /**
   * 注入上下文（由 Runner 调用）
   * @internal
   */
  _injectContext(ctx: TaskContext): void {
    this.ctx = ctx
  }

  /**
   * 注入 Runner 引用（由 Runner 调用）
   * @internal
   */
  _injectRunner(runner: Task['runner']): void {
    this.runner = runner
  }
}

export { ExecuteResult, Task }
export type { RunnerOptions, TaskContext }
