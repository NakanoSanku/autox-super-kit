/**
 * 任务基类
 */

import type { EnterReason, LeaveReason, RunnerOptions, SceneConfig, TaskContext } from './types'
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
   * 场景配置（声明式导航）
   * 定义目标场景和导航步骤，Runner 会自动处理场景进入
   */
  static sceneConfig?: SceneConfig

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
   * 用于调用可中断的 sleep/waitUntil/clickUntilGone
   */
  protected runner!: {
    sleep: (ms: number) => void
    waitUntil: (condition: () => boolean, timeout?: number, interval?: number) => boolean
    clickUntilGone: (clickFn: () => boolean, interval?: number) => boolean
  }

  /**
   * 进入任务时调用（可选）
   * @param reason - 进入原因：'start' 首次启动 | 'resume' 从中断恢复
   */
  onEnter?(reason: EnterReason): void

  /**
   * 单次循环体逻辑
   * @returns 执行结果，决定是否继续/成功/停止
   */
  abstract execute(): ExecuteResult

  /**
   * 离开任务时调用（可选）
   * @param reason - 离开原因：'complete' 正常完成 | 'suspend' 被中断挂起 | 'stop' 外部停止 | 'error' 发生错误
   */
  onLeave?(reason: LeaveReason): void

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
