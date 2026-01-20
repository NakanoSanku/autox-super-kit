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
