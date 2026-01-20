/**
 * Storage 对象，用于存取数据
 */
interface Storage {
  /**
   * 从本地存储中取出数据
   * @param key 键值
   * @param defaultValue 默认值
   * @returns 存储的数据
   */
  get<T = any>(key: string, defaultValue?: T): T

  /**
   * 把值保存到本地存储中
   * @param key 键值
   * @param value 值，不能为 undefined
   */
  put(key: string, value: any): void

  /**
   * 移除键值为 key 的数据
   * @param key 键值
   */
  remove(key: string): void

  /**
   * 返回该本地存储是否包含键值为 key 的数据
   * @param key 键值
   * @returns 是否包含
   */
  contains(key: string): boolean

  /** 移除该本地存储的所有数据 */
  clear(): void
}

/**
 * storages 模块提供了保存简单数据、用户配置等的支持
 */
interface Storages {
  /**
   * 创建一个本地存储并返回 Storage 对象
   * @param name 本地存储名称
   * @returns Storage 对象
   */
  create(name: string): Storage

  /**
   * 删除一个本地存储以及它的全部数据
   * @param name 本地存储名称
   * @returns 如果存储不存在返回 false，否则返回 true
   */
  remove(name: string): boolean
}

declare const storages: Storages
