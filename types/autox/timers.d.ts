/**
 * timers 模块提供了定时器功能，用于在某个未来时间段调用调度函数。
 * 这些定时器函数是全局的，无需调用 timers.XXXXX
 */

/**
 * 预定每隔 delay 毫秒重复执行的 callback
 * @param callback 当定时器到点时要调用的函数
 * @param delay 调用 callback 之前要等待的毫秒数
 * @param args 当调用 callback 时要传入的可选参数
 * @returns 用于 clearInterval() 的 id
 */
declare function setInterval(callback: (...args: any[]) => void, delay: number, ...args: any[]): number

/**
 * 预定在 delay 毫秒之后执行的单次 callback
 * @param callback 当定时器到点时要调用的函数
 * @param delay 调用 callback 之前要等待的毫秒数
 * @param args 当调用 callback 时要传入的可选参数
 * @returns 用于 clearTimeout() 的 id
 */
declare function setTimeout(callback: (...args: any[]) => void, delay: number, ...args: any[]): number

/**
 * 预定立即执行的 callback，它是在 I/O 事件的回调之后被触发
 * @param callback 在 Looper 循环的当前回合结束时要调用的函数
 * @param args 当调用 callback 时要传入的可选参数
 * @returns 用于 clearImmediate() 的 id
 */
declare function setImmediate(callback: (...args: any[]) => void, ...args: any[]): number

/**
 * 取消一个由 setInterval() 创建的循环定时任务
 * @param id 一个 setInterval() 返回的 id
 */
declare function clearInterval(id: number): void

/**
 * 取消一个由 setTimeout() 创建的定时任务
 * @param id 一个 setTimeout() 返回的 id
 */
declare function clearTimeout(id: number): void

/**
 * 取消一个由 setImmediate() 创建的 Immediate 对象
 * @param id 一个 setImmediate() 返回的 id
 */
declare function clearImmediate(id: number): void
