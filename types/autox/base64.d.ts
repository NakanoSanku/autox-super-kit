/**
 * Base64 编码解码模块
 */
interface Base64 {
  /**
   * 将字符串使用 Base64 编码
   * @param str 要编码的字符串
   * @param encoding 字符编码，默认 'utf-8'
   * @returns 编码后的字符串
   */
  encode(str: string, encoding?: string): string

  /**
   * 将字符串使用 Base64 解码
   * @param str 要解码的字符串
   * @param encoding 字符编码，默认 'utf-8'
   * @returns 解码后的字符串
   */
  decode(str: string, encoding?: string): string
}

declare const $base64: Base64
