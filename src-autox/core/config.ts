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

/** 模板匹配基础配置 */
export interface MatcherConfig {
  /** 默认匹配阈值 (0-1) */
  threshold: number
  /** 默认等待超时时间 (ms) */
  waitTimeout: number
  /** 默认等待间隔时间 (ms) */
  waitInterval: number
}

export const defaultMatcherConfig: MatcherConfig = {
  threshold: 0.9,
  waitTimeout: 5000,
  waitInterval: 500,
}

/** OCR 模块配置 */
export interface OcrConfig {
  /** 自定义模型路径，设置后 cpuThreadNum 和 useSlim 将被忽略 */
  modelPath: string | null
  /** 默认 CPU 核心数量 */
  cpuThreadNum: number
  /** 是否使用快速模型 */
  useSlim: boolean
}

export const defaultOcrConfig: OcrConfig = {
  modelPath: null,
  cpuThreadNum: 4,
  useSlim: true,
}