/**
 * Threads 模块提供了多线程支持，可以启动新线程来运行脚本。
 *
 * 脚本主线程会等待所有子线程执行完成后才停止执行，因此如果子线程中有死循环，
 * 请在必要的时候调用 exit() 来直接停止脚本或 threads.shutDownAll() 来停止所有子线程。
 *
 * 通过 threads.start() 启动的所有线程会在脚本被强制停止时自动停止。
 *
 * @stability 实验
 */
declare let threads: {
  /**
   * 启动一个新线程并执行 action。
   * @param action 要在新线程执行的函数
   * @returns 线程对象，可用于获取和控制线程状态
   * @example
   * var thread = threads.start(function(){
   *     while(true){
   *         log("子线程");
   *     }
   * });
   * // 停止线程执行
   * thread.interrupt();
   */
  start: (action: Function) => Thread

  /**
   * 停止所有通过 threads.start() 启动的子线程。
   */
  shutDownAll: () => void

  /**
   * 返回当前线程。
   * @returns 当前线程对象
   */
  currentThread: () => Thread

  /**
   * 新建一个 Disposable 对象，用于等待另一个线程的某个一次性结果。
   * @returns Disposable 对象
   * @example
   * var sum = threads.disposable();
   * threads.start(function(){
   *     var s = 0;
   *     for(var i = 1; i <= 10000; i++){
   *         s += i;
   *     }
   *     sum.setAndNotify(s);
   * });
   * toast("sum = " + sum.blockedGet());
   */
  disposable: <T = any>() => Disposable<T>

  /**
   * 新建一个整数原子变量，用于线程安全的整数操作。
   * @param initialValue 初始整数值，默认为 0
   * @returns AtomicLong 对象
   * @see https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/atomic/AtomicLong.html
   * @example
   * var i = threads.atomic();
   * threads.start(function(){
   *     while(true){
   *         log(i.getAndIncrement());
   *     }
   * });
   */
  atomic: (initialValue?: number) => AtomicLong

  /**
   * 新建一个可重入锁，用于线程同步。
   * @returns ReentrantLock 对象
   * @see https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/locks/ReentrantLock.html
   * @example
   * var lock = threads.lock();
   * lock.lock();
   * // 临界区代码
   * lock.unlock();
   */
  lock: () => ReentrantLock
}

/**
 * 线程对象，threads.start() 返回的对象，用于获取和控制线程的状态，与其他线程交互等。
 *
 * Thread 对象提供了和 timers 模块一样的 API，例如 setTimeout(), setInterval() 等，
 * 用于在该线程执行相应的定时回调，从而使线程之间可以直接交互。
 */
interface Thread {
  /**
   * 中断线程运行。
   */
  interrupt: () => void

  /**
   * 等待线程执行完成。
   * @param timeout 等待时间，单位毫秒。如果为 0 或不传，则会一直等待直至该线程执行完成；否则最多等待 timeout 毫秒的时间。
   * @example
   * var thread = threads.start(function(){
   *     for(var i = 0; i < 10000; i++){
   *         sum += i;
   *     }
   * });
   * thread.join();
   * toast("sum = " + sum);
   */
  join: (timeout?: number) => void

  /**
   * 返回线程是否存活。
   * @returns 如果线程仍未开始或已经结束，返回 false; 如果线程已经开始或者正在运行中，返回 true。
   */
  isAlive: () => boolean

  /**
   * 等待线程开始执行。
   * 调用 threads.start() 以后线程仍然需要一定时间才能开始执行，因此调用此函数会等待线程开始执行；
   * 如果线程已经处于执行状态则立即返回。
   * @example
   * var thread = threads.start(function(){
   *     // do something
   * });
   * thread.waitFor();
   * thread.setTimeout(function(){
   *     // do something
   * }, 1000);
   */
  waitFor: () => void

  /**
   * 在该线程执行定时回调。
   * 如果当前线程仍未开始执行或已经执行结束，则抛出 IllegalStateException。
   * @param callback 回调函数
   * @param delay 延迟时间，单位毫秒
   * @param args 传递给回调函数的参数
   * @returns 定时器 ID
   */
  setTimeout: (callback: (...args: any[]) => void, delay: number, ...args: any[]) => number

  /**
   * 在该线程执行定时回调。
   * 如果当前线程仍未开始执行或已经执行结束，则抛出 IllegalStateException。
   * @param callback 回调函数
   * @param delay 间隔时间，单位毫秒
   * @param args 传递给回调函数的参数
   * @returns 定时器 ID
   */
  setInterval: (callback: (...args: any[]) => void, delay: number, ...args: any[]) => number

  /**
   * 在该线程立即执行回调。
   * 如果当前线程仍未开始执行或已经执行结束，则抛出 IllegalStateException。
   * @param callback 回调函数
   * @param args 传递给回调函数的参数
   * @returns 定时器 ID
   */
  setImmediate: (callback: (...args: any[]) => void, ...args: any[]) => number

  /**
   * 清除该线程的 setInterval 定时器。
   * @param id 定时器 ID
   */
  clearInterval: (id: number) => void

  /**
   * 清除该线程的 setTimeout 定时器。
   * @param id 定时器 ID
   */
  clearTimeout: (id: number) => void

  /**
   * 清除该线程的 setImmediate 定时器。
   * @param id 定时器 ID
   */
  clearImmediate: (id: number) => void
}

/**
 * 一次性结果容器，用于等待另一个线程的某个一次性结果。
 */
interface Disposable<T = any> {
  /**
   * 设置结果并通知等待的线程。
   * @param value 结果值
   */
  setAndNotify: (value: T) => void

  /**
   * 阻塞等待结果。
   * @returns 结果值
   */
  blockedGet: () => T

  /**
   * 阻塞等待结果，带超时。
   * @param timeout 超时时间，单位毫秒
   * @returns 结果值，超时返回 null
   */
  blockedGet: (timeout: number) => T | null
}

/**
 * 原子长整型变量，用于线程安全的整数操作。
 * @see https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/atomic/AtomicLong.html
 */
interface AtomicLong {
  /**
   * 获取当前值。
   * @returns 当前值
   */
  get: () => number

  /**
   * 设置新值。
   * @param newValue 新值
   */
  set: (newValue: number) => void

  /**
   * 获取当前值并设置新值。
   * @param newValue 新值
   * @returns 旧值
   */
  getAndSet: (newValue: number) => number

  /**
   * 获取当前值并自增。
   * @returns 自增前的值
   */
  getAndIncrement: () => number

  /**
   * 获取当前值并自减。
   * @returns 自减前的值
   */
  getAndDecrement: () => number

  /**
   * 获取当前值并加上指定值。
   * @param delta 增量
   * @returns 加之前的值
   */
  getAndAdd: (delta: number) => number

  /**
   * 自增并获取新值。
   * @returns 自增后的值
   */
  incrementAndGet: () => number

  /**
   * 自减并获取新值。
   * @returns 自减后的值
   */
  decrementAndGet: () => number

  /**
   * 加上指定值并获取新值。
   * @param delta 增量
   * @returns 加之后的值
   */
  addAndGet: (delta: number) => number

  /**
   * 比较并设置。如果当前值等于期望值，则设置为新值。
   * @param expect 期望值
   * @param update 新值
   * @returns 是否设置成功
   */
  compareAndSet: (expect: number, update: number) => boolean
}

/**
 * 可重入锁，用于线程同步。
 * @see https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/locks/ReentrantLock.html
 */
interface ReentrantLock {
  /**
   * 获取锁。如果锁已被其他线程持有，则等待。
   */
  lock: () => void

  /**
   * 尝试获取锁。如果锁可用，则获取并返回 true；否则返回 false。
   * @returns 是否获取成功
   */
  tryLock: () => boolean

  /**
   * 尝试获取锁，带超时。
   * @param timeout 超时时间
   * @param unit 时间单位
   * @returns 是否获取成功
   */
  tryLock: (timeout: number, unit: any) => boolean

  /**
   * 释放锁。
   */
  unlock: () => void

  /**
   * 创建一个新的条件变量，用于线程间通信。
   * @returns Condition 对象
   */
  newCondition: () => Condition

  /**
   * 返回当前线程是否持有此锁。
   * @returns 是否持有锁
   */
  isHeldByCurrentThread: () => boolean

  /**
   * 返回锁是否被任何线程持有。
   * @returns 是否被持有
   */
  isLocked: () => boolean
}

/**
 * 条件变量，用于线程间通信。
 */
interface Condition {
  /**
   * 等待条件满足。调用前必须持有锁。
   */
  await: () => void

  /**
   * 等待条件满足，带超时。
   * @param timeout 超时时间
   * @param unit 时间单位
   * @returns 是否在超时前被唤醒
   */
  await: (timeout: number, unit: any) => boolean

  /**
   * 唤醒一个等待此条件的线程。
   */
  signal: () => void

  /**
   * 唤醒所有等待此条件的线程。
   */
  signalAll: () => void
}

// 定时器 Timers
declare let setInterval: (callback: (...args: any[]) => void, delay: number, ...args: any[]) => number
declare let setTimeout: (callback: (...args: any[]) => void, delay: number, ...args: any[]) => number
declare let setImmediate: (callback: (...args: any[]) => void, ...args: any[]) => number
declare let clearInterval: (id: number) => void
declare let clearTimeout: (id: number) => void
declare let clearImmediate: (id: number) => void

/**
 * 在指定延迟后执行回调函数。
 * @param callback 回调函数
 * @param delay 延迟时间，单位毫秒
 * @param args 传递给回调函数的参数
 * @returns 定时器 ID，可用于 clearTimeout
 */
declare function setTimeout(callback: (...args: any[]) => void, delay: number, ...args: any[]): number

/**
 * 每隔指定时间重复执行回调函数。
 * @param callback 回调函数
 * @param delay 间隔时间，单位毫秒
 * @param args 传递给回调函数的参数
 * @returns 定时器 ID，可用于 clearInterval
 */
declare function setInterval(callback: (...args: any[]) => void, delay: number, ...args: any[]): number

/**
 * 立即执行回调函数 (在当前事件循环结束后)。
 * @param callback 回调函数
 * @param args 传递给回调函数的参数
 * @returns 定时器 ID，可用于 clearImmediate
 */
declare function setImmediate(callback: (...args: any[]) => void, ...args: any[]): number

/**
 * 清除 setInterval 设置的定时器。
 * @param id 定时器 ID
 */
declare function clearInterval(id: number): void

/**
 * 清除 setTimeout 设置的定时器。
 * @param id 定时器 ID
 */
declare function clearTimeout(id: number): void

/**
 * 清除 setImmediate 设置的定时器。
 * @param id 定时器 ID
 */
declare function clearImmediate(id: number): void

/**
 * 给函数 func 加上同步锁并作为一个新函数返回。
 * 使得在同一时刻最多只能有一个线程执行这个函数。
 * @param func 要加锁的函数
 * @returns 加锁后的新函数
 * @example
 * var i = 0;
 * var getAndIncrement = sync(function(){
 *     return i++;
 * });
 */
declare function sync<T extends Function>(func: T): T
