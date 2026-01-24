/**
 * 消息推送模块 - 统一的消息推送接口
 * @module pusher
 * @description 提供统一的消息推送功能，支持多种推送服务（PushPlus、Telegram、企业微信等）
 *
 * @example
 * ```typescript
 * import { createPusher, PushPlusPusher } from './pusher'
 *
 * // 方式一：使用工厂函数
 * const pusher = createPusher({ type: 'pushplus', token: 'your-token' })
 * pusher.send('标题', '消息内容')
 *
 * // 方式二：直接实例化
 * const pp = new PushPlusPusher({ token: 'your-token' })
 * pp.send('任务完成', '御魂任务已完成 50 次')
 * ```
 */

import { createLogger } from './logger'

const log = createLogger('Pusher')

/**
 * 推送结果接口
 * @description 定义推送操作的返回结果
 */
interface PushResult {
  /** 是否推送成功 */
  success: boolean
  /** 错误信息（失败时） */
  error?: string
  /** 原始响应数据 */
  raw?: any
}

/**
 * 推送器抽象基类
 * @description 定义推送器的基本接口
 * @abstract
 */
abstract class Pusher {
  /** 推送器名称 */
  abstract readonly name: string

  /**
   * 发送推送消息
   * @param title - 消息标题
   * @param content - 消息内容
   * @returns 推送结果
   */
  abstract send(title: string, content: string): PushResult

  /**
   * 测试推送是否可用
   * @returns 测试结果
   */
  test(): PushResult {
    return this.send('测试消息', `来自 ${this.name} 的测试推送`)
  }
}

/**
 * PushPlus 消息模板类型
 */
type PushPlusTemplate = 'html' | 'txt' | 'json' | 'markdown'

/**
 * PushPlus 推送器配置选项
 */
interface PushPlusOptions {
  /**
   * PushPlus Token
   * @description 在 https://www.pushplus.plus 获取
   */
  token: string

  /**
   * 消息模板
   * @default 'html'
   */
  template?: PushPlusTemplate

  /**
   * 群组编码（一对多推送时使用）
   * @description 不填仅发送给自己
   */
  topic?: string

  /**
   * 发送渠道
   * @description wechat-微信公众号, webhook-第三方webhook, cp-企业微信应用, mail-邮件
   * @default 'wechat'
   */
  channel?: 'wechat' | 'webhook' | 'cp' | 'mail'

  /**
   * webhook 地址（channel 为 webhook 时使用）
   */
  webhook?: string
}

/**
 * PushPlus 推送器
 * @description 基于 PushPlus 服务的消息推送实现
 * @see https://www.pushplus.plus/doc/
 * @extends Pusher
 */
class PushPlusPusher extends Pusher {
  readonly name = 'PushPlus'

  private readonly token: string
  private readonly template: PushPlusTemplate
  private readonly topic?: string
  private readonly channel: string
  private readonly webhook?: string

  private static readonly API_URL = 'https://www.pushplus.plus/send'

  /**
   * 创建 PushPlus 推送器实例
   * @param options - 配置选项
   */
  constructor(options: PushPlusOptions) {
    super()
    this.token = options.token
    this.template = options.template ?? 'html'
    this.topic = options.topic
    this.channel = options.channel ?? 'wechat'
    this.webhook = options.webhook
  }

  /**
   * 发送推送消息
   * @param title - 消息标题
   * @param content - 消息内容
   * @returns 推送结果
   */
  send(title: string, content: string): PushResult {
    try {
      const body: Record<string, any> = {
        token: this.token,
        title,
        content,
        template: this.template,
        channel: this.channel,
      }

      if (this.topic) {
        body.topic = this.topic
      }
      if (this.webhook) {
        body.webhook = this.webhook
      }

      log.debug(`发送推送: ${title}`)

      const response = http.postJson(PushPlusPusher.API_URL, body)

      if (!response) {
        log.error('推送失败: 无响应')
        return { success: false, error: '无响应' }
      }

      const result = response.body?.json()

      if (result?.code === 200) {
        log.info(`推送成功: ${title}`)
        return { success: true, raw: result }
      }

      const errorMsg = result?.msg ?? '未知错误'
      log.error(`推送失败: ${errorMsg}`)
      return { success: false, error: errorMsg, raw: result }
    }
    catch (e: any) {
      const errorMsg = e?.message ?? String(e)
      log.error(`推送异常: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  }
}

/**
 * 推送器工厂选项类型
 */
type PusherFactoryOptions
  = ({ type: 'pushplus' } & PushPlusOptions)
// 预留其他推送服务扩展
// | ({ type: 'telegram' } & TelegramOptions)
// | ({ type: 'wechat_work' } & WechatWorkOptions)
// | ({ type: 'email' } & EmailOptions)

/**
 * 创建推送器
 * @description 根据配置创建对应类型的推送器实例
 * @param options - 推送器配置选项
 * @returns 推送器实例
 *
 * @example
 * ```typescript
 * // 创建 PushPlus 推送器
 * const pusher = createPusher({
 *   type: 'pushplus',
 *   token: 'your-token',
 *   template: 'markdown'
 * })
 *
 * // 发送消息
 * const result = pusher.send('任务通知', '## 任务完成\n- 御魂 x50')
 * if (result.success) {
 *   console.log('推送成功')
 * }
 * ```
 */
function createPusher(options: PusherFactoryOptions): Pusher {
  switch (options.type) {
    case 'pushplus':
      return new PushPlusPusher(options)
    default:
      throw new Error(`不支持的推送器类型: ${(options as any).type}`)
  }
}

export {
  createPusher,
  Pusher,
  PushPlusPusher,
}

export type {
  PusherFactoryOptions,
  PushPlusOptions,
  PushPlusTemplate,
  PushResult,
}
