/**
 * 日志模块 - 支持多级别日志、文件写入和 Toast 提示
 */

import { defaultLogConfig } from './config'

const logLock = threads.lock()

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogConfig {
  level: LogLevel
  showToast: boolean
  writeToFile: boolean
  filePath: string
  fileName: string
  maxFileSize: number
}

const config: LogConfig = { ...defaultLogConfig }

function padZero(num: number, len = 2): string {
  return (`000${num}`).slice(-len)
}

function formatTime(): string {
  const d = new Date()
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())} ${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}.${padZero(d.getMilliseconds(), 3)}`
}

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

type ConsoleMethod = 'verbose' | 'info' | 'warn' | 'error'

const consoleMethods: Record<LogLevel, ConsoleMethod | null> = {
  [LogLevel.DEBUG]: 'verbose',
  [LogLevel.INFO]: 'info',
  [LogLevel.WARN]: 'warn',
  [LogLevel.ERROR]: 'error',
  [LogLevel.NONE]: null,
}

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

interface Logger {
  debug: (msg: string) => void
  info: (msg: string) => void
  warn: (msg: string) => void
  error: (msg: string) => void
}

function createLogger(tag: string): Logger {
  return {
    debug: (msg: string) => doLog(LogLevel.DEBUG, tag, msg),
    info: (msg: string) => doLog(LogLevel.INFO, tag, msg),
    warn: (msg: string) => doLog(LogLevel.WARN, tag, msg),
    error: (msg: string) => doLog(LogLevel.ERROR, tag, msg),
  }
}

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

