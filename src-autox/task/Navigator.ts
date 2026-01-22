/**
 * 统一导航层
 */

import type { TemplateFactoryOptions } from '../core/matcher'
import type { Task } from './Task'
import { createLogger } from '../core/logger'
import { $ } from '../core/matcher'

const log = createLogger('Navigator')

/**
 * 导航器配置
 */
interface NavigatorConfig {
  /** 主界面标志模板 */
  mainSceneTemplate?: TemplateFactoryOptions
  /** 关闭按钮模板列表（支持文本、图片、多点找色等任意匹配模板） */
  closeTemplates?: TemplateFactoryOptions[]
  /** 超时时间(ms) */
  timeout?: number
  /** 每次尝试间隔(ms) */
  interval?: number
}

const defaultConfig: Required<NavigatorConfig> = {
  mainSceneTemplate: { templatePath: './assets/庭院_封.png' },
  closeTemplates: [
    { templatePath: './assets/探索_退出_确认.png' },
    { templatePath: './assets/探索_章节_关闭.png' },
    { templatePath: './assets/结界突破_关闭.png' },
    { templatePath: './assets/结界卡_关闭.png' },
    { templatePath: './assets/日常_关闭.png' },
    { templatePath: './assets/六道之门_返回.png' },
    { templatePath: './assets/寄养_返回.png' },
    { templatePath: './assets/式神录_升级_返回.png' },
    { templatePath: './assets/式神录_御魂方案_返回.png' },
    { templatePath: './assets/探索_返回.png' },
    { templatePath: './assets/式神录_返回.png' }, 
    { templatePath: './assets/町中_庭院.png' },
  ],
  timeout: 5 * 60 * 1000,
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
  const actualTimeout = timeout ?? config.timeout
  const endTime = Date.now() + actualTimeout
  log.info(`ensureStableUI 开始, timeout=${actualTimeout}ms`)

  let iteration = 0
  while (Date.now() < endTime) {
    iteration++
    const remaining = endTime - Date.now()
    log.debug(`迭代 #${iteration}, 剩余时间=${remaining}ms`)

    log.debug(`检查主界面模板: ${JSON.stringify(config.mainSceneTemplate)}`)
    if ($(config.mainSceneTemplate).exists()) {
      log.info(`主界面已找到, 迭代 #${iteration}`)
      return true
    }
    log.debug('主界面未找到, 尝试关闭弹窗')

    let closed = false
    for (let i = 0; i < config.closeTemplates.length; i++) {
      const template = config.closeTemplates[i]
      log.debug(`尝试关闭模板 [${i}]: ${JSON.stringify(template)}`)
      const matchResult = $(template).match()
      if (matchResult.click()) {
        log.info(`成功点击关闭模板 [${i}]: ${JSON.stringify(template)}`)
        closed = true
        sleep(config.interval)
        break
      }
    }

    if (!closed) {
      log.debug(`本次迭代未找到可关闭弹窗, 等待 ${config.interval}ms`)
      sleep(config.interval)
    }
  }

  log.warn('ensureStableUI 超时, 最终检查主界面')
  const finalResult = $(config.mainSceneTemplate).exists()
  log.info(`最终结果: ${finalResult}`)
  return finalResult
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

export const Navigator = {
  configure,
  ensureStableUI,
  ensureScene
}
