/**
 * 发送邮件的选项
 */
interface SendEmailOptions {
  /** 收件人的邮件地址。如果有多个收件人，则用字符串数组表示 */
  email?: string | string[]
  /** 抄送收件人的邮件地址。如果有多个抄送收件人，则用字符串数组表示 */
  cc?: string | string[]
  /** 密送收件人的邮件地址。如果有多个密送收件人，则用字符串数组表示 */
  bcc?: string | string[]
  /** 邮件主题 (标题) */
  subject?: string
  /** 邮件正文 */
  text?: string
  /** 附件的路径 */
  attachment?: string
}

/**
 * Intent 选项
 */
interface IntentOptions {
  /**
   * 意图的 Action，指意图要完成的动作，是一个字符串常量。
   * 当 action 以 "android.intent.action" 开头时，可以省略前缀。
   * @example "android.intent.action.SEND" 或 "SEND"
   */
  action?: string
  /**
   * 意图的 MimeType，表示和该意图直接相关的数据的类型。
   * @example "text/plain" 为纯文本类型
   */
  type?: string
  /**
   * 意图的 Data，表示和该意图直接相关的数据，是一个 Uri。
   * @example "file:///sdcard/1.txt"
   */
  data?: string
  /** 意图的类别 */
  category?: string[]
  /** 目标包名 */
  packageName?: string
  /** 目标 Activity 或 Service 等组件的名称 */
  className?: string
  /**
   * 以键值对构成的这个 Intent 的 Extras(额外信息)。
   * 提供该意图的其他信息，例如发送邮件时的邮件标题、邮件正文。
   */
  extras?: Record<string, any>
  /**
   * intent 的标识，字符串数组。
   * @example ["activity_new_task", "grant_read_uri_permission"]
   */
  flags?: string[]
  /** 是否以 root 权限启动、发送该 intent */
  root?: boolean
}

declare let app: {
  /**
   * 当前软件版本号，整数值。例如 160, 256 等。
   * 如果在 Auto.js 中运行则为 Auto.js 的版本号；在打包的软件中则为打包软件的版本号。
   */
  versionCode: number
  /**
   * 当前软件的版本名称，例如 "3.0.0 Beta"。
   * 如果在 Auto.js 中运行则为 Auto.js 的版本名称；在打包的软件中则为打包软件的版本名称。
   */
  versionName: string
  /** Auto.js 相关信息 */
  autojs: {
    /** Auto.js 版本号，整数值。例如 160, 256 等。 */
    versionCode: number
    /** Auto.js 版本名称，例如 "3.0.0 Beta"。 */
    versionName: string
  }
  /**
   * 通过应用名称启动应用。
   * @param appName 应用名称
   * @returns 如果该名称对应的应用不存在，则返回 false; 否则返回 true。如果该名称对应多个应用，则只启动其中某一个。
   */
  launchApp: (appName: string) => boolean
  /**
   * 通过应用包名启动应用。
   * @param packageName 应用包名
   * @returns 如果该包名对应的应用不存在，则返回 false；否则返回 true。
   */
  launch: (packageName: string) => boolean
  /**
   * 通过应用包名启动应用。相当于 app.launch(packageName)。
   * @param packageName 应用包名
   * @returns 如果该包名对应的应用不存在，则返回 false；否则返回 true。
   */
  launchPackage: (packageName: string) => boolean
  /**
   * 获取应用名称对应的已安装的应用的包名。
   * @param appName 应用名称
   * @returns 如果找不到该应用，返回 null。如果该名称对应多个应用，则只返回其中某一个的包名。
   */
  getPackageName: (appName: string) => string | null
  /**
   * 获取应用包名对应的已安装的应用的名称。
   * @param packageName 应用包名
   * @returns 如果找不到该应用，返回 null。
   */
  getAppName: (packageName: string) => string | null
  /**
   * 打开应用的详情页 (设置页)。
   * @param packageName 应用包名
   * @returns 如果找不到该应用，返回 false; 否则返回 true。
   */
  openAppSetting: (packageName: string) => boolean
  /**
   * 用其他应用查看文件。文件不存在的情况由查看文件的应用处理。
   * 如果找不出可以查看该文件的应用，则抛出 ActivityNotException。
   * @param path 文件路径
   */
  viewFile: (path: string) => void
  /**
   * 用其他应用编辑文件。文件不存在的情况由编辑文件的应用处理。
   * 如果找不出可以编辑该文件的应用，则抛出 ActivityNotException。
   * @param path 文件路径
   */
  editFile: (path: string) => void
  /**
   * 卸载应用。执行后会弹出卸载应用的提示框。
   * 如果该包名的应用未安装，由应用卸载程序处理，可能弹出 "未找到应用" 的提示。
   * @param packageName 应用包名
   */
  uninstall: (packageName: string) => void
  /**
   * 用浏览器打开网站 url。
   * 如果没有安装浏览器应用，则抛出 ActivityNotException。
   * @param url 网站的 Url，如果不以 "http://" 或 "https://" 开头则默认是 "http://"。
   */
  openUrl: (url: string) => void
  /**
   * 根据选项调用邮箱应用发送邮件。这些选项均是可选的。
   * 如果没有安装邮箱应用，则抛出 ActivityNotException。
   * @param options 发送邮件的参数
   */
  sendEmail: (options: SendEmailOptions) => void
  /**
   * 根据选项，构造一个意图 Intent 对象。
   * @param options 选项
   * @returns Intent 对象
   */
  intent: (options: IntentOptions) => any
  /**
   * 启动 Activity。
   * @param name 活动名称，可选值为 "console" (日志界面) 或 "settings" (设置界面)
   */
  startActivity(name: 'console' | 'settings'): void
  /**
   * 根据选项构造一个 Intent，并启动该 Activity。
   * @param options 选项
   */
  startActivity(options: IntentOptions): void
  /**
   * 根据选项构造一个 Intent，并启动该服务。
   * @param options 选项
   */
  startService: (options: IntentOptions) => void
  /**
   * 发送特定名称的广播，可以触发 Auto.js 的布局分析，方便脚本调试。
   * 这些广播在 Auto.js 发送才有效，在打包的脚本上运行将没有任何效果。
   * @param name 特定的广播名称
   */
  sendBroadcast(name: 'inspect_layout_hierarchy' | 'inspect_layout_bounds'): void
  /**
   * 根据选项构造一个 Intent，并发送该广播。
   * @param options 选项
   */
  sendBroadcast(options: IntentOptions): void
  /**
   * 根据选项构造一个 Intent，转换为对应的 shell 的 intent 命令的参数。
   * @param options 选项
   * @returns shell intent 命令的参数字符串
   */
  intentToShell: (options: IntentOptions) => string
  /**
   * 解析 uri 字符串并返回相应的 Uri 对象。
   * 即使 Uri 格式错误，该函数也会返回一个 Uri 对象，但之后如果访问该对象的 scheme, path 等值可能因解析失败而返回 null。
   * 注意：在高版本 Android 上，如果 uri 字符串是文件 "file://..."，返回的 Uri 会是诸如 "content://..." 的形式。
   * @param uri 一个代表 Uri 的字符串，例如 "file:///sdcard/1.txt", "https://www.autojs.org"
   * @returns 一个代表 Uri 的对象
   */
  parseUri: (uri: string) => any
  /**
   * 从一个文件路径创建一个 uri 对象。
   * 注意：在高版本 Android 上，返回的 Uri 会是诸如 "content://..." 的形式。
   * @param path 文件路径，例如 "/sdcard/1.txt"
   * @returns 一个指向该文件的 Uri 的对象
   */
  getUriForFile: (path: string) => any
}

// 全局函数

/**
 * 通过应用名称启动应用。
 * @param appName 应用名称
 * @returns 如果该名称对应的应用不存在，则返回 false; 否则返回 true。如果该名称对应多个应用，则只启动其中某一个。
 * @example
 * launchApp("Auto.js");
 */
declare function launchApp(appName: string): boolean

/**
 * 通过应用包名启动应用。
 * @param packageName 应用包名
 * @returns 如果该包名对应的应用不存在，则返回 false；否则返回 true。
 * @example
 * // 启动微信
 * launch("com.tencent.mm");
 */
declare function launch(packageName: string): boolean

/**
 * 获取应用名称对应的已安装的应用的包名。
 * @param appName 应用名称
 * @returns 如果找不到该应用，返回 null。如果该名称对应多个应用，则只返回其中某一个的包名。
 * @example
 * var name = getPackageName("QQ"); // 返回 "com.tencent.mobileqq"
 */
declare function getPackageName(appName: string): string | null

/**
 * 获取应用包名对应的已安装的应用的名称。
 * @param packageName 应用包名
 * @returns 如果找不到该应用，返回 null。
 * @example
 * var name = getAppName("com.tencent.mobileqq"); // 返回 "QQ"
 */
declare function getAppName(packageName: string): string | null

/**
 * 打开应用的详情页 (设置页)。
 * @param packageName 应用包名
 * @returns 如果找不到该应用，返回 false; 否则返回 true。
 */
declare function openAppSetting(packageName: string): boolean
