/**
 * device 模块提供了与设备有关的信息与操作，例如获取设备宽高，内存使用率，IMEI，调整设备亮度、音量等。
 *
 * 此模块的部分函数，例如调整音量，需要"修改系统设置"的权限。如果没有该权限，会抛出 SecurityException 并跳转到权限设置界面。
 */
declare let device: {
  /**
   * 设备屏幕分辨率宽度。
   * @example 1080
   */
  width: number
  /**
   * 设备屏幕分辨率高度。
   * @example 1920
   */
  height: number
  /**
   * 修订版本号，或者诸如 "M4-rc20" 的标识。
   * Either a changelist number, or a label like "M4-rc20".
   */
  buildId: string
  /**
   * 设备的主板型号。
   * The name of the underlying board, like "goldfish".
   */
  broad: string
  /**
   * 与产品或硬件相关的厂商品牌，如 "Xiaomi", "Huawei" 等。
   * The consumer-visible brand with which the product/hardware will be associated, if any.
   */
  brand: string
  /**
   * 设备在工业设计中的名称。
   * The name of the industrial design.
   */
  device: string
  /**
   * 设备型号。
   * The end-user-visible name for the end product.
   */
  model: string
  /**
   * 整个产品的名称。
   * The name of the overall product.
   */
  product: string
  /**
   * 设备 Bootloader 的版本。
   * The system bootloader version number.
   */
  bootloader: string
  /**
   * 设备的硬件名称 (来自内核命令行或 /proc)。
   * The name of the hardware (from the kernel command line or /proc).
   */
  hardware: string
  /**
   * 构建 (build) 的唯一标识码。
   * A string that uniquely identifies this build. Do not attempt to parse this value.
   */
  fingerprint: string
  /**
   * 硬件序列号。
   * A hardware serial number, if available. Alphanumeric only, case-insensitive.
   */
  serial: string
  /**
   * 安卓系统 API 版本。例如安卓 4.4 的 sdkInt 为 19。
   * The user-visible SDK version of the framework.
   */
  sdkInt: number
  /**
   * 内部版本控制值，用于表示此构建。
   * The internal value used by the underlying source control to represent this build.
   */
  incremental: string
  /**
   * Android 系统版本号。例如 "5.0", "7.1.1"。
   * The user-visible version string. E.g., "1.0" or "3.4b5".
   */
  release: string
  /**
   * 产品所基于的基础操作系统构建。
   * The base OS build the product is based on.
   */
  baseOS: string
  /**
   * 安全补丁程序级别。
   * The user-visible security patch level.
   */
  securityPatch: string
  /**
   * 开发代号，例如发行版是 "REL"。
   * The current development codename, or the string "REL" if this is a release build.
   */
  codename: string

  /**
   * 返回设备的 IMEI。
   * @returns 设备的 IMEI
   */
  getIMEI: () => string
  /**
   * 返回设备的 Android ID。
   * Android ID 为一个用 16 进制字符串表示的 64 位整数，在设备第一次使用时随机生成，之后不会更改，除非恢复出厂设置。
   * @returns 设备的 Android ID
   */
  getAndroidId: () => string
  /**
   * 返回设备的 Mac 地址。该函数需要在有 WLAN 连接的情况下才能获取，否则会返回 null。
   * @returns 设备的 Mac 地址，没有 WLAN 连接时返回 null
   */
  getMacAddress: () => string | null

  /**
   * 返回当前的 (手动) 亮度。范围为 0~255。
   * @returns 当前亮度值
   */
  getBrightness: () => number
  /**
   * 返回当前亮度模式。
   * @returns 0 为手动亮度，1 为自动亮度
   */
  getBrightnessMode: () => number
  /**
   * 设置当前手动亮度。如果当前是自动亮度模式，该函数不会影响屏幕的亮度。
   * 此函数需要"修改系统设置"的权限。如果没有该权限，会抛出 SecurityException 并跳转到权限设置界面。
   * @param b 亮度，范围 0~255
   */
  setBrightness: (b: number) => void
  /**
   * 设置当前亮度模式。
   * 此函数需要"修改系统设置"的权限。如果没有该权限，会抛出 SecurityException 并跳转到权限设置界面。
   * @param mode 亮度模式，0 为手动亮度，1 为自动亮度
   */
  setBrightnessMode: (mode: number) => void

  /**
   * 返回当前媒体音量。
   * @returns 当前媒体音量
   */
  getMusicVolume: () => number
  /**
   * 返回当前通知音量。
   * @returns 当前通知音量
   */
  getNotificationVolume: () => number
  /**
   * 返回当前闹钟音量。
   * @returns 当前闹钟音量
   */
  getAlarmVolume: () => number
  /**
   * 返回媒体音量的最大值。
   * @returns 媒体音量最大值
   */
  getMusicMaxVolume: () => number
  /**
   * 返回通知音量的最大值。
   * @returns 通知音量最大值
   */
  getNotificationMaxVolume: () => number
  /**
   * 返回闹钟音量的最大值。
   * @returns 闹钟音量最大值
   */
  getAlarmMaxVolume: () => number
  /**
   * 设置当前媒体音量。
   * 此函数需要"修改系统设置"的权限。如果没有该权限，会抛出 SecurityException 并跳转到权限设置界面。
   * @param volume 音量
   */
  setMusicVolume: (volume: number) => void
  /**
   * 设置当前通知音量。
   * 此函数需要"修改系统设置"的权限。如果没有该权限，会抛出 SecurityException 并跳转到权限设置界面。
   * @param volume 音量
   */
  setNotificationVolume: (volume: number) => void
  /**
   * 设置当前闹钟音量。
   * 此函数需要"修改系统设置"的权限。如果没有该权限，会抛出 SecurityException 并跳转到权限设置界面。
   * @param volume 音量
   */
  setAlarmVolume: (volume: number) => void

  /**
   * 返回当前电量百分比。
   * @returns 0.0~100.0 的浮点数
   */
  getBattery: () => number
  /**
   * 返回设备是否正在充电。
   * @returns 是否正在充电
   */
  isCharging: () => boolean
  /**
   * 返回设备内存总量，单位字节 (B)。1MB = 1024 * 1024B。
   * @returns 设备内存总量
   */
  getTotalMem: () => number
  /**
   * 返回设备当前可用的内存，单位字节 (B)。
   * @returns 当前可用内存
   */
  getAvailMem: () => number

  /**
   * 返回设备屏幕是否是亮着的。
   * 需要注意的是，类似于 vivo xplay 系列的息屏时钟不属于"屏幕亮着"的情况。
   * @returns 如果屏幕亮着，返回 true; 否则返回 false
   */
  isScreenOn: () => boolean
  /**
   * 唤醒设备。包括唤醒设备 CPU、屏幕等。可以用来点亮屏幕。
   */
  wakeUp: () => void
  /**
   * 如果屏幕没有点亮，则唤醒设备。
   */
  wakeUpIfNeeded: () => void
  /**
   * 保持屏幕常亮。
   * 此函数无法阻止用户使用锁屏键等正常关闭屏幕，只能使得设备在无人操作的情况下保持屏幕常亮；
   * 同时，如果此函数调用时屏幕没有点亮，则会唤醒屏幕。
   * 可以使用 device.cancelKeepingAwake() 来取消屏幕常亮。
   * @param timeout 屏幕保持常亮的时间，单位毫秒。如果不加此参数，则一直保持屏幕常亮。
   * @example
   * // 一直保持屏幕常亮
   * device.keepScreenOn()
   */
  keepScreenOn: (timeout?: number) => void
  /**
   * 保持屏幕常亮，但允许屏幕变暗来节省电量。
   * 此函数可以用于定时脚本唤醒屏幕操作，不需要用户观看屏幕，可以让屏幕变暗来节省电量。
   * 可以使用 device.cancelKeepingAwake() 来取消屏幕常亮。
   * @param timeout 屏幕保持常亮的时间，单位毫秒。如果不加此参数，则一直保持屏幕常亮。
   */
  keepScreenDim: (timeout?: number) => void
  /**
   * 取消设备保持唤醒状态。用于取消 device.keepScreenOn(), device.keepScreenDim() 等函数设置的屏幕常亮。
   */
  cancelKeepingAwake: () => void

  /**
   * 使设备震动一段时间。
   * @param millis 震动时间，单位毫秒
   * @example
   * // 震动两秒
   * device.vibrate(2000);
   */
  vibrate: (millis: number) => void
  /**
   * 如果设备处于震动状态，则取消震动。
   * @since v4.2.7
   */
  cancelVibration: () => void

  /**
   * 检查设备是否存在虚拟导航栏。
   * @returns 是否存在虚拟导航栏
   * @since v4.2.7
   */
  checkDeviceHasNavigationBar: () => boolean
  /**
   * 获取设备虚拟导航栏的高度。
   * 可以用设备高度减去这个高度，再按一定比例点击底部附近的坐标。
   * @returns 导航栏的高度
   * @since v4.2.7
   */
  getVirtualBarHeigh: () => number
}
