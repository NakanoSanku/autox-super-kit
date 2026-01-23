/**
 * 统一导航层
 */

import type { TemplateFactoryOptions } from '../core/matcher'
import type { SceneConfig } from './types'
import { Task } from './Task'
import { createLogger } from '../core/logger'
import { $ } from '../core/matcher'

const log = createLogger('Navigator')

/**
 * 默认配置常量
 */
const DEFAULT_TIMEOUT = 5 * 60 * 1000
const DEFAULT_INTERVAL = 500
const DEFAULT_SCENE_TIMEOUT = 30000
const CHECKPOINT_INTERVAL = 200

/**
 * 主界面场景默认配置
 */
const defaultMainSceneConfig: SceneConfig = {
  targetTemplate: { templatePath: './assets/庭院_封.png' },
  navigationSteps: [
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
  timeout: DEFAULT_TIMEOUT,
  interval: DEFAULT_INTERVAL,
}

let mainSceneConfig: SceneConfig = { ...defaultMainSceneConfig }

/**
 * 可中断 sleep 函数类型
 */
type InterruptibleSleep = (ms: number) => void

/**
 * 停止检查函数类型
 */
type StopChecker = () => boolean

/**
 * 当前活动的停止检查器
 */
let activeStopChecker: StopChecker | null = null

/**
 * 当前活动的可中断 sleep
 */
let activeInterruptibleSleep: InterruptibleSleep | null = null

/**
 * 配置主界面场景
 */
function configure(options: Partial<SceneConfig>): void {
  mainSceneConfig = { ...mainSceneConfig, ...options }
}

/**
 * 设置停止检查器（由 TaskRunner 调用）
 */
function setStopChecker(checker: StopChecker | null): void {
  activeStopChecker = checker
}

/**
 * 设置可中断 sleep（由 TaskRunner 调用）
 */
function setInterruptibleSleep(sleepFn: InterruptibleSleep | null): void {
  activeInterruptibleSleep = sleepFn
}

/**
 * 内部 sleep，支持中断
 */
function interruptibleSleep(ms: number): void {
  if (activeInterruptibleSleep) {
    activeInterruptibleSleep(ms)
  }
  else {
    const endTime = Date.now() + ms
    while (Date.now() < endTime) {
      if (activeStopChecker?.()) {
        return
      }
      const remaining = endTime - Date.now()
      if (remaining > 0) {
        sleep(Math.min(remaining, CHECKPOINT_INTERVAL))
      }
    }
  }
}

/**
 * 检查是否应该停止
 */
function shouldStop(): boolean {
  return activeStopChecker?.() ?? false
}

/**
 * 通用导航函数：循环尝试点击步骤模板直到目标场景出现
 */
function navigateTo(
  targetTemplate: TemplateFactoryOptions,
  steps: TemplateFactoryOptions[],
  timeout: number,
  interval: number,
  logPrefix: string
): boolean {
  const endTime = Date.now() + timeout
  log.info(`${logPrefix} 开始, timeout=${timeout}ms`)

  let iteration = 0
  while (Date.now() < endTime) {
    if (shouldStop()) {
      log.info(`${logPrefix} 被中断停止`)
      return false
    }

    iteration++
    const remaining = endTime - Date.now()
    log.debug(`迭代 #${iteration}, 剩余时间=${remaining}ms`)

    if ($(targetTemplate).exists()) {
      log.info(`${logPrefix} 目标已找到, 迭代 #${iteration}`)
      return true
    }
    log.debug('目标未找到, 尝试点击步骤')

    let clicked = false
    for (let i = 0; i < steps.length; i++) {
      if (shouldStop()) {
        log.info(`${logPrefix} 被中断停止`)
        return false
      }

      const step = steps[i]
      log.debug(`尝试步骤 [${i}]: ${JSON.stringify(step)}`)
      if ($(step).match().click()) {
        log.info(`成功点击步骤 [${i}]: ${JSON.stringify(step)}`)
        clicked = true
        interruptibleSleep(interval)
        break
      }
    }

    if (!clicked) {
      log.debug(`本次迭代未找到可点击步骤, 等待 ${interval}ms`)
      interruptibleSleep(interval)
    }
  }

  log.warn(`${logPrefix} 超时, 最终检查目标`)
  const finalResult = $(targetTemplate).exists()
  log.info(`最终结果: ${finalResult}`)
  return finalResult
}

/**
 * 确保 UI 稳定（关闭弹窗、回到主界面）
 */
function ensureStableUI(timeout?: number): boolean {
  return navigateTo(
    mainSceneConfig.targetTemplate,
    mainSceneConfig.navigationSteps ?? [],
    timeout ?? mainSceneConfig.timeout ?? DEFAULT_TIMEOUT,
    mainSceneConfig.interval ?? DEFAULT_INTERVAL,
    'ensureStableUI'
  )
}

/**
 * 导航到指定场景
 */
function navigateToScene(sceneConfig: SceneConfig): boolean {
  const steps = sceneConfig.navigationSteps ?? []
  if (steps.length === 0) {
    log.info('无导航步骤，检查是否已在目标场景')
    return $(sceneConfig.targetTemplate).exists()
  }

  return navigateTo(
    sceneConfig.targetTemplate,
    steps,
    sceneConfig.timeout ?? DEFAULT_SCENE_TIMEOUT,
    sceneConfig.interval ?? DEFAULT_INTERVAL,
    'navigateToScene'
  )
}

/**
 * 确保任务在正确场景（基于声明式 sceneConfig）
 */
function ensureScene(task: Task): boolean {
  const sceneConfig = (task.constructor as typeof Task).sceneConfig
  if (!sceneConfig) {
    return true
  }

  if ($(sceneConfig.targetTemplate).exists()) {
    log.info('已在目标场景')
    return true
  }

  log.info('尝试导航到任务场景')

  if (!ensureStableUI()) {
    log.warn('无法回到主界面')
    return false
  }

  return navigateToScene(sceneConfig)
}

export const Navigator = {
  configure,
  ensureStableUI,
  ensureScene,
  navigateToScene,
  setStopChecker,
  setInterruptibleSleep,
  DEFAULT_TIMEOUT,
  DEFAULT_INTERVAL,
  DEFAULT_SCENE_TIMEOUT,
}
