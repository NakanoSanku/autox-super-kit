/**
 * 统一导航层
 */

import type { Task } from './Task'
import { createLogger } from '../core/logger'
import { $ } from '../core/matcher'

const log = createLogger('Navigator')

/**
 * 导航器配置
 */
interface NavigatorConfig {
  /** 主界面标志模板 */
  mainSceneTemplate?: Parameters<typeof $>[0]
  /** 关闭按钮文本列表 */
  closeTexts?: string[]
  /** 最大尝试次数 */
  maxAttempts?: number
  /** 每次尝试间隔(ms) */
  attemptInterval?: number
}

const defaultConfig: Required<NavigatorConfig> = {
  mainSceneTemplate: { text: '庭院' },
  closeTexts: ['关闭', '取消', '确定', '知道了'],
  maxAttempts: 5,
  attemptInterval: 500,
}

let config: Required<NavigatorConfig> = { ...defaultConfig }

/**
 * 配置导航器
 */
function configure(options: NavigatorConfig): void {
  config = { ...config, ...options }
}

/**
 * 确保 UI 稳定（关闭弹窗、回到主界面）
 */
function ensureStableUI(maxAttempts?: number): boolean {
  const attempts = maxAttempts ?? config.maxAttempts

  for (let i = 0; i < attempts; i++) {
    let closed = false

    for (const text of config.closeTexts) {
      if ($({ text }).match().click()) {
        closed = true
        sleep(config.attemptInterval)
        break
      }
    }

    if (!closed) {
      if ($(config.mainSceneTemplate).exists()) {
        return true
      }

      back()
      sleep(config.attemptInterval)
    }
  }

  return $(config.mainSceneTemplate).exists()
}

/**
 * 确保任务在正确场景
 */
function ensureScene(task: Task): boolean {
  if (task.isInScene?.()) {
    return true
  }

  log.info('尝试恢复任务场景')

  if (!ensureStableUI()) {
    log.warn('无法回到主界面')
    return false
  }

  try {
    task.entryScene?.()
  }
  catch (e) {
    log.error(`导航到任务场景失败: ${e}`)
    return false
  }

  return task.isInScene?.() ?? true
}

/**
 * 返回主界面
 */
function goHome(maxAttempts?: number): boolean {
  const attempts = maxAttempts ?? config.maxAttempts

  for (let i = 0; i < attempts; i++) {
    if ($(config.mainSceneTemplate).exists()) {
      return true
    }

    for (const text of config.closeTexts) {
      if ($({ text }).match().click()) {
        sleep(config.attemptInterval)
        break
      }
    }

    back()
    sleep(config.attemptInterval)
  }

  return $(config.mainSceneTemplate).exists()
}

export const Navigator = {
  configure,
  ensureStableUI,
  ensureScene,
  goHome,
}
