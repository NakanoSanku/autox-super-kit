/**
 * OCR 识别结果项
 */
interface PaddleOcrResultItem {
  /** 文本区域边界 */
  bounds: {
    left: number
    top: number
    right: number
    bottom: number
  }
  /** 置信度 */
  confidence: number
  /** 推理时间 */
  inferenceTime: number
  /** 预处理时间 */
  preprocessTime: number
  /** 识别的文本 */
  text: string
  /** 识别的文字 */
  words: string
}

/**
 * Paddle OCR 模块
 */
interface PaddleOcr {
  /**
   * 使用自定义模型进行文字识别
   * @param img 图片
   * @param path 自定义模型路径（绝对路径）
   * @returns 识别结果数组
   */
  ocr(img: any, path: string): PaddleOcrResultItem[]

  /**
   * 高精度识别，返回值包含坐标、置信度
   * @param img 图片
   * @param cpuThreadNum 识别使用的 CPU 核心数量，默认 4
   * @param useSlim 是否使用快速模型，默认 true
   * @returns 识别结果数组
   */
  ocr(img: any, cpuThreadNum?: number, useSlim?: boolean): PaddleOcrResultItem[]

  /**
   * 只返回文本识别信息
   * @param img 图片
   * @param cpuThreadNum 识别使用的 CPU 核心数量，默认 4
   * @param useSlim 是否使用快速模型，默认 true
   * @returns 字符串数组
   */
  ocrText(img: any, cpuThreadNum?: number, useSlim?: boolean): string[]

  /** 释放 native 内存 */
  release(): void
}

/**
 * Google ML Kit OCR 结果
 */
interface GmlkitOcrResult {
  /** 识别的完整文本 */
  text: string
}

/**
 * Google ML Kit OCR 模块
 */
interface GmlkitOcr {
  /**
   * 识别图片中的文字
   * @param img 图片
   * @param language 识别语言：la-拉丁, zh-中文, sa-梵文, ja-日语, ko-韩语
   * @returns 识别结果
   */
  ocr(img: any, language: 'la' | 'zh' | 'sa' | 'ja' | 'ko' | string): GmlkitOcrResult
}

declare const paddle: PaddleOcr
declare const gmlkit: GmlkitOcr
