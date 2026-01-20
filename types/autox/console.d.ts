/**
 * 控制台模块，提供调试输出功能
 */
interface ConsoleLogConfig {
  /** 日志文件路径 */
  file?: string
  /** 最大文件大小，单位字节，默认为 512KB */
  maxFileSize?: number
  /** 写入的日志级别，默认为 "ALL" */
  rootLevel?: 'ALL' | 'OFF' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  /** 日志备份文件最大数量，默认为 5 */
  maxBackupSize?: number
  /** 日志写入格式 */
  filePattern?: string
}

interface Console {
  /**
   * 显示控制台悬浮窗
   * @param autoHide 程序结束时是否自动隐藏控制台，默认 false
   */
  show(autoHide?: boolean): void

  /** 隐藏控制台悬浮窗 */
  hide(): void

  /** 清空控制台 */
  clear(): void

  /**
   * 打印日志到控制台
   * @param data 主要信息
   * @param args 其他参数
   */
  log(data?: any, ...args: any[]): void

  /**
   * 输出灰色字体的详细信息
   * @param data 主要信息
   * @param args 其他参数
   */
  verbose(data?: any, ...args: any[]): void

  /**
   * 输出绿色字体的重要信息
   * @param data 主要信息
   * @param args 其他参数
   */
  info(data?: any, ...args: any[]): void

  /**
   * 输出蓝色字体的警告信息
   * @param data 主要信息
   * @param args 其他参数
   */
  warn(data?: any, ...args: any[]): void

  /**
   * 输出红色字体的错误信息
   * @param data 主要信息
   * @param args 其他参数
   */
  error(data?: any, ...args: any[]): void

  /**
   * 断言，如果 value 为 false 则输出错误信息并停止脚本
   * @param value 要断言的布尔值
   * @param message value 为 false 时要输出的信息
   */
  assert(value: any, message?: string): void

  /**
   * 启动一个计时器
   * @param label 计时器标签
   */
  time(label?: string): void

  /**
   * 停止计时器并打印结果
   * @param label 计时器标签
   */
  timeEnd(label: string): void

  /**
   * 打印日志和调用栈信息
   * @param data 主要信息
   * @param args 其他参数
   */
  trace(data?: any, ...args: any[]): void

  /**
   * 输出信息并等待输入，输入的字符串用 eval 计算后返回
   * @param data 主要信息
   * @param args 其他参数
   */
  input(data?: any, ...args: any[]): any

  /**
   * 输出信息并等待输入，直接返回输入的字符串
   * @param data 主要信息
   * @param args 其他参数
   */
  rawInput(data?: any, ...args: any[]): string

  /**
   * 设置控制台大小
   * @param w 宽度，单位像素
   * @param h 高度，单位像素
   */
  setSize(w: number, h: number): void

  /**
   * 设置控制台位置
   * @param x 横坐标，单位像素
   * @param y 纵坐标，单位像素
   */
  setPosition(x: number, y: number): void

  /**
   * 设置日志保存的路径和配置
   * @param config 日志配置
   */
  setGlobalLogConfig(config: ConsoleLogConfig): void

  /**
   * 设置标题名称、字体颜色、标题栏高度
   * @param title 标题
   * @param color 颜色值 #AARRGGBB
   * @param size 标题高度，单位 dp
   */
  setTitle(title: string, color?: string, size?: number): void

  /**
   * 设置 log 字号大小
   * @param size 字号大小，单位 dp 或 sp
   */
  setLogSize(size: number): void

  /**
   * 控制 console 是否可以输入文字
   * @param can true 可以输入，false 不可以输入
   */
  setCanInput(can: boolean): void

  /**
   * 设置 console 背景色
   * @param color 颜色值 #AARRGGBB
   */
  setBackgroud(color: string): void

  /**
   * 设置 console 背景色
   * @param color 颜色值 #AARRGGBB
   */
  setBackground(color: string): void

  /**
   * 设置 console 显示最大行数
   * @param maxLines 最大行数，默认 -1 不限制
   */
  setMaxLines(maxLines: number): void
}

declare const console: Console

/**
 * 打印到控制台，相当于 log(text)
 * @param text 要打印的信息
 */
declare function print(text: string | object): void
