/**
 * 传感器事件
 */
interface SensorEvent {
  /** 传感器数据变化时的值数组 */
  values: number[]
  /** 传感器对象 */
  sensor: any
  /** 事件时间戳 */
  timestamp: number
  /** 精度 */
  accuracy: number
}

/**
 * 传感器事件发射器
 */
interface SensorEventEmitter {
  /**
   * 监听传感器数据变化事件
   * @param event 事件名
   * @param listener 回调函数
   */
  on(event: 'change', listener: (event: SensorEvent, ...args: number[]) => void): this
  on(event: 'accuracy_change', listener: (accuracy: number) => void): this

  /**
   * 添加一次性监听器
   * @param event 事件名
   * @param listener 回调函数
   */
  once(event: 'change', listener: (event: SensorEvent, ...args: number[]) => void): this

  /**
   * 移除监听器
   * @param event 事件名
   * @param listener 回调函数
   */
  off(event: string, listener: (...args: any[]) => void): this
}

/**
 * 传感器延迟常量
 */
interface SensorDelay {
  /** 正常频率 */
  normal: number
  /** 适合用户界面的更新频率 */
  ui: number
  /** 适合游戏的更新频率 */
  game: number
  /** 最快的更新频率 */
  fastest: number
}

/**
 * 传感器类型
 */
type SensorName =
  | 'accelerometer'
  | 'orientation'
  | 'gyroscope'
  | 'magnetic_field'
  | 'gravity'
  | 'linear_acceleration'
  | 'ambient_temperature'
  | 'light'
  | 'pressure'
  | 'proximity'
  | 'relative_humidity'

/**
 * sensors 模块提供获取手机传感器信息的支持
 */
interface Sensors {
  /** 传感器数据更新频率常量 */
  delay: SensorDelay

  /** 是否忽略不支持的传感器 */
  ignoresUnsupportedSensor: boolean

  /**
   * 注册一个传感器监听
   * @param sensorName 传感器名称
   * @param delay 数据更新频率，默认为 sensors.delay.normal
   * @returns 传感器事件发射器，如果不支持返回 null
   */
  register(sensorName: SensorName | string, delay?: number): SensorEventEmitter | null

  /**
   * 注销传感器监听器
   * @param emitter 传感器事件发射器
   */
  unregister(emitter: SensorEventEmitter): void

  /** 注销所有传感器监听器 */
  unregisterAll(): void

  /**
   * 监听不支持的传感器事件
   * @param event 事件名
   * @param listener 回调函数
   */
  on(event: 'unsupported_sensor', listener: (sensorName: string) => void): this
}

declare const sensors: Sensors
