// 本地存储 Storages
declare let storages: {
  /**
   * 创建一个本地存储并返回一个 Storage 对象
   * @param name 本地存储名称
   */
  create: (name: string) => Storage
  /**
   * 删除一个本地存储以及他的全部数据
   * @param name 本地存储名称
   * @returns 如果该存储不存在，返回 false；否则返回 true
   */
  remove: (name: string) => boolean
}

interface Storage {
  /**
   * 从本地存储中取出键值为 key 的数据并返回
   * @param key 键值
   * @param defaultValue 默认值
   */
  get: <T = any>(key: string, defaultValue?: T) => T
  /**
   * 把值 value 保存到本地存储中
   * @param key 键值
   * @param value 值 (可以是 number, boolean, string, Object, Array)
   */
  put: (key: string, value: any) => void
  /**
   * 移除键值为 key 的数据
   * @param key 键值
   */
  remove: (key: string) => void
  /**
   * 返回该本地存储是否包含键值为 key 的数据
   * @param key 键值
   */
  contains: (key: string) => boolean
  /** 移除该本地存储的所有数据 */
  clear: () => void
}

/**
 * 日志配置
 */
interface GlobalLogConfig {
  /** 日志文件路径，将会把日志写入该文件中 */
  file?: string
  /** 最大文件大小，单位字节，默认为 512 * 1024 (512KB) */
  maxFileSize?: number
  /** 写入的日志级别，默认为 "ALL"（所有日志），可以为 "OFF", "DEBUG", "INFO", "WARN", "ERROR", "FATAL" 等 */
  rootLevel?: 'ALL' | 'OFF' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  /** 日志备份文件最大数量，默认为 5 */
  maxBackupSize?: number
  /** 日志写入格式 */
  filePattern?: string
}

// 控制台 Console
declare let console: {
  /**
   * 显示控制台。这会显示一个控制台的悬浮窗 (需要悬浮窗权限)
   * @param autoHide 是否自动隐藏，默认 false。当程序结束的时候是否自动隐藏控制台
   */
  show: (autoHide?: boolean) => void
  /** 隐藏控制台悬浮窗 */
  hide: () => void
  /** 清空控制台 */
  clear: () => void
  /**
   * 打印到控制台，并带上换行符
   * @param data 主要信息
   * @param args 代替值参数
   */
  log: (data?: any, ...args: any[]) => void
  /**
   * 与 console.log 类似，但输出结果以灰色字体显示。输出优先级低于 log
   */
  verbose: (data?: any, ...args: any[]) => void
  /**
   * 与 console.log 类似，但输出结果以绿色字体显示。输出优先级高于 log
   */
  info: (data?: any, ...args: any[]) => void
  /**
   * 与 console.log 类似，但输出结果以蓝色字体显示。输出优先级高于 info
   */
  warn: (data?: any, ...args: any[]) => void
  /**
   * 与 console.log 类似，但输出结果以红色字体显示。输出优先级高于 warn
   */
  error: (data?: any, ...args: any[]) => void
  /**
   * 断言。如果 value 为 false 则输出错误信息 message 并停止脚本运行
   * @param value 要断言的布尔值
   * @param message value 为 false 时要输出的信息
   */
  assert: (value: any, message: string) => void
  /**
   * 启动一个计时器，用以计算一个操作的持续时间
   * @param label 计时器标签，可省略
   */
  time: (label?: string) => void
  /**
   * 停止之前通过调用 console.time() 启动的定时器，并打印结果到控制台
   * @param label 计时器标签
   */
  timeEnd: (label: string) => void
  /**
   * 与 console.log 类似，同时会打印出调用这个函数所在的调用栈信息
   */
  trace: (data?: any, ...args: any[]) => void
  /**
   * 与 console.log 一样输出信息，并在控制台显示输入框等待输入。
   * 按控制台的确认按钮后会将输入的字符串用 eval 计算后返回
   */
  input: (data: any, ...args: any[]) => any
  /**
   * 与 console.log 一样输出信息，并在控制台显示输入框等待输入。
   * 按控制台的确认按钮后会将输入的字符串直接返回
   */
  rawInput: (data: any, ...args: any[]) => string
  /**
   * 设置控制台的大小，单位像素
   * @param w 宽度
   * @param h 高度
   */
  setSize: (w: number, h: number) => void
  /**
   * 设置控制台的位置，单位像素
   * @param x 横坐标
   * @param y 纵坐标
   */
  setPosition: (x: number, y: number) => void
  /**
   * 设置日志保存的路径和配置
   * @param config 日志配置
   */
  setGlobalLogConfig: (config: GlobalLogConfig) => void
  /**
   * 设置标题名称，字体颜色，标题栏高度
   * @param title 标题
   * @param color 颜色值 #AARRGGBB
   * @param size 标题高度，字号会随高度变化，单位是 dp
   */
  setTitle: (title: string, color?: string, size?: number) => void
  /**
   * 设置 log 字号大小
   * @param size 字号大小，单位是 dp 或 sp，20 以内比较合适
   */
  setLogSize: (size: number) => void
  /**
   * 控制 console 是否可以输入文字
   * @param can true 或 false
   */
  setCanInput: (can: boolean) => void
  /**
   * 设置 console 背景色，需要在显示控制台之后才能设置
   * @param color 颜色值 #AARRGGBB
   */
  setBackgroud: (color: string) => void
  /**
   * 设置 console 背景色，需要在显示控制台之后才能设置
   * @param color 颜色值 #AARRGGBB
   */
  setBackground: (color: string) => void
  /**
   * 设置 console 显示最大行数，默认 -1 不限
   * @param maxLines 最大行数
   */
  setMaxLines: (maxLines: number) => void
}

declare let print

// 画布 Canvas
declare let canvas: any

declare class Paint {
  static STYLE: {
    FILL: any
    STROKE: any
    FILL_AND_STROKE: any
  }
  constructor()
  setStyle(style: any): void
  setColor(color: number | string): void
  setStrokeWidth(width: number): void
  setAntiAlias(aa: boolean): void
  setTextSize(size: number): void
  [x: string]: any
}

// OCR 文字识别

/** OCR 识别结果项 */
interface OcrResult {
  /** 识别文字的边界框 */
  bounds: {
    bottom: number
    left: number
    right: number
    top: number
  }
  /** 置信度 0-1 */
  confidence: number
  /** 推理时间 */
  inferenceTime: number
  /** 预处理时间 */
  preprocessTime: number
  /** 识别的文本 */
  text: string
  /** 识别的文字 */
  words: string
}

/** Paddle OCR 模块 */
declare let paddle: {
  /**
   * 使用自定义模型进行文字识别
   * @param img 图片
   * @param path 自定义模型路径，必须是绝对路径
   */
  ocr(img: any, path: string): OcrResult[]
  /**
   * 高精度识别，返回值包含坐标，置信度
   * @param img 图片
   * @param cpuThreadNum 识别使用的 CPU 核心数量，默认 4
   * @param useSlim 加载的模型，true 为快速模型，false 为精准模型
   */
  ocr(img: any, cpuThreadNum?: number, useSlim?: boolean): OcrResult[]
  /**
   * 只返回文本识别信息
   * @param img 图片
   * @param cpuThreadNum 识别使用的 CPU 核心数量，默认 4
   * @param useSlim 加载的模型，true 为快速模型，false 为精准模型
   */
  ocrText(img: any, cpuThreadNum?: number, useSlim?: boolean): string[]
  /** 释放 native 内存 */
  release(): void
}

/** Google ML Kit OCR 模块 */
declare let gmlkit: {
  /**
   * 使用 Google ML Kit 进行文字识别
   * @param img 图片
   * @param language 识别语言: la(拉丁), zh(中文), sa(梵文), ja(日语), ko(韩语) 等
   */
  ocr(img: any, language: 'la' | 'zh' | 'sa' | 'ja' | 'ko' | string): { text: string; [key: string]: any }
}

declare class TessBaseAPI {
  constructor(...p: any[])
  [x: string]: any
}

declare let com: any

// Base64
declare let $base64: {
  /**
   * 将字符串使用 Base64 编码并返回编码后的字符串
   * @param str 要编码的字符串
   * @param encoding 字符编码，默认 utf-8
   */
  encode(str: string, encoding?: string): string
  /**
   * 将字符串使用 Base64 解码并返回解码后的字符串
   * @param str 要解码的字符串
   * @param encoding 字符编码，默认 utf-8
   */
  decode(str: string, encoding?: string): string
}

// 消息处理 (加密，摘要) Crypto

/** 加密密钥 */
declare class CryptoKey {
  constructor(key: string | any)
  [x: string]: any
}

/** 密钥对 */
interface KeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

/** 加密/解密选项 */
interface CryptoOptions {
  /** 输入类型: 'string' | 'base64' | 'hex' | 'file' */
  input?: 'string' | 'base64' | 'hex' | 'file'
  /** 输出类型: 'string' | 'base64' | 'hex' */
  output?: 'string' | 'base64' | 'hex'
}

declare let $crypto: {
  /** 创建密钥 */
  Key: typeof CryptoKey
  /**
   * 加密数据
   * @param data 要加密的数据
   * @param key 密钥
   * @param algorithm 算法，如 "AES/ECB/PKCS5padding", "RSA/ECB/PKCS1padding"
   * @param options 选项
   */
  encrypt(data: string | any, key: CryptoKey, algorithm: string, options?: CryptoOptions): any
  /**
   * 解密数据
   * @param data 要解密的数据
   * @param key 密钥
   * @param algorithm 算法
   * @param options 选项
   */
  decrypt(data: any, key: CryptoKey, algorithm: string, options?: CryptoOptions): any
  /**
   * 生成密钥对
   * @param algorithm 算法，如 "RSA"
   */
  generateKeyPair(algorithm: string): KeyPair
  /**
   * 计算消息摘要
   * @param data 要计算摘要的数据
   * @param algorithm 算法，如 "MD5", "SHA-1", "SHA-256"
   * @param options 选项
   */
  digest(data: string, algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | string, options?: CryptoOptions): string
}

// 压缩与解压 Zip
declare let zips: {
  /**
   * 压缩文件或目录
   * @param type 压缩类型: zip 7z bz2 bzip2 tbz2 tbz gz gzip tgz tar wim swm xz txz
   * @param filePath 压缩文件路径 (必须是完整路径)
   * @param dirPath 目录路径 (必须是完整路径)
   * @param password 压缩密码
   * @returns 状态码: 0-成功, 1-非致命错误, 2-致命错误, 7-命令行错误, 8-内存不足, 255-用户中止
   */
  A: (type: string, filePath: string, dirPath: string, password?: string) => number
  /**
   * 解压文件
   * 支持的解压缩类型包括：
   * zip、7z、bz2、bzip2、tbz2、tbz、gz、gzip、tgz、tar、wim、swm、xz、txz
   * 以及 rar、chm、iso、msi 等众多格式
   * @param filePath 压缩文件路径 (必须是完整路径)
   * @param dirPath 目录路径 (必须是完整路径)
   * @param password 解压密码
   * @returns 状态码: 0-成功, 1-非致命错误, 2-致命错误, 7-命令行错误, 8-内存不足, 255-用户中止
   */
  X: (filePath: string, dirPath: string, password?: string) => number
}

// 多媒体 Media
declare let media: {
  /**
   * 扫描路径的媒体文件，将它加入媒体库中
   * @param path 媒体文件路径
   */
  scanFile: (path: string) => void
  /**
   * 播放音乐文件
   * @param path 音乐文件路径
   * @param volume 播放音量，为 0~1 的浮点数，默认为 1
   * @param looping 是否循环播放，默认为 false
   */
  playMusic: (path: string, volume?: number, looping?: boolean) => void
  /**
   * 把当前播放进度调整到时间 msec 的位置
   * @param msec 毫秒数，表示音乐进度
   */
  musicSeekTo: (msec: number) => void
  /** 暂停音乐播放 */
  pauseMusic: () => void
  /** 继续音乐播放 */
  resumeMusic: () => void
  /** 停止音乐播放 */
  stopMusic: () => void
  /** 返回当前是否正在播放音乐 */
  isMusicPlaying: () => boolean
  /** 返回当前音乐的时长，单位毫秒 */
  getMusicDuration: () => number
  /** 返回当前音乐的播放进度，单位毫秒 */
  getMusicCurrentPosition: () => number
}

// 传感器 Sensors

/** 传感器事件 */
interface SensorEvent {
  /** 传感器数据数组 */
  values: number[]
  /** 时间戳 */
  timestamp: number
  /** 传感器精度 */
  accuracy: number
}

/** 传感器事件发射器 */
interface SensorEventEmitter {
  /**
   * 监听传感器数据变化事件
   * @param event 事件名称
   * @param listener 回调函数
   */
  on(event: 'change', listener: (event: SensorEvent, ...args: number[]) => void): SensorEventEmitter
  on(event: 'accuracy_change', listener: (accuracy: number) => void): SensorEventEmitter
}

declare let sensors: {
  /**
   * 注册一个传感器监听并返回 SensorEventEmitter
   * @param sensorName 传感器名称: accelerometer, orientation, gyroscope, magnetic_field, gravity, linear_acceleration, ambient_temperature, light, pressure, proximity, relative_humidity
   * @param delay 传感器数据更新频率，可选
   * @returns 如果不支持该传感器，返回 null
   */
  register: (sensorName: string, delay?: number) => SensorEventEmitter | null
  /** 传感器数据更新频率常量 */
  delay: {
    /** 正常频率 */
    normal: number
    /** 适合于用户界面的更新频率 */
    ui: number
    /** 适合于游戏的更新频率 */
    game: number
    /** 最快的更新频率 */
    fastest: number
  }
  /**
   * 注销传感器监听器
   * @param emitter 传感器事件发射器
   */
  unregister: (emitter: SensorEventEmitter) => void
  /** 注销所有传感器监听器 */
  unregisterAll: () => void
  /** 表示是否忽略不支持的传感器 */
  ignoresUnsupportedSensor: boolean
  /**
   * 监听事件
   * @param eventName 事件名称
   * @param fn 回调函数
   */
  on: (eventName: 'unsupported_sensor', fn: (sensorName: string) => void) => void
}

// 执行命令 Shell

/** Shell 命令执行结果 */
interface ShellResult {
  /** 返回码，执行成功时为 0 */
  code: number
  /** 运行结果 (stdout) */
  result: string
  /** 运行的错误信息 (stderr) */
  error: string
}

/**
 * 一次性执行命令并返回命令的执行结果
 * @param cmd 要执行的命令
 * @param root 是否以 root 权限运行，默认为 false
 */
declare function shell(cmd: string, root?: boolean): ShellResult

/** Shell 回调 */
interface ShellCallback {
  /** 每当 shell 有新的输出时便会调用该函数 */
  onOutput?: (output: string) => void
  /** 每当 shell 有新的一行输出时便会调用该函数 */
  onNewLine?: (line: string) => void
}

declare class Shell {
  /**
   * 创建一个 Shell 对象
   * @param root 是否以 root 权限运行
   */
  constructor(root?: boolean)
  /**
   * 执行命令，该函数不会返回任何值，命令执行是异步的、非阻塞的
   * @param cmd 要执行的命令
   */
  exec: (cmd: string) => void
  /** 直接退出 shell */
  exit: () => void
  /** 执行 exit 命令并等待执行完成、退出 shell */
  exitAndWaitFor: () => void
  /**
   * 设置该 Shell 的回调函数，以便监听 Shell 的输出
   * @param callback 回调函数
   */
  setCallback: (callback: ShellCallback) => void
}

// 调用 Java
declare class StringBuilder {
  constructor(str?: string)
  append(str: string): StringBuilder
  toString(): string
  [x: string]: any
}

declare let WebView: any
declare let WebSettings: any

/**
 * 全局函数 log - 相当于 console.log(text)
 * @param data 主要信息
 * @param args 代替值参数
 */
declare function log(data?: any, ...args: any[]): void

/**
 * 全局函数 toastLog - 同时调用 toast 和 log
 * @param message 消息
 */
declare function toastLog(message: any): void
