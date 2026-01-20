/**
 * colors 模块提供颜色相关的工具函数。
 *
 * 在 Auto.js 有两种方式表示一个颜色：
 * - 使用字符串 "#AARRGGBB" 或 "#RRGGBB"
 * - 使用 16 进制的 32 位整数 0xAARRGGBB
 *
 * @stability 稳定
 */
declare let colors: {
  /**
   * 返回颜色值的字符串，格式为 "#AARRGGBB"。
   * @param color 整数 RGB 颜色值
   * @returns 颜色字符串
   */
  toString: (color: number) => string

  /**
   * 返回颜色的 R 通道的值，范围 0~255。
   * @param color 颜色值
   * @returns R 通道值
   */
  red: (color: number | string) => number

  /**
   * 返回颜色的 G 通道的值，范围 0~255。
   * @param color 颜色值
   * @returns G 通道值
   */
  green: (color: number | string) => number

  /**
   * 返回颜色的 B 通道的值，范围 0~255。
   * @param color 颜色值
   * @returns B 通道值
   */
  blue: (color: number | string) => number

  /**
   * 返回颜色的 Alpha 通道的值，范围 0~255。
   * @param color 颜色值
   * @returns Alpha 通道值
   */
  alpha: (color: number | string) => number

  /**
   * 返回这些颜色通道构成的整数颜色值。Alpha 通道将是 255（不透明）。
   * @param red 颜色的 R 通道的值
   * @param green 颜色的 G 通道的值
   * @param blue 颜色的 B 通道的值
   * @returns 整数颜色值
   */
  rgb: (red: number, green: number, blue: number) => number

  /**
   * 返回这些颜色通道构成的整数颜色值。
   * @param alpha 颜色的 Alpha 通道的值
   * @param red 颜色的 R 通道的值
   * @param green 颜色的 G 通道的值
   * @param blue 颜色的 B 通道的值
   * @returns 整数颜色值
   */
  argb: (alpha: number, red: number, green: number, blue: number) => number

  /**
   * 返回颜色的整数值。
   * @param colorStr 表示颜色的字符串，例如 "#112233"
   * @returns 整数颜色值
   */
  parseColor: (colorStr: string) => number

  /**
   * 返回两个颜色是否相似。
   * @param color1 颜色值 1
   * @param color2 颜色值 2
   * @param threshold 颜色相似度临界值，默认为 4。取值范围为 0~255。
   * @param algorithm 颜色匹配算法，默认为 "diff"
   * @returns 是否相似
   */
  isSimilar: (
    color1: number | string,
    color2: number | string,
    threshold?: number,
    algorithm?: 'diff' | 'rgb' | 'rgb+' | 'hs'
  ) => boolean

  /**
   * 返回两个颜色是否相等。注意该函数会忽略 Alpha 通道的值进行比较。
   * @param color1 颜色值 1
   * @param color2 颜色值 2
   * @returns 是否相等
   */
  equals: (color1: number | string, color2: number | string) => boolean

  /** 黑色，颜色值 #FF000000 */
  BLACK: number
  /** 深灰色，颜色值 #FF444444 */
  DKGRAY: number
  /** 灰色，颜色值 #FF888888 */
  GRAY: number
  /** 亮灰色，颜色值 #FFCCCCCC */
  LTGRAY: number
  /** 白色，颜色值 #FFFFFFFF */
  WHITE: number
  /** 红色，颜色值 #FFFF0000 */
  RED: number
  /** 绿色，颜色值 #FF00FF00 */
  GREEN: number
  /** 蓝色，颜色值 #FF0000FF */
  BLUE: number
  /** 黄色，颜色值 #FFFFFF00 */
  YELLOW: number
  /** 青色，颜色值 #FF00FFFF */
  CYAN: number
  /** 品红色，颜色值 #FFFF00FF */
  MAGENTA: number
  /** 透明，颜色值 #00000000 */
  TRANSPARENT: number
}

/**
 * images 模块提供了一些手机设备中常见的图片处理函数，包括截图、读写图片、图片剪裁、旋转、二值化、找色找图等。
 *
 * 注意：Image 对象创建后尽量在不使用时进行回收（调用 recycle()），避免内存泄漏。
 * 例外：captureScreen() 返回的图片不需要回收。
 *
 * @stability 稳定
 */
declare let images: {
  // ==================== 图片处理 ====================

  /**
   * 读取在路径 path 的图片文件并返回一个 Image 对象。如果文件不存在或者文件无法解码则返回 null。
   * @param path 图片路径
   * @returns Image 对象或 null
   */
  read: (path: string) => Image | null

  /**
   * 加载在地址 URL 的网络图片并返回一个 Image 对象。如果地址不存在或者图片无法解码则返回 null。
   * @param url 图片 URL 地址
   * @returns Image 对象或 null
   */
  load: (url: string) => Image | null

  /**
   * 复制一张图片并返回新的副本。该函数会完全复制 img 对象的数据。
   * @param img 图片
   * @returns 新的 Image 对象
   */
  copy: (img: Image) => Image

  /**
   * 把图片保存到 path 中。如果文件不存在会被创建；文件存在会被覆盖。
   * @param image 图片
   * @param path 路径
   * @param format 图片格式，可选值为 "png", "jpeg"/"jpg", "webp"
   * @param quality 图片质量，为 0~100 的整数值
   */
  save: (image: Image, path: string, format?: 'png' | 'jpeg' | 'jpg' | 'webp', quality?: number) => void

  /**
   * 解码 Base64 数据并返回解码后的图片 Image 对象。如果 base64 无法解码则返回 null。
   * @param base64 图片的 Base64 数据
   * @returns Image 对象或 null
   */
  fromBase64: (base64: string) => Image | null

  /**
   * 把图片编码为 base64 数据并返回。
   * @param img 图片
   * @param format 图片格式
   * @param quality 图片质量，为 0~100 的整数值
   * @returns Base64 字符串
   */
  toBase64: (img: Image, format?: 'png' | 'jpeg' | 'jpg' | 'webp', quality?: number) => string

  /**
   * 解码字节数组 bytes 并返回解码后的图片 Image 对象。如果 bytes 无法解码则返回 null。
   * @param bytes 字节数组
   * @returns Image 对象或 null
   */
  fromBytes: (bytes: number[]) => Image | null

  /**
   * 把图片编码为字节数组并返回。
   * @param img 图片
   * @param format 图片格式
   * @param quality 图片质量，为 0~100 的整数值
   * @returns 字节数组
   */
  toBytes: (img: Image, format?: 'png' | 'jpeg' | 'jpg' | 'webp', quality?: number) => number[]

  /**
   * 从图片 img 的位置 (x, y) 处剪切大小为 w * h 的区域，并返回该剪切区域的新图片。
   * @param img 图片
   * @param x 剪切区域的左上角横坐标
   * @param y 剪切区域的左上角纵坐标
   * @param w 剪切区域的宽度
   * @param h 剪切区域的高度
   * @returns 剪切后的新图片
   */
  clip: (img: Image, x: number, y: number, w: number, h: number) => Image

  /**
   * 调整图片大小，并返回调整后的图片。
   * @param img 图片
   * @param size 两个元素的数组 [w, h]，分别表示宽度和高度
   * @param interpolation 插值方法，默认为 "LINEAR"
   * @returns 调整后的图片
   * @since v4.1.0
   */
  resize: (img: Image, size: [number, number], interpolation?: InterpolationType) => Image

  /**
   * 放缩图片，并返回放缩后的图片。
   * @param img 图片
   * @param fx 宽度放缩倍数
   * @param fy 高度放缩倍数
   * @param interpolation 插值方法，默认为 "LINEAR"
   * @returns 放缩后的图片
   * @since v4.1.0
   */
  scale: (img: Image, fx: number, fy: number, interpolation?: InterpolationType) => Image

  /**
   * 将图片逆时针旋转 degrees 度，返回旋转后的图片对象。
   * @param img 图片
   * @param degrees 旋转角度
   * @param x 旋转中心 x 坐标，默认为图片中点
   * @param y 旋转中心 y 坐标，默认为图片中点
   * @returns 旋转后的图片
   * @since v4.1.0
   */
  rotate: (img: Image, degrees: number, x?: number, y?: number) => Image

  /**
   * 连接两张图片，并返回连接后的图像。如果两张图片大小不一致，小的那张将适当居中。
   * @param img1 图片 1
   * @param img2 图片 2
   * @param direction 连接方向，默认为 "RIGHT"
   * @returns 连接后的图片
   * @since v4.1.0
   */
  concat: (img1: Image, img2: Image, direction?: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM') => Image

  /**
   * 灰度化图片，并返回灰度化后的图片。
   * @param img 图片
   * @returns 灰度化后的图片
   * @since v4.1.0
   */
  grayscale: (img: Image) => Image

  /**
   * 将图片阈值化，并返回处理后的图像。可以用这个函数进行图片二值化。
   * @param img 图片
   * @param threshold 阈值
   * @param maxVal 最大值
   * @param type 阈值化类型，默认为 "BINARY"
   * @returns 处理后的图片
   * @since v4.1.0
   */
  threshold: (
    img: Image,
    threshold: number,
    maxVal: number,
    type?: 'BINARY' | 'BINARY_INV' | 'TRUNC' | 'TOZERO' | 'TOZERO_INV' | 'OTSU' | 'TRIANGLE'
  ) => Image

  /**
   * 对图片进行自适应阈值化处理，并返回处理后的图像。
   * @param img 图片
   * @param maxValue 最大值
   * @param adaptiveMethod 自适应方法
   * @param thresholdType 阈值化类型
   * @param blockSize 邻域块大小
   * @param C 偏移值调整量
   * @returns 处理后的图片
   * @since v4.1.0
   */
  adaptiveThreshold: (
    img: Image,
    maxValue: number,
    adaptiveMethod: 'MEAN_C' | 'GAUSSIAN_C',
    thresholdType: 'BINARY' | 'BINARY_INV',
    blockSize: number,
    C: number
  ) => Image

  /**
   * 对图像进行颜色空间转换，并返回转换后的图像。
   * @param img 图片
   * @param code 颜色空间转换的类型
   * @param dstCn 目标图像的颜色通道数量
   * @returns 转换后的图片
   * @since v4.1.0
   */
  cvtColor: (img: Image, code: string, dstCn?: number) => Image

  /**
   * 将图片二值化，在 lowerBound~upperBound 范围以外的颜色都变成 0，在范围以内的颜色都变成 255。
   * @param img 图片
   * @param lowerBound 颜色下界
   * @param upperBound 颜色上界
   * @returns 二值化后的图片
   * @since v4.1.0
   */
  inRange: (img: Image, lowerBound: string | number, upperBound: string | number) => Image

  /**
   * 将图片二值化，在 color-interval ~ color+interval 范围以外的颜色都变成 0，在范围以内的颜色都变成 255。
   * @param img 图片
   * @param color 颜色值
   * @param interval 每个通道的范围间隔
   * @returns 二值化后的图片
   * @since v4.1.0
   */
  interval: (img: Image, color: string | number, interval: number) => Image

  /**
   * 对图像进行模糊（平滑处理），返回处理后的图像。
   * @param img 图片
   * @param size 定义滤波器的大小，如 [3, 3]
   * @param anchor 指定锚点位置，默认为图像中心
   * @param type 推断边缘像素类型，默认为 "DEFAULT"
   * @returns 模糊后的图片
   * @since v4.1.0
   */
  blur: (img: Image, size: [number, number], anchor?: [number, number], type?: BorderType) => Image

  /**
   * 对图像进行中值滤波，返回处理后的图像。
   * @param img 图片
   * @param size 定义滤波器的大小，如 [3, 3]
   * @returns 处理后的图片
   * @since v4.1.0
   */
  medianBlur: (img: Image, size: [number, number]) => Image

  /**
   * 对图像进行高斯模糊，返回处理后的图像。
   * @param img 图片
   * @param size 定义滤波器的大小，如 [3, 3]
   * @param sigmaX x 方向的标准方差
   * @param sigmaY y 方向的标准方差
   * @param type 推断边缘像素类型，默认为 "DEFAULT"
   * @returns 高斯模糊后的图片
   * @since v4.1.0
   */
  gaussianBlur: (
    img: Image,
    size: [number, number],
    sigmaX?: number,
    sigmaY?: number,
    type?: BorderType
  ) => Image

  /**
   * 把 Mat 对象转换为 Image 对象。
   * @param mat OpenCV 的 Mat 对象
   * @returns Image 对象
   * @since v4.1.0
   */
  matToImage: (mat: any) => Image

  // ==================== 找图找色 ====================

  /**
   * 向系统申请屏幕截图权限，返回是否请求成功，仅需执行一次。
   * @param landscape 截屏方向。true 横屏截图，false 竖屏截图，不指定则由当前设备屏幕方向决定。
   * @returns 是否请求成功
   */
  requestScreenCapture: (landscape?: boolean) => boolean

  /**
   * 截取当前屏幕并返回一个 Image 对象。
   * 没有截图权限时执行该函数会抛出 SecurityException。
   * @returns 截图 Image 对象
   */
  captureScreen(): Image

  /**
   * 截取当前屏幕并以 PNG 格式保存到 path 中。
   * @param path 截图保存路径
   */
  captureScreen(path: string): void

  /**
   * 返回图片 image 在点 (x, y) 处的像素的 ARGB 值。
   * @param image 图片
   * @param x 要获取的像素的横坐标
   * @param y 要获取的像素的纵坐标
   * @returns 像素的 ARGB 值
   */
  pixel: (image: Image, x: number, y: number) => number

  /**
   * 读取图片的像素数据和宽高。
   * @param path 图片的地址
   * @returns 包括图片的像素数据和宽高
   */
  readPixels: (path: string) => { data: number[]; width: number; height: number }

  /**
   * 在图片中寻找颜色 color。找到时返回找到的点 Point，找不到时返回 null。
   * @param image 图片
   * @param color 要寻找的颜色
   * @param options 选项
   * @returns 找到的点或 null
   */
  findColor: (image: Image, color: number | string, options?: FindColorOptions) => Point | null

  /**
   * 区域找色的简便方法。
   * @param img 图片
   * @param color 要寻找的颜色
   * @param x 找色区域的左上角横坐标
   * @param y 找色区域的左上角纵坐标
   * @param width 找色区域的宽度
   * @param height 找色区域的高度
   * @param threshold 颜色相似度临界值
   * @returns 找到的点或 null
   */
  findColorInRegion: (
    img: Image,
    color: number | string,
    x: number,
    y: number,
    width?: number,
    height?: number,
    threshold?: number
  ) => Point | null

  /**
   * 在图片 img 指定区域中找到颜色和 color 完全相等的某个点。
   * @param img 图片
   * @param color 要寻找的颜色
   * @param x 找色区域的左上角横坐标
   * @param y 找色区域的左上角纵坐标
   * @param width 找色区域的宽度
   * @param height 找色区域的高度
   * @returns 找到的点或 null
   */
  findColorEquals: (
    img: Image,
    color: number | string,
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ) => Point | null

  /**
   * 在图片中寻找所有颜色为 color 的点。
   * @param img 图片
   * @param color 要检测的颜色
   * @param options 选项
   * @returns 找到的点数组或 null
   */
  findAllPointsForColor: (img: Image, color: number | string, options?: FindColorOptions) => Point[] | null

  /**
   * 多点找色，类似于按键精灵的多点找色。
   * @param img 要找色的图片
   * @param firstColor 第一个点的颜色
   * @param colors 表示剩下的点相对于第一个点的位置和颜色的数组，数组的每个元素为 [x, y, color]
   * @param options 选项
   * @returns 找到的第一个点或 null
   */
  findMultiColors: (
    img: Image,
    firstColor: number | string,
    colors: Array<[number, number, number | string]>,
    options?: FindColorOptions
  ) => Point | null

  /**
   * 返回图片 image 在位置 (x, y) 处是否匹配到颜色 color。
   * @param image 图片
   * @param color 要检测的颜色
   * @param x 要检测的位置横坐标
   * @param y 要检测的位置纵坐标
   * @param threshold 颜色相似度临界值，默认为 16
   * @param algorithm 颜色匹配算法
   * @returns 是否匹配
   */
  detectsColor: (
    image: Image,
    color: number | string,
    x: number,
    y: number,
    threshold?: number,
    algorithm?: 'equal' | 'diff' | 'rgb' | 'rgb+' | 'hs'
  ) => boolean

  /**
   * 在大图片 img 中查找小图片 template 的位置（模板匹配）。
   * @param img 大图片
   * @param template 小图片（模板）
   * @param options 选项
   * @returns 找到的位置或 null
   */
  findImage: (img: Image, template: Image, options?: FindImageOptions) => Point | null

  /**
   * 区域找图的简便方法。
   * @param img 大图片
   * @param template 小图片
   * @param x 找图区域的左上角横坐标
   * @param y 找图区域的左上角纵坐标
   * @param width 找图区域的宽度
   * @param height 找图区域的高度
   * @param threshold 图片相似度
   * @returns 找到的位置或 null
   */
  findImageInRegion: (
    img: Image,
    template: Image,
    x: number,
    y: number,
    width?: number,
    height?: number,
    threshold?: number
  ) => Point | null

  /**
   * 在大图片中搜索小图片，并返回搜索结果 MatchingResult。
   * @param img 大图片
   * @param template 小图片（模板）
   * @param options 选项
   * @returns 匹配结果
   * @since v4.1.0
   */
  matchTemplate: (img: Image, template: Image, options?: MatchTemplateOptions) => MatchingResult

  /**
   * 在图片中寻找圆（做霍夫圆变换）。
   * @param gray 灰度图片
   * @param options 选项
   * @returns 找到的圆的数组或 null
   * @since v4.1.0
   */
  findCircles: (gray: Image, options?: FindCirclesOptions) => Array<{ x: number; y: number; radius: number }> | null
}

/**
 * 插值方法类型
 */
type InterpolationType = 'NEAREST' | 'LINEAR' | 'AREA' | 'CUBIC' | 'LANCZOS4'

/**
 * 边界类型
 */
type BorderType =
  | 'CONSTANT'
  | 'REPLICATE'
  | 'REFLECT'
  | 'WRAP'
  | 'REFLECT_101'
  | 'TRANSPARENT'
  | 'REFLECT101'
  | 'DEFAULT'
  | 'ISOLATED'

/**
 * 找色选项
 */
interface FindColorOptions {
  /**
   * 找色区域。是一个两个或四个元素的数组。
   * (region[0], region[1]) 表示找色区域的左上角；region[2]*region[3] 表示找色区域的宽高。
   */
  region?: [number, number] | [number, number, number, number]
  /** 颜色相似度临界值，范围为 0~255，默认为 4 */
  threshold?: number
  /** 颜色相似度，范围为 0~1 */
  similarity?: number
}
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * 找图选项
 */
interface FindImageOptions {
  /** 图片相似度，取值范围为 0~1，默认值为 0.9 */
  threshold?: number
  /** 找图区域 */
  region?: [number, number] | [number, number, number, number] | Rect
  /** 图像金字塔层次 */
  level?: number
}

/**
 * 模板匹配选项
 */
interface MatchTemplateOptions {
  /** 图片相似度，取值范围为 0~1，默认值为 0.9 */
  threshold?: number
  /** 找图区域 */
  region?: [number, number] | [number, number, number, number]
  /** 找图结果最大数量，默认为 5 */
  max?: number
  /** 图像金字塔层次 */
  level?: number
}

/**
 * 找圆选项
 */
interface FindCirclesOptions {
  /** 找圆区域 */
  region?: [number, number] | [number, number, number, number]
  /** 累加面分辨率参数，默认为 1 */
  dp?: number
  /** 两个圆心之间的最小距离，默认为图片高度的八分之一 */
  minDst?: number
  /** Canny 边缘检测的高阈值，默认为 100 */
  param1?: number
  /** 累加平面对是否是圆的判定阈值，默认为 100 */
  param2?: number
  /** 检测到的圆的半径的最小值，默认为 0 */
  minRadius?: number
  /** 检测到的圆的半径的最大值，0 为不限制，默认为 0 */
  maxRadius?: number
}

/**
 * 图片对象
 */
interface Image {
  /**
   * 返回以像素为单位图片宽度。
   * @returns 宽度
   */
  width: number

  /**
 * 返回以像素为单位的图片高度。
 * @returns 高度
 */
  height: number
  /**
   * 返回以像素为单位图片宽度。
   * @returns 宽度
   */
  getWidth(): number

  /**
   * 返回以像素为单位的图片高度。
   * @returns 高度
   */
  getHeight(): number

  /**
   * 把图片保存到路径 path。（如果文件存在则覆盖）
   * @param path 路径
   */
  saveTo(path: string): void

  /**
   * 返回图片在点 (x, y) 处的像素的 ARGB 值。
   * @param x 横坐标
   * @param y 纵坐标
   * @returns 像素的 ARGB 值
   */
  pixel(x: number, y: number): number

  /**
   * 回收图片资源。Image 对象通过调用此函数来回收。
   */
  recycle(): void
}

/**
 * 坐标点
 */
interface Point {
  /** 横坐标 */
  x: number
  /** 纵坐标 */
  y: number
}

/**
 * 匹配结果
 * @since v4.1.0
 */
interface MatchingResult {
  /** 匹配结果的数组 */
  matches: Match[]
  /** 匹配位置的数组 */
  points: Point[]

  /** 第一个匹配结果。如果没有任何匹配，则返回 null。 */
  first(): Match | null
  /** 最后一个匹配结果。如果没有任何匹配，则返回 null。 */
  last(): Match | null
  /** 位于大图片最左边的匹配结果。如果没有任何匹配，则返回 null。 */
  leftmost(): Match | null
  /** 位于大图片最上边的匹配结果。如果没有任何匹配，则返回 null。 */
  topmost(): Match | null
  /** 位于大图片最右边的匹配结果。如果没有任何匹配，则返回 null。 */
  rightmost(): Match | null
  /** 位于大图片最下边的匹配结果。如果没有任何匹配，则返回 null。 */
  bottommost(): Match | null
  /** 相似度最高的匹配结果。如果没有任何匹配，则返回 null。 */
  best(): Match | null
  /** 相似度最低的匹配结果。如果没有任何匹配，则返回 null。 */
  worst(): Match | null

  /**
   * 对匹配结果进行排序，并返回排序后的结果。
   * @param cmp 比较函数或排序方向字符串，如 "left", "top", "left-top"
   * @returns 排序后的结果
   */
  sortBy(cmp: string | ((a: Match, b: Match) => number)): MatchingResult
}

/**
 * 单个匹配结果
 */
interface Match {
  /** 匹配位置 */
  point: Point
  /** 相似度 */
  similarity: number
}

// ==================== 全局函数 ====================

/**
 * 向系统申请屏幕截图权限，返回是否请求成功，仅需执行一次。
 * @param landscape 截屏方向。true 横屏截图，false 竖屏截图，不指定则由当前设备屏幕方向决定。
 * @returns 是否请求成功
 */
declare function requestScreenCapture(landscape?: boolean): boolean

/**
 * 截取当前屏幕并返回一个 Image 对象。
 * @returns 截图 Image 对象
 */
declare function captureScreen(): Image

/**
 * 截取当前屏幕并以 PNG 格式保存到 path 中。
 * @param path 截图保存路径
 */
declare function captureScreen(path: string): void

/**
 * 在图片中寻找颜色 color。找到时返回找到的点 Point，找不到时返回 null。
 * @param image 图片
 * @param color 要寻找的颜色
 * @param options 选项
 * @returns 找到的点或 null
 */
declare function findColor(image: Image, color: number | string, options?: FindColorOptions): Point | null

/**
 * 在大图片 img 中查找小图片 template 的位置（模板匹配）。
 * @param img 大图片
 * @param template 小图片（模板）
 * @param options 选项
 * @returns 找到的位置或 null
 */
declare function findImage(img: Image, template: Image, options?: FindImageOptions): Point | null

/**
 * 区域找图的简便方法。
 */
declare function findImageInRegion(
  img: Image,
  template: Image,
  x: number,
  y: number,
  width?: number,
  height?: number,
  threshold?: number
): Point | null

/**
 * 在图片中寻找圆。
 */
declare function findCircles(
  gray: Image,
  options?: FindCirclesOptions
): Array<{ x: number; y: number; radius: number }> | null
