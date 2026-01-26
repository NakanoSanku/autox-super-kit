/**
 * 日志模块 - 支持多级别日志、文件写入和 Toast 提示
 * @module logger
 * @description 提供统一的日志记录功能，支持按标签分类、多日志级别、
 *              文件持久化存储以及 Toast 通知等特性
 *
 * @example
 * ```typescript
 * import { createLogger, configure, LogLevel } from './logger'
 *
 * // 配置日志模块
 * configure({
 *   level: LogLevel.DEBUG,
 *   writeToFile: true,
 *   filePath: '/sdcard/logs/'
 * })
 *
 * // 创建带标签的日志记录器
 * const logger = createLogger('MyModule')
 * logger.debug('调试信息')
 * logger.info('普通信息')
 * logger.warn('警告信息')
 * logger.error('错误信息')
 * ```
 */

import { defaultLogConfig, LogConfig, LogLevel } from './config'

/** 线程锁，用于保证日志文件写入的线程安全 */
const logLock = threads.lock()


/** 当前日志配置，从默认配置初始化 */
const config: LogConfig = { ...defaultLogConfig }

/**
 * 数字补零
 * @param num - 要补零的数字
 * @param len - 目标长度
 * @returns 补零后的字符串
 * @internal
 */
function padZero(num: number, len = 2): string {
  return (`000${num}`).slice(-len)
}

/**
 * 格式化当前时间
 * @returns 格式化的时间字符串，格式为 YYYY-MM-DD HH:mm:ss.SSS
 * @internal
 */
function formatTime(): string {
  const d = new Date()
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())} ${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}.${padZero(d.getMilliseconds(), 3)}`
}

/**
 * 获取日志级别名称
 * @param level - 日志级别枚举值
 * @returns 日志级别的字符串名称
 * @internal
 */
function getLevelName(level: LogLevel): string {
  const names: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.NONE]: 'NONE',
  }
  return names[level] ?? 'UNKNOWN'
}

/**
 * 将日志消息写入文件
 * @description 线程安全的文件写入操作，支持自动创建目录和日志轮转
 * @param message - 要写入的完整日志消息
 * @internal
 */
function writeLogToFile(message: string): void {
  if (!config.writeToFile)
    return

  logLock.lock()
  try {
    const dir = files.path(config.filePath)
    if (!files.exists(dir)) {
      files.createWithDirs(`${dir}/`)
    }

    const fullPath = files.join(dir, config.fileName)
    const file = new java.io.File(fullPath)
    if (file.exists() && file.length() > config.maxFileSize) {
      const backupPath = `${fullPath}.bak`
      if (files.exists(backupPath))
        files.remove(backupPath)
      files.rename(fullPath, backupPath)
    }

    files.append(fullPath, `${message}\n`)
  }
  catch (e) {
    console.error(`写入日志文件失败: ${e}`)
  }
  finally {
    logLock.unlock()
  }
}

/** 控制台输出方法类型 */
type ConsoleMethod = 'verbose' | 'info' | 'warn' | 'error'

/** 日志级别到控制台方法的映射 */
const consoleMethods: Record<LogLevel, ConsoleMethod | null> = {
  [LogLevel.DEBUG]: 'verbose',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARN]: 'warn',
  [LogLevel.ERROR]: 'error',
  [LogLevel.NONE]: null,
}

/**
 * 执行日志记录
 * @description 根据配置输出日志到控制台、Toast 和文件
 * @param level - 日志级别
 * @param tag - 日志标签，用于标识日志来源模块
 * @param message - 日志消息内容
 * @internal
 */
function doLog(level: LogLevel, tag: string, message: string): void {
  if (level < config.level)
    return

  const levelName = getLevelName(level)
  const timestamp = formatTime()
  const fullMessage = `[${timestamp}] [${levelName}] [${tag}] ${message}`

  const method = consoleMethods[level]
  if (method) {
    console[method](fullMessage)
  }

  if (config.showToast && level >= LogLevel.WARN) {
    toast(`${levelName}: ${message}`)
  }

  writeLogToFile(fullMessage)
}

/**
 * 日志记录器接口
 * @description 提供四个日志级别的记录方法
 */
interface Logger {
  /**
   * 记录调试级别日志
   * @param msg - 日志消息
   */
  debug: (msg: string) => void

  /**
   * 记录信息级别日志
   * @param msg - 日志消息
   */
  info: (msg: string) => void

  /**
   * 记录警告级别日志
   * @param msg - 日志消息
   */
  warn: (msg: string) => void

  /**
   * 记录错误级别日志
   * @param msg - 日志消息
   */
  error: (msg: string) => void
}

/**
 * 创建日志记录器
 * @description 创建一个带有指定标签的日志记录器实例
 * @param tag - 日志标签，用于标识日志来源模块
 * @returns 日志记录器实例
 *
 * @example
 * ```typescript
 * const logger = createLogger('AuthModule')
 * logger.info('用户登录成功')
 * logger.error('认证失败')
 * ```
 */
function createLogger(tag: string): Logger {
  return {
    debug: (msg: string) => doLog(LogLevel.DEBUG, tag, msg),
    info: (msg: string) => doLog(LogLevel.INFO, tag, msg),
    warn: (msg: string) => doLog(LogLevel.WARN, tag, msg),
    error: (msg: string) => doLog(LogLevel.ERROR, tag, msg),
  }
}

/**
 * 配置日志模块
 * @description 动态更新日志模块的配置选项
 * @param options - 部分配置选项，只更新指定的配置项
 *
 * @example
 * ```typescript
 * // 启用文件写入并设置为 INFO 级别
 * configure({
 *   level: LogLevel.INFO,
 *   writeToFile: true,
 *   filePath: '/sdcard/my_app/logs/',
 *   fileName: 'debug.log'
 * })
 *
 * // 启用 Toast 提示
 * configure({ showToast: true })
 * ```
 */
function configure(options: Partial<LogConfig>): void {
  if (options.level !== undefined)
    config.level = options.level
  if (options.showToast !== undefined)
    config.showToast = options.showToast
  if (options.writeToFile !== undefined)
    config.writeToFile = options.writeToFile
  if (options.filePath !== undefined)
    config.filePath = options.filePath
  if (options.fileName !== undefined)
    config.fileName = options.fileName
  if (options.maxFileSize !== undefined)
    config.maxFileSize = options.maxFileSize
}

export {
  configure,
  createLogger,
  LogLevel,
}

export type {
  LogConfig,
}
