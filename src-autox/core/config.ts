/**
 * 框架默认配置
 * 集中管理所有模块的默认参数
 */

import type { LogConfig } from './logger'
import { LogLevel } from './logger'

/** 日志模块默认配置 */
export const defaultLogConfig: LogConfig = {
  level: LogLevel.DEBUG,
  showToast: false,
  writeToFile: false,
  filePath: '/sdcard/autojs_logs/',
  fileName: 'app.log',
  maxFileSize: 5 * 1024 * 1024,
}

/** 图片缓存模块配置 */
export interface ImageCacheConfig {
  /** 缓存超时时间 (ms) */
  timeout: number
  /** 自动清理间隔 (ms) */
  cleanupInterval: number
}

export const defaultImageCacheConfig: ImageCacheConfig = {
  timeout: 60 * 1000,
  cleanupInterval: 30 * 1000,
}

/** 人类化交互配置 */
export interface ActionConfig {
  /** 点击标准差系数 (0-1) */
  clickSigma: number
  /** 默认点击后延迟 (ms) */
  clickDelay: number
  /** 滑动默认步数 */
  swipeSteps: number
  /** 滑动默认延迟 (ms) */
  swipeDelay: number
}

export const defaultActionConfig: ActionConfig = {
  clickSigma: 0.2,
  clickDelay: 0,
  swipeSteps: 10,
  swipeDelay: 0,
}