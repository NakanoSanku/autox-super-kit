/**
 * events 模块提供了监听手机通知、按键、触摸的接口。您可以用他配合自动操作函数完成自动化工作。
 *
 * events 本身是一个 EventEmitter，但内置了一些事件，包括按键事件、通知事件、Toast 事件等。
 *
 * 需要注意的是，事件的处理是单线程的，并且仍然在原线程执行，如果脚本主体或者其他事件处理中有耗时操作、轮询等，
 * 则事件将无法得到及时处理（会进入事件队列等待脚本主体或其他事件处理完成才执行）。
 *
 * @stability 稳定
 */
declare let events: EventEmitter & {
  /**
   * 返回一个新的 EventEmitter。这个 EventEmitter 没有内置任何事件。
   * @param thread 可选，指定事件回调执行的线程
   * @returns 新的 EventEmitter
   */
  emitter: (thread?: Thread) => EventEmitter

  /**
   * 启用按键监听，例如音量键、Home 键。按键监听使用无障碍服务实现，如果无障碍服务未启用会抛出异常并提示开启。
   * 只有这个函数成功执行后，onKeyDown, onKeyUp 等按键事件的监听才有效。
   * 该函数在安卓 4.3 以上才能使用。
   */
  observeKey: () => void

  /**
   * 注册一个按键监听函数，当有 keyName 对应的按键被按下会调用该函数。
   * @param keyName 要监听的按键名称
   * @param listener 按键监听器，参数为一个 KeyEvent
   * @example
   * events.observeKey();
   * events.onKeyDown("volume_up", function(event){
   *     toast("音量上键被按下了");
   * });
   */
  onKeyDown: (keyName: KeyName, listener: (event: KeyEvent) => void) => void

  /**
   * 注册一个按键监听函数，当有 keyName 对应的按键弹起会调用该函数。
   * @param keyName 要监听的按键名称
   * @param listener 按键监听器，参数为一个 KeyEvent
   */
  onKeyUp: (keyName: KeyName, listener: (event: KeyEvent) => void) => void

  /**
   * 注册一个按键监听函数，当有 keyName 对应的按键被按下时会调用该函数，之后会注销该按键监听器。
   * 也就是 listener 只有在 onceKeyDown 调用后的第一次按键事件被调用一次。
   * @param keyName 要监听的按键名称
   * @param listener 按键监听器，参数为一个 KeyEvent
   */
  onceKeyDown: (keyName: KeyName, listener: (event: KeyEvent) => void) => void

  /**
   * 注册一个按键监听函数，当有 keyName 对应的按键弹起时会调用该函数，之后会注销该按键监听器。
   * 也就是 listener 只有在 onceKeyUp 调用后的第一次按键事件被调用一次。
   * @param keyName 要监听的按键名称
   * @param listener 按键监听器，参数为一个 KeyEvent
   */
  onceKeyUp: (keyName: KeyName, listener: (event: KeyEvent) => void) => void

  /**
   * 删除该按键的 KeyDown(按下) 事件的所有监听。
   * @param keyName 按键名称
   */
  removeAllKeyDownListeners: (keyName: KeyName) => void

  /**
   * 删除该按键的 KeyUp(弹起) 事件的所有监听。
   * @param keyName 按键名称
   */
  removeAllKeyUpListeners: (keyName: KeyName) => void

  /**
   * 设置按键屏蔽是否启用。
   * 所谓按键屏蔽指的是，屏蔽原有按键的功能，例如使得音量键不再能调节音量，但此时仍然能通过按键事件监听按键。
   * 只要有一个脚本屏蔽了某个按键，该按键便会被屏蔽；当脚本退出时，会自动解除所有按键屏蔽。
   * @param enabled 是否启用按键屏蔽（屏蔽所有按键）
   * @example
   * events.setKeyInterceptionEnabled(true);
   */
  setKeyInterceptionEnabled(enabled: boolean): void
  /**
   * 设置特定按键屏蔽是否启用。
   * @param key 要屏蔽的按键
   * @param enabled 是否启用按键屏蔽
   * @example
   * events.setKeyInterceptionEnabled("volume_up", true);
   * events.observeKey();
   * events.onKeyDown("volume_up", () => {
   *     log("音量上键被按下");
   * });
   */
  setKeyInterceptionEnabled(key: KeyName, enabled: boolean): void

  /**
   * 启用屏幕触摸监听。（需要 root 权限）
   * 只有这个函数被成功执行后，触摸事件的监听才有效。
   * 没有 root 权限调用该函数则什么也不会发生。
   */
  observeTouch: () => void

  /**
   * 设置两个触摸事件分发的最小时间间隔。
   * 建议在满足需要的情况下尽量提高这个间隔。强烈建议不要设置 timeout 为 0。
   * @param timeout 两个触摸事件的最小间隔，单位毫秒，默认为 10 毫秒。如果小于 0，视为 0 处理。
   */
  setTouchEventTimeout: (timeout: number) => void

  /**
   * 返回触摸事件的最小时间间隔。
   * @returns 触摸事件的最小时间间隔，单位毫秒
   */
  getTouchEventTimeout: () => number

  /**
   * 注册一个触摸监听函数。相当于 on("touch", listener)。
   * @param listener 触摸监听器，参数为触摸点的坐标
   * @example
   * events.observeTouch();
   * events.onTouch(function(p){
   *     log(p.x + ", " + p.y);
   * });
   */
  onTouch: (listener: (point: Point) => void) => void

  /**
   * 删除所有触摸事件监听函数。
   */
  removeAllTouchListeners: () => void

  /**
   * 开启通知监听。例如 QQ 消息、微信消息、推送等通知。
   * 通知监听依赖于通知服务，如果通知服务没有运行，会抛出异常并跳转到通知权限开启界面。
   * @example
   * events.observeNotification();
   * events.onNotification(function(notification){
   *     log(notification.getText());
   * });
   */
  observeNotification: () => void

  /**
   * 注册一个通知监听函数。相当于 on("notification", listener)。
   * @param listener 通知监听器
   */
  onNotification: (listener: (notification: Notification) => void) => void

  /**
   * 开启 Toast 监听。
   * Toast 监听依赖于无障碍服务，因此此函数会确保无障碍服务运行。
   */
  observeToast: () => void

  /**
   * 注册一个 Toast 监听函数。相当于 on("toast", listener)。
   * @param listener Toast 监听器
   * @example
   * events.observeToast();
   * events.onToast(function(toast){
   *     log("Toast 内容：" + toast.getText() + " 包名：" + toast.getPackageName());
   * });
   */
  onToast: (listener: (toast: Toast) => void) => void

  /**
   * 脚本间广播。
   * events.broadcast 本身是一个 EventEmitter，但它的事件是在脚本间共享的，所有脚本都能发送和监听这些事件。
   * @example
   * // 发送广播
   * events.broadcast.emit("hello", "小明");
   * // 在其他脚本中监听
   * events.broadcast.on("hello", function(name){
   *     toast("你好，" + name);
   * });
   */
  broadcast: EventEmitter
}

/**
 * 按键名称
 */
type KeyName = 'volume_up' | 'volume_down' | 'home' | 'back' | 'menu'

/**
 * 内置事件名称
 */
type BuiltinEventName = 'key' | 'key_down' | 'key_up' | 'exit' | 'toast' | 'notification'

/**
 * 按键事件对象
 */
interface KeyEvent {
  /** 按下事件常量 */
  ACTION_DOWN: number
  /** 弹起事件常量 */
  ACTION_UP: number
  /** 主页键键值常量 */
  KEYCODE_HOME: number
  /** 返回键键值常量 */
  KEYCODE_BACK: number
  /** 菜单键键值常量 */
  KEYCODE_MENU: number
  /** 音量上键键值常量 */
  KEYCODE_VOLUME_UP: number
  /** 音量下键键值常量 */
  KEYCODE_VOLUME_DOWN: number

  /**
   * 返回事件的动作。
   * @returns ACTION_DOWN (按下事件) 或 ACTION_UP (弹起事件)
   */
  getAction: () => number

  /**
   * 返回按键的键值。
   * @returns 键值常量
   */
  getKeyCode: () => number

  /**
   * 返回事件发生的时间戳。
   * @returns 时间戳
   */
  getEventTime: () => number

  /**
   * 返回最近一次按下事件的时间戳。如果本身是按下事件，则与 getEventTime() 相同。
   * @returns 时间戳
   */
  getDownTime: () => number

  /**
   * 把键值转换为字符串。例如 KEYCODE_HOME 转换为 "KEYCODE_HOME"。
   * @param keyCode 键值
   * @returns 键值对应的字符串
   */
  keyCodeToString: (keyCode: number) => string
}

/**
 * 按键键值常量对象
 */
declare let keys: {
  /** 主页键 */
  home: number
  /** 返回键 */
  back: number
  /** 菜单键 */
  menu: number
  /** 音量上键 */
  volume_up: number
  /** 音量下键 */
  volume_down: number
}

/**
 * 通知对象，可以获取通知详情，包括通知标题、内容、发出通知的包名、时间等，也可以对通知进行操作，比如点击、删除。
 */
interface Notification {
  /**
   * 通知数量。例如 QQ 连续收到两条消息时 number 为 2。
   */
  number: number

  /**
   * 通知发出时间的时间戳，可以用于构造 Date 对象。
   * @example
   * log("通知时间为" + new Date(n.when));
   */
  when: number

  /**
   * 获取发出通知的应用包名。
   * @returns 应用包名
   */
  getPackageName: () => string

  /**
   * 获取通知的标题。
   * @returns 通知标题
   */
  getTitle: () => string

  /**
   * 获取通知的内容。
   * @returns 通知内容
   */
  getText: () => string

  /**
   * 点击该通知。例如对于一条 QQ 消息，点击会进入具体的聊天界面。
   */
  click: () => void

  /**
   * 删除该通知。该通知将从通知栏中消失。
   */
  delete: () => void
}

/**
 * Toast 对象
 */
interface Toast {
  /**
   * 获取 Toast 的文本内容。
   * @returns Toast 文本内容
   */
  getText: () => string

  /**
   * 获取发出 Toast 的应用包名。
   * @returns 应用包名
   */
  getPackageName: () => string
}

/**
 * 触摸点坐标
 */
interface Point {
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
}

/**
 * 事件发射器，用于注册和触发事件。
 */
interface EventEmitter {
  /**
   * 每个事件默认可以注册最多 10 个监听器。
   * 设置此属性要谨慎，因为会影响所有 EventEmitter 实例，包括之前创建的。
   */
  defaultMaxListeners: number

  /**
   * 添加 listener 函数到名为 eventName 的事件的监听器数组的末尾。
   * @param eventName 事件名
   * @param listener 回调函数
   * @returns EventEmitter 引用，可以链式调用
   */
  addListener: (eventName: string, listener: (...args: any[]) => void) => EventEmitter

  /**
   * 按监听器的注册顺序，同步地调用每个注册到名为 eventName 事件的监听器，并传入提供的参数。
   * @param eventName 事件名
   * @param args 事件参数
   * @returns 如果事件有监听器，则返回 true，否则返回 false
   */
  emit: (eventName: string, ...args: any[]) => boolean

  /**
   * 返回一个列出触发器已注册监听器的事件的数组。
   * @returns 事件名称数组
   */
  eventNames: () => (string | symbol)[]

  /**
   * 返回 EventEmitter 当前的最大监听器限制值。
   * @returns 最大监听器数量
   */
  getMaxListeners: () => number

  /**
   * 返回正在监听名为 eventName 的事件的监听器的数量。
   * @param eventName 正在被监听的事件名
   * @returns 监听器数量
   */
  listenerCount: (eventName: string) => number

  /**
   * 返回名为 eventName 的事件的监听器数组的副本。
   * @param eventName 事件名
   * @returns 监听器数组
   */
  listeners: (eventName: string) => Function[]

  /**
   * 添加 listener 函数到名为 eventName 的事件的监听器数组的末尾。
   * @param eventName 事件名
   * @param listener 回调函数
   * @returns EventEmitter 引用，可以链式调用
   */
  on: (eventName: string, listener: (...args: any[]) => void) => EventEmitter

  /**
   * 添加一个单次 listener 函数到名为 eventName 的事件。下次触发 eventName 事件时，监听器会被移除，然后调用。
   * @param eventName 事件名
   * @param listener 回调函数
   * @returns EventEmitter 引用，可以链式调用
   */
  once: (eventName: string, listener: (...args: any[]) => void) => EventEmitter

  /**
   * 添加 listener 函数到名为 eventName 的事件的监听器数组的开头。
   * @param eventName 事件名
   * @param listener 回调函数
   * @returns EventEmitter 引用，可以链式调用
   */
  prependListener: (eventName: string, listener: (...args: any[]) => void) => EventEmitter

  /**
   * 添加一个单次 listener 函数到名为 eventName 的事件的监听器数组的开头。
   * @param eventName 事件名
   * @param listener 回调函数
   * @returns EventEmitter 引用，可以链式调用
   */
  prependOnceListener: (eventName: string, listener: (...args: any[]) => void) => EventEmitter

  /**
   * 移除全部或指定 eventName 的监听器。
   * @param eventName 事件名（可选）
   * @returns EventEmitter 引用，可以链式调用
   */
  removeAllListeners: (eventName?: string) => EventEmitter

  /**
   * 从名为 eventName 的事件的监听器数组中移除指定的 listener。
   * @param eventName 事件名
   * @param listener 要移除的监听器函数
   * @returns EventEmitter 引用，可以链式调用
   */
  removeListener: (eventName: string, listener: (...args: any[]) => void) => EventEmitter

  /**
   * 设置 EventEmitter 的最大监听器限制值。值设为 Infinity（或 0）表明不限制监听器的数量。
   * @param n 最大监听器数量
   * @returns EventEmitter 引用，可以链式调用
   */
  setMaxListeners: (n: number) => EventEmitter
}
