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
/** 匹配模板类型 */
type MatchTemplate = Parameters<typeof $>[0]

interface NavigatorConfig {
  /** 主界面标志模板 */
  mainSceneTemplate?: MatchTemplate
  /** 关闭按钮模板列表（支持文本、图片等任意匹配模板） */
  closeTemplates?: MatchTemplate[]
  /** 超时时间(ms) */
  timeout?: number
  /** 每次尝试间隔(ms) */
  interval?: number
}

const defaultConfig: Required<NavigatorConfig> = {
  mainSceneTemplate: { text: '庭院' },
  closeTemplates: [
    { text: '关闭' },
    { text: '取消' },
    { text: '确定' },
    { text: '知道了' },
  ],
  timeout: 5000,
  interval: 500,
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
function ensureStableUI(timeout?: number): boolean {
  const endTime = Date.now() + (timeout ?? config.timeout)

  while (Date.now() < endTime) {
    if ($(config.mainSceneTemplate).exists()) {
      return true
    }

    let closed = false
    for (const template of config.closeTemplates) {
      if ($(template).match().click()) {
        closed = true
        sleep(config.interval)
        break
      }
    }

    if (!closed) {
      sleep(config.interval)
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
function goHome(timeout?: number): boolean {
  const endTime = Date.now() + (timeout ?? config.timeout)

  while (Date.now() < endTime) {
    if ($(config.mainSceneTemplate).exists()) {
      return true
    }

    for (const template of config.closeTemplates) {
      if ($(template).match().click()) {
        sleep(config.interval)
        break
      }
    }

    sleep(config.interval)
  }

  return $(config.mainSceneTemplate).exists()
}

export const Navigator = {
  configure,
  ensureStableUI,
  ensureScene,
  goHome,
}
