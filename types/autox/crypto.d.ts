/**
 * 加密解密选项
 */
interface CryptoOptions {
  /** 输入类型: 'string' | 'file' | 'base64' */
  input?: 'string' | 'file' | 'base64'
  /** 输出类型: 'string' | 'base64' | 'hex' */
  output?: 'string' | 'base64' | 'hex'
}

/**
 * 密钥对象
 */
declare class CryptoKey {
  /**
   * 创建密钥
   * @param key 密钥字符串或字节数组
   */
  constructor(key: string | number[])
}

/**
 * 密钥对
 */
interface KeyPair {
  /** 公钥 */
  publicKey: CryptoKey
  /** 私钥 */
  privateKey: CryptoKey
}

/**
 * $crypto 模块提供加密解密支持
 */
interface Crypto {
  /** 密钥类 */
  Key: typeof CryptoKey

  /**
   * 加密
   * @param data 要加密的数据
   * @param key 密钥
   * @param transformation 加密算法，如 "AES/ECB/PKCS5padding"
   * @param options 选项
   * @returns 加密后的数据
   */
  encrypt(
    data: string | number[],
    key: CryptoKey,
    transformation: string,
    options?: CryptoOptions
  ): number[]

  /**
   * 解密
   * @param data 要解密的数据
   * @param key 密钥
   * @param transformation 加密算法，如 "AES/ECB/PKCS5padding"
   * @param options 选项
   * @returns 解密后的数据
   */
  decrypt(
    data: number[],
    key: CryptoKey,
    transformation: string,
    options?: CryptoOptions
  ): string | number[]

  /**
   * 消息摘要
   * @param data 要计算摘要的数据
   * @param algorithm 算法，如 "MD5"、"SHA-1"、"SHA-256"
   * @param options 选项
   * @returns 摘要结果
   */
  digest(
    data: string,
    algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | string,
    options?: CryptoOptions
  ): string

  /**
   * 生成密钥对
   * @param algorithm 算法，如 "RSA"
   * @param length 密钥长度
   * @returns 密钥对
   */
  generateKeyPair(algorithm: string, length?: number): KeyPair
}

declare const $crypto: Crypto
