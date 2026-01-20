/**
 * 生成正态分布随机数和人类化交互动作
 * 包括人类化点击和滑动
 */

import { defaultActionConfig } from "./config"

/** 点击选项 */
interface ClickOptions {
  /** 标准差系数，默认 0.2 */
  sigma?: number
  /** 点击后延迟 (ms)，默认 0 */
  delay?: number
  /** 按压时长 (ms)，默认随机 50-500 */
  duration?: number
}

/** 滑动选项 */
interface SwipeOptions {
  /** 滑动时长 (ms)，默认 300-500 随机 */
  duration?: number
  /** 路径点数量，默认 10 */
  steps?: number
  /** 滑动后延迟 (ms)，默认 0 */
  delay?: number
}

/**
 * Box-Muller 变换生成正态分布随机数
 * @param mean 均值
 * @param stdDev 标准差
 * @returns 正态分布随机数
 */
function gaussianRandom(mean: number, stdDev: number): number {
  let u1 = Math.random()
  if (u1 < Number.EPSILON) u1 = Number.EPSILON
  const u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

/**
 * 限制值在范围内
 * @param value 要限制的值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 生成正态分布的随机点（中心概率高，边缘概率低）
 * @param x 区域左上角 x
 * @param y 区域左上角 y
 * @param width 区域宽度
 * @param height 区域高度
 * @param sigma 标准差系数 (0-1)，默认 0.2，越小越集中
 * @returns 随机点坐标
 */
function gaussianPoint(x: number, y: number, width: number, height: number, sigma = defaultActionConfig.clickSigma): { x: number, y: number } {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const stdDevX = width * sigma
  const stdDevY = height * sigma

  const randX = gaussianRandom(centerX, stdDevX)
  const randY = gaussianRandom(centerY, stdDevY)

  return {
    x: Math.round(clamp(randX, x, x + width - 1)),
    y: Math.round(clamp(randY, y, y + height - 1)),
  }
}

/**
 * 生成随机延迟（正态分布）
 * @param base 基础延迟 (ms)
 * @param variance 变化范围 (ms)，默认为 base 的 20%
 * @returns 随机延迟时间 (ms)
 */
function gaussianDelay(base: number, variance?: number): number {
  const v = variance ?? base * 0.2
  const delay = gaussianRandom(base, v / 3)
  return Math.max(50, Math.round(delay))
}

/**
 * 正态分布随机点击区域
 * @param x 区域左上角 x
 * @param y 区域左上角 y
 * @param width 区域宽度
 * @param height 区域高度
 * @param options 点击选项
 */
function humanClick(
  x: number,
  y: number,
  width: number,
  height: number,
  options: ClickOptions = {},
): void {
  const { sigma = defaultActionConfig.clickSigma, delay = defaultActionConfig.clickDelay, duration } = options
  const point = gaussianPoint(x, y, width, height, sigma)
  let dur = duration ?? Math.round(gaussianRandom(150, 30))
  dur = clamp(dur, 50, 500)

  press(point.x, point.y, dur)

  if (delay > 0) {
    sleep(gaussianDelay(delay))
  }
}

/**
 * 计算三次贝塞尔曲线上的点
 * @param t 参数 [0,1]
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @returns 曲线上的点坐标
 */
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const t2 = t * t
  const t3 = t2 * t
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3
}

/**
 * 生成随机贝塞尔控制点
 * @param startX 起点 x
 * @param startY 起点 y
 * @param endX 终点 x
 * @param endY 终点 y
 * @returns 两个控制点坐标
 */
function generateControlPoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { cp1x: number, cp1y: number, cp2x: number, cp2y: number } {
  const dx = endX - startX
  const dy = endY - startY
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist < 1) {
    return {
      cp1x: startX + gaussianRandom(0, 2),
      cp1y: startY + gaussianRandom(0, 2),
      cp2x: endX + gaussianRandom(0, 2),
      cp2y: endY + gaussianRandom(0, 2),
    }
  }

  const curvature = clamp(gaussianRandom(0.2, 0.1), 0.05, 0.4)
  const offset = dist * curvature
  const perpX = -dy / dist
  const perpY = dx / dist
  const side = Math.random() > 0.5 ? 1 : -1

  return {
    cp1x: startX + dx * 0.3 + perpX * offset * side * gaussianRandom(1, 0.3),
    cp1y: startY + dy * 0.3 + perpY * offset * side * gaussianRandom(1, 0.3),
    cp2x: startX + dx * 0.7 + perpX * offset * side * gaussianRandom(0.5, 0.2),
    cp2y: startY + dy * 0.7 + perpY * offset * side * gaussianRandom(0.5, 0.2),
  }
}

/**
 * 生成人类化贝塞尔曲线滑动路径
 * @param startX 起点 x
 * @param startY 起点 y
 * @param endX 终点 x
 * @param endY 终点 y
 * @param steps 路径点数量，默认 10
 * @returns 路径点数组
 */
function generateSwipePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  steps = defaultActionConfig.swipeSteps,
): Array<[number, number]> {
  const cp = generateControlPoints(startX, startY, endX, endY)
  const path: Array<[number, number]> = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    let x = cubicBezier(easeT, startX, cp.cp1x, cp.cp2x, endX)
    let y = cubicBezier(easeT, startY, cp.cp1y, cp.cp2y, endY)

    x += gaussianRandom(0, 1.5)
    y += gaussianRandom(0, 1.5)

    path.push([Math.round(x), Math.round(y)])
  }

  return path
}

/**
 * 人类化滑动（使用 gesture 实现）
 * @param startX 起点 x
 * @param startY 起点 y
 * @param endX 终点 x
 * @param endY 终点 y
 * @param options 滑动选项
 */
function humanSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: SwipeOptions = {},
): void {
  const { duration, steps = 10, delay = 0 } = options
  let dur = duration ?? Math.round(gaussianRandom(400, 50))
  dur = clamp(dur, 200, 1000)

  const path = generateSwipePath(startX, startY, endX, endY, steps)
  gesture(dur, ...path)

  if (delay > 0) {
    sleep(gaussianDelay(delay))
  }
}

export {
  gaussianPoint,
  humanClick,
  humanSwipe,
}

export type {
  ClickOptions,
  SwipeOptions,
}
