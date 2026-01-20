/**
 * engines 模块包含了一些与脚本环境、脚本运行、脚本引擎有关的函数，包括运行其他脚本，关闭脚本等。
 *
 * @stability 稳定
 * @example
 * // 获取脚本所在目录
 * toast(engines.myEngine().cwd());
 */
declare let engines: {
  /**
   * 在新的脚本环境中运行脚本 script。
   * 所谓新的脚本环境，指的是，脚本中的变量和原脚本的变量是不共享的，并且，脚本会在新的线程中运行。
   * @param name 要运行的脚本名称。这个名称和文件名称无关，只是在任务管理中显示的名称。
   * @param script 要运行的脚本内容。
   * @param config 运行配置项
   * @returns ScriptExecution 对象
   * @example
   * engines.execScript("hello world", "toast('hello world')");
   * @example
   * // 每隔 3 秒运行一次脚本，循环 10 次
   * engines.execScript("hello world", "toast('hello world')", {
   *     loopTimes: 10,
   *     interval: 3000
   * });
   */
  execScript: (name: string, script: string, config?: ScriptConfig) => ScriptExecution

  /**
   * 在新的脚本环境中运行脚本文件 path。
   * @param path 要运行的脚本路径
   * @param config 运行配置项
   * @returns ScriptExecution 对象
   * @example
   * engines.execScriptFile("/sdcard/脚本/1.js");
   */
  execScriptFile: (path: string, config?: ScriptConfig) => ScriptExecution

  /**
   * 在新的脚本环境中运行录制文件 path。
   * @param path 要运行的录制文件路径
   * @param config 运行配置项
   * @returns ScriptExecution 对象
   * @example
   * engines.execAutoFile("/sdcard/脚本/1.auto");
   */
  execAutoFile: (path: string, config?: ScriptConfig) => ScriptExecution

  /**
   * 停止所有正在运行的脚本。包括当前脚本自身。
   */
  stopAll: () => void

  /**
   * 停止所有正在运行的脚本并显示停止的脚本数量。包括当前脚本自身。
   */
  stopAllAndToast: () => void

  /**
   * 返回当前脚本的脚本引擎对象。
   * 特别的，该对象可以通过 execArgv 来获取他的运行参数，包括外部参数、intent 等。
   * @returns 当前脚本的脚本引擎对象
   * @since v4.1.0 新增 execArgv 属性
   * @example
   * log(engines.myEngine().execArgv);
   */
  myEngine: () => ScriptEngine

  /**
   * 返回当前所有正在运行的脚本的脚本引擎的数组。
   * @returns 脚本引擎数组
   * @example
   * log(engines.all());
   */
  all: () => ScriptEngine[]
}

/**
 * 脚本运行配置项
 */
interface ScriptConfig {
  /** 延迟执行的毫秒数，默认为 0 */
  delay?: number
  /** 循环运行次数，默认为 1。0 为无限循环。 */
  loopTimes?: number
  /** 循环运行时两次运行之间的时间间隔，默认为 0 */
  interval?: number
  /**
   * 指定脚本运行的目录。这些路径会用于 require 时寻找模块文件。
   */
  path?: string | string[]
}

/**
 * 执行脚本时返回的对象，可以通过他获取执行的引擎、配置等，也可以停止这个执行。
 * 要停止这个脚本的执行，使用 execution.getEngine().forceStop()
 */
interface ScriptExecution {
  /**
   * 返回执行该脚本的脚本引擎对象。
   * @returns 脚本引擎对象
   */
  getEngine: () => ScriptEngine

  /**
   * 返回该脚本的运行配置。
   * @returns 脚本运行配置
   */
  getConfig: () => ScriptConfigResult
}

/**
 * 脚本引擎对象
 */
interface ScriptEngine {
  /**
   * 检测该脚本是否执行结束。
   * @returns 是否执行结束
   * @example
   * let e = engines.execScriptFile("xx.js");
   * sleep(2000);
   * log(e.getEngine().isDestroyed());
   */
  isDestroyed: () => boolean

  /**
   * 停止脚本引擎的执行。
   */
  forceStop: () => void

  /**
   * 返回脚本执行的路径。
   * 对于一个脚本文件而言为这个脚本所在的文件夹；对于其他脚本，例如字符串脚本，则为 null 或者执行时的设置值。
   * @returns 脚本执行的路径
   */
  cwd: () => string | null

  /**
   * 返回当前脚本引擎正在执行的脚本对象。
   * @returns 脚本源对象
   * @example
   * log(engines.myEngine().getSource());
   */
  getSource: () => ScriptSource

  /**
   * 向该脚本引擎发送一个事件，该事件可以在该脚本引擎对应的脚本的 events 模块监听到并在脚本主线程执行事件处理。
   * @param eventName 事件名称
   * @param args 事件参数
   * @example
   * // 运行脚本
   * var e = engines.execScriptFile("./receiver.js");
   * // 等待脚本启动
   * sleep(2000);
   * // 向该脚本发送事件
   * e.getEngine().emit("say", "你好");
   */
  emit: (eventName: string, ...args: any[]) => void

  /**
   * 运行参数，包括外部参数、intent 等。
   * 普通脚本的运行参数通常为空，通过定时任务的广播启动的则可以获取到启动的 intent。
   * @since v4.1.0
   */
  execArgv?: any
}

/**
 * 脚本执行时的配置结果
 */
interface ScriptConfigResult {
  /** 延迟执行的毫秒数 */
  delay: number
  /** 循环运行时两次运行之间的时间间隔 */
  interval: number
  /** 循环运行次数 */
  loopTimes: number
  /**
   * 返回一个字符串数组表示脚本运行时模块寻找的路径。
   * @returns 模块路径数组
   */
  getPath: () => string[]
}

/**
 * 脚本源对象
 */
interface ScriptSource {
  /** 脚本名称 */
  name?: string
  /** 脚本内容 (对于字符串脚本) */
  script?: string
  /** 脚本文件路径 (对于文件脚本) */
  path?: string
  [key: string]: any
}
