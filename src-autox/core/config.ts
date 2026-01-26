/**
 * 框架默认配置
 * 集中管理所有模块的默认参数
 */

/**
 * 日志级别枚举
 * @description 定义日志的严重程度级别，数值越大级别越高
 * @enum {number}
 */
export enum LogLevel {
  /** 调试级别 - 最详细的日志信息，用于开发调试 */
  DEBUG = 0,
  /** 信息级别 - 一般性的运行信息 */
  INFO = 1,
  /** 警告级别 - 潜在问题或需要注意的情况 */
  WARN = 2,
  /** 错误级别 - 运行时错误，但程序可以继续运行 */
  ERROR = 3,
  /** 禁用级别 - 禁用所有日志输出 */
  NONE = 4,
}

/**
 * 日志配置接口
 * @description 定义日志模块的可配置选项
 */
export interface LogConfig {
  /**
   * 日志输出级别
   * @description 只有级别大于等于此值的日志才会被输出
   * @default LogLevel.DEBUG
   */
  level: LogLevel

  /**
   * 是否显示 Toast 提示
   * @description 启用后，WARN 及以上级别的日志会显示 Toast 通知
   * @default false
   */
  showToast: boolean

  /**
   * 是否写入文件
   * @description 启用后，日志会被持久化到文件系统
   * @default false
   */
  writeToFile: boolean

  /**
   * 日志文件存储目录路径
   * @default '/sdcard/autojs_logs/'
   */
  filePath: string

  /**
   * 日志文件名
   * @default 'app.log'
   */
  fileName: string

  /**
   * 日志文件最大大小（字节）
   * @description 超过此大小后会自动轮转，旧文件重命名为 .bak
   * @default 5242880 (5MB)
   */
  maxFileSize: number
}

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

export const width = Math.max(device.width, device.height)
export const height = Math.min(device.width, device.height)