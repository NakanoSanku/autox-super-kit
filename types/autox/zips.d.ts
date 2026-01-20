/**
 * zips 模块提供压缩和解压支持
 */
interface Zips {
  /**
   * 压缩文件或目录
   * @param type 压缩类型：zip, 7z, bz2, bzip2, tbz2, tbz, gz, gzip, tgz, tar, wim, swm, xz, txz
   * @param filePath 压缩文件路径（完整路径）
   * @param dirPath 要压缩的目录路径（完整路径）
   * @param password 压缩密码（可选）
   * @returns 返回码：0-成功，1-非致命错误，2-致命错误，7-命令行错误，8-内存不足，255-用户中止
   */
  A(type: string, filePath: string, dirPath: string, password?: string): number

  /**
   * 解压文件
   * @param filePath 压缩文件路径（完整路径）
   * @param dirPath 解压目标目录路径（完整路径）
   * @param password 解压密码（可选）
   * @returns 返回码：0-成功，1-非致命错误，2-致命错误，7-命令行错误，8-内存不足，255-用户中止
   */
  X(filePath: string, dirPath: string, password?: string): number
}

declare const zips: Zips
