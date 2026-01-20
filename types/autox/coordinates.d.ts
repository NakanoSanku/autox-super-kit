/**
 * 基于坐标的触摸模拟
 * 本模块介绍了一些使用坐标进行点击、滑动的函数。
 * 这些函数有的需要安卓 7.0 以上，有的需要 root 权限。
 */

/**
 * 设置脚本坐标点击所适合的屏幕宽高。如果脚本运行时，屏幕宽度不一致会自动放缩坐标。
 * @param width 屏幕宽度，单位像素
 * @param height 屏幕高度，单位像素
 */
declare function setScreenMetrics(width: number, height: number): void

// ==================== 安卓 7.0 以上的触摸和手势模拟 ====================

/**
 * 模拟点击坐标 (x, y)，并返回是否点击成功。
 * 注意：只有 Android 7.0 及以上才有效
 * @param x 要点击的坐标的 x 值
 * @param y 要点击的坐标的 y 值
 * @returns 是否点击成功
 */
declare function click(x: number, y: number): boolean

/**
 * 模拟长按坐标 (x, y)，并返回是否成功。
 * 注意：只有 Android 7.0 及以上才有效
 * @param x 要长按的坐标的 x 值
 * @param y 要长按的坐标的 y 值
 * @returns 是否长按成功
 */
declare function longClick(x: number, y: number): boolean

/**
 * 模拟按住坐标 (x, y)，并返回是否成功。
 * 注意：只有 Android 7.0 及以上才有效
 * @param x 要按住的坐标的 x 值
 * @param y 要按住的坐标的 y 值
 * @param duration 按住时长，单位毫秒
 * @returns 是否成功
 */
declare function press(x: number, y: number, duration: number): boolean

/**
 * 模拟从坐标 (x1, y1) 滑动到坐标 (x2, y2)，并返回是否成功。
 * 注意：只有 Android 7.0 及以上才有效
 * @param x1 滑动的起始坐标的 x 值
 * @param y1 滑动的起始坐标的 y 值
 * @param x2 滑动的结束坐标的 x 值
 * @param y2 滑动的结束坐标的 y 值
 * @param duration 滑动时长，单位毫秒
 * @returns 是否成功
 */
declare function swipe(x1: number, y1: number, x2: number, y2: number, duration: number): boolean

/**
 * 模拟手势操作
 * 注意：只有 Android 7.0 及以上才有效
 * @param duration 手势的时长
 * @param points 手势滑动路径的一系列坐标 [x, y]
 */
declare function gesture(duration: number, ...points: [number, number][]): void

/**
 * 同时模拟多个手势
 * 每个手势的参数为 [delay, duration, 坐标...]
 * delay 为延迟多久 (毫秒) 才执行该手势；duration 为手势执行时长；坐标为手势经过的点的坐标
 * 注意：只有 Android 7.0 及以上才有效
 * @param gestures 手势参数数组
 */
declare function gestures(...gestures: (number | [number, number])[][]): void

// ==================== RootAutomator (需要 root 权限) ====================

/**
 * RootAutomator 是一个使用 root 权限来模拟触摸的对象，
 * 用它可以完成触摸与多点触摸，并且这些动作的执行没有延迟。
 */
declare class RootAutomator {
  constructor()

  /**
   * 点击位置 (x, y)
   * @param x 横坐标
   * @param y 纵坐标
   * @param id 多点触摸 id，可选，默认为 1
   */
  tap(x: number, y: number, id?: number): void

  /**
   * 模拟一次从 (x1, y1) 到 (x2, y2) 的滑动
   * @param x1 滑动起点横坐标
   * @param y1 滑动起点纵坐标
   * @param x2 滑动终点横坐标
   * @param y2 滑动终点纵坐标
   * @param duration 滑动时长，单位毫秒，默认值为 300
   * @param id 多点触摸 id，可选，默认为 1
   */
  swipe(x1: number, y1: number, x2: number, y2: number, duration?: number, id?: number): void

  /**
   * 模拟按下位置 (x, y)
   * @param x 横坐标
   * @param y 纵坐标
   * @param duration 按下时长
   * @param id 多点触摸 id，可选，默认为 1
   */
  press(x: number, y: number, duration: number, id?: number): void

  /**
   * 模拟长按位置 (x, y)
   * @param x 横坐标
   * @param y 纵坐标
   * @param id 多点触摸 id，可选，默认为 1
   */
  longPress(x: number, y: number, id?: number): void

  /**
   * 模拟手指按下位置 (x, y)
   * @param x 横坐标
   * @param y 纵坐标
   * @param id 多点触摸 id，可选，默认为 1
   */
  touchDown(x: number, y: number, id?: number): void

  /**
   * 模拟移动手指到位置 (x, y)
   * @param x 横坐标
   * @param y 纵坐标
   * @param id 多点触摸 id，可选，默认为 1
   */
  touchMove(x: number, y: number, id?: number): void

  /**
   * 模拟手指弹起
   * @param id 多点触摸 id，可选，默认为 1
   */
  touchUp(id?: number): void

  /**
   * 退出 RootAutomator
   */
  exit(): void
}

// ==================== 使用 root 权限点击和滑动的简单命令 ====================

/**
 * 使用 root 权限点击位置 (x, y)
 * 注意：需要 root 权限，执行是异步的、非阻塞的
 * @param x 要点击的坐标的 x 值
 * @param y 要点击的坐标的 y 值
 */
declare function Tap(x: number, y: number): void

/**
 * 使用 root 权限滑动，从 (x1, y1) 位置滑动到 (x2, y2) 位置
 * 注意：需要 root 权限，执行是异步的、非阻塞的
 * @param x1 滑动起点的坐标 x 值
 * @param y1 滑动起点的坐标 y 值
 * @param x2 滑动终点的坐标 x 值
 * @param y2 滑动终点的坐标 y 值
 * @param duration 滑动动作所用的时间
 */
declare function Swipe(x1: number, y1: number, x2: number, y2: number, duration?: number): void
