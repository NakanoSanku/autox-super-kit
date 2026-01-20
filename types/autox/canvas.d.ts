/**
 * 画笔样式
 */
declare namespace Paint {
  const STYLE: {
    FILL: any
    STROKE: any
    FILL_AND_STROKE: any
  }
}

/**
 * 画笔类
 */
declare class Paint {
  constructor()

  /**
   * 设置画笔样式
   * @param style 样式：Paint.STYLE.FILL, Paint.STYLE.STROKE, Paint.STYLE.FILL_AND_STROKE
   */
  setStyle(style: any): void

  /**
   * 设置画笔颜色
   * @param color 颜色值
   */
  setColor(color: number): void

  /**
   * 设置画笔宽度
   * @param width 宽度
   */
  setStrokeWidth(width: number): void

  /**
   * 设置抗锯齿
   * @param aa 是否开启抗锯齿
   */
  setAntiAlias(aa: boolean): void

  /**
   * 设置文字大小
   * @param size 文字大小
   */
  setTextSize(size: number): void
}

/**
 * Canvas 画布
 */
interface Canvas {
  /**
   * 绘制 ARGB 颜色
   * @param a Alpha 值
   * @param r 红色值
   * @param g 绿色值
   * @param b 蓝色值
   */
  drawARGB(a: number, r: number, g: number, b: number): void

  /**
   * 绘制线段
   * @param startX 起点 X 坐标
   * @param startY 起点 Y 坐标
   * @param stopX 终点 X 坐标
   * @param stopY 终点 Y 坐标
   * @param paint 画笔
   */
  drawLine(startX: number, startY: number, stopX: number, stopY: number, paint: Paint): void

  /**
   * 绘制矩形
   * @param left 左边界
   * @param top 上边界
   * @param right 右边界
   * @param bottom 下边界
   * @param paint 画笔
   */
  drawRect(left: number, top: number, right: number, bottom: number, paint: Paint): void

  /**
   * 绘制圆形
   * @param cx 圆心 X 坐标
   * @param cy 圆心 Y 坐标
   * @param radius 半径
   * @param paint 画笔
   */
  drawCircle(cx: number, cy: number, radius: number, paint: Paint): void

  /**
   * 绘制椭圆
   * @param left 左边界
   * @param top 上边界
   * @param right 右边界
   * @param bottom 下边界
   * @param paint 画笔
   */
  drawOval(left: number, top: number, right: number, bottom: number, paint: Paint): void

  /**
   * 绘制圆弧
   * @param left 左边界
   * @param top 上边界
   * @param right 右边界
   * @param bottom 下边界
   * @param startAngle 起始角度
   * @param sweepAngle 扫过角度
   * @param useCenter 是否使用中心点
   * @param paint 画笔
   */
  drawArc(
    left: number,
    top: number,
    right: number,
    bottom: number,
    startAngle: number,
    sweepAngle: number,
    useCenter: boolean,
    paint: Paint
  ): void

  /**
   * 绘制文字
   * @param text 文字内容
   * @param x X 坐标
   * @param y Y 坐标
   * @param paint 画笔
   */
  drawText(text: string, x: number, y: number, paint: Paint): void

  /**
   * 绘制点
   * @param x X 坐标
   * @param y Y 坐标
   * @param paint 画笔
   */
  drawPoint(x: number, y: number, paint: Paint): void

  /**
   * 绘制图片
   * @param image 图片
   * @param left 左边界
   * @param top 上边界
   * @param paint 画笔（可选）
   */
  drawImage(image: any, left: number, top: number, paint?: Paint): void

  /** 获取画布宽度 */
  getWidth(): number

  /** 获取画布高度 */
  getHeight(): number

  /** 保存画布状态 */
  save(): number

  /** 恢复画布状态 */
  restore(): void

  /**
   * 平移画布
   * @param dx X 方向位移
   * @param dy Y 方向位移
   */
  translate(dx: number, dy: number): void

  /**
   * 旋转画布
   * @param degrees 旋转角度
   */
  rotate(degrees: number): void

  /**
   * 缩放画布
   * @param sx X 方向缩放比例
   * @param sy Y 方向缩放比例
   */
  scale(sx: number, sy: number): void
}
