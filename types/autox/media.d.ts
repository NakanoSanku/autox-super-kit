/**
 * media 模块提供多媒体编程支持
 */
interface Media {
  /**
   * 扫描媒体文件，将其加入媒体库
   * @param path 媒体文件路径
   */
  scanFile(path: string): void

  /**
   * 播放音乐文件
   * @param path 音乐文件路径
   * @param volume 播放音量，0~1，默认为 1
   * @param looping 是否循环播放，默认 false
   */
  playMusic(path: string, volume?: number, looping?: boolean): void

  /**
   * 调整当前播放进度
   * @param msec 毫秒数
   */
  musicSeekTo(msec: number): void

  /** 暂停音乐播放 */
  pauseMusic(): void

  /** 继续音乐播放 */
  resumeMusic(): void

  /** 停止音乐播放 */
  stopMusic(): void

  /**
   * 返回当前是否正在播放音乐
   * @returns 是否正在播放
   */
  isMusicPlaying(): boolean

  /**
   * 返回当前音乐的时长
   * @returns 时长，单位毫秒
   */
  getMusicDuration(): number

  /**
   * 返回当前音乐的播放进度
   * @returns 已播放时间，单位毫秒
   */
  getMusicCurrentPosition(): number
}

declare const media: Media
