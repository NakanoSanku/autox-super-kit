import { humanClick } from "./action";
import { captureScreenEx } from "./capture";
import { defaultMatcherConfig, defaultOcrConfig } from "./config";
import { loadTemplate } from "./image";

/**
 * 匹配结果接口
 * @description 定义匹配操作返回结果的标准接口
 */
interface IMatchResult {
    /**
     * 判断匹配结果是否为空
     * @returns 如果没有匹配到目标返回 true，否则返回 false
     */
    isNull(): boolean;

    /**
     * 判断匹配结果是否为单点
     * @returns 如果匹配结果是单个点（左上角与右下角重合）返回 true，否则返回 false
     */
    isPoint(): boolean;

    /**
     * 点击匹配到的区域
     * @returns 点击成功返回 true，失败返回 false
     */
    click(): boolean;

    /**
     * 对匹配结果执行自定义操作
     * @param func - 接收匹配结果并返回布尔值的回调函数
     * @returns 回调函数的返回值
     */
    do(func: (matchResult: MatchResult) => boolean): boolean;
}

/**
 * 匹配结果类
 * @description 表示成功匹配到目标的结果，包含匹配区域的左上角和右下角坐标
 * @implements {IMatchResult}
 */
class MatchResult implements IMatchResult {
    /** 匹配区域的左上角坐标 */
    readonly leftTop: Point;
    /** 匹配区域的右下角坐标 */
    readonly rightBottom: Point;

    /**
     * 创建匹配结果实例
     * @param leftTop - 匹配区域的左上角坐标
     * @param rightBottom - 匹配区域的右下角坐标
     */
    constructor(leftTop: Point, rightBottom: Point) {
        this.leftTop = leftTop;
        this.rightBottom = rightBottom;
    }

    /**
     * 判断匹配结果是否为单点
     * @returns 如果左上角与右下角坐标相同返回 true，否则返回 false
     */
    isPoint(): boolean {
        return this.leftTop.x === this.rightBottom.x && this.leftTop.y === this.rightBottom.y;
    }

    /**
     * 点击匹配到的区域
     * @description 如果是单点则直接点击该点，否则在匹配区域内随机点击
     * @returns 始终返回 true
     */
    click(): boolean {
        if (this.isPoint()) {
            humanClick(this.leftTop.x, this.leftTop.y, 1, 1);
            return true;
        }
        humanClick(this.leftTop.x, this.leftTop.y, this.rightBottom.x - this.leftTop.x, this.rightBottom.y - this.leftTop.y);
        return true;
    }

    /**
     * 对匹配结果执行自定义操作
     * @param func - 接收当前匹配结果并返回布尔值的回调函数
     * @returns 回调函数的返回值
     */
    do(func: (matchResult: MatchResult) => boolean): boolean {
        return func(this);
    }

    /**
     * 判断匹配结果是否为空
     * @returns 始终返回 false，因为这是有效的匹配结果
     */
    isNull(): boolean {
        return false;
    }
}

/**
 * 空匹配结果类
 * @description 表示未匹配到目标的空结果，所有操作都返回 false
 * @implements {IMatchResult}
 */
class NullMatchResult implements IMatchResult {
    /**
     * 判断匹配结果是否为单点
     * @returns 始终返回 false
     */
    isPoint(): boolean {
        return false;
    }

    /**
     * 点击匹配到的区域
     * @returns 始终返回 false，因为没有匹配到目标
     */
    click(): boolean {
        return false;
    }

    /**
     * 对匹配结果执行自定义操作
     * @param _func - 回调函数（不会被执行）
     * @returns 始终返回 false
     */
    do(_func: (matchResult: MatchResult) => boolean): boolean {
        return false;
    }

    /**
     * 判断匹配结果是否为空
     * @returns 始终返回 true，因为这是空结果
     */
    isNull(): boolean {
        return true;
    }
}

/** 空匹配结果单例，用于表示未匹配到目标的情况 */
const NULL_RESULT = new NullMatchResult();

/**
 * 模板配置选项接口
 * @description 定义模板的基础配置参数
 */
interface TemplateOptions {
    /**
     * 匹配阈值
     * @default 0.9
     * @description 值越高匹配越严格，范围 0-1
     */
    threshold?: number;

    /**
     * 匹配区域
     * @description 限制匹配的屏幕区域，格式为 [x, y, width, height]
     * @default null - 全屏匹配
     */
    region?: [number, number, number, number];
}

/**
 * 模板抽象基类
 * @description 定义模板的基本结构和通用方法
 * @abstract
 */
abstract class Template {
    /** 匹配阈值，值越高匹配越严格 */
    protected readonly threshold: number;
    /** 默认匹配区域，格式为 [x, y, width, height]，null 表示全屏 */
    protected readonly region: [number, number, number, number] | null;

    /**
     * 创建模板实例
     * @param options - 模板配置选项
     */
    constructor(options?: TemplateOptions) {
        this.threshold = options?.threshold ?? defaultMatcherConfig.threshold;
        this.region = options?.region ?? null;
    }

    /**
     * 执行匹配操作
     * @abstract
     * @param region - 可选的匹配区域，格式为 [x, y, width, height]，优先级高于构造时设置的区域
     * @returns 匹配结果对象
     */
    abstract match(region?: [number, number, number, number]): IMatchResult

    /**
     * 等待匹配成功
     * @description 在指定超时时间内循环尝试匹配，直到成功或超时
     * @param timeout - 超时时间（毫秒）
     * @default 5000
     * @param interval - 每次尝试之间的间隔时间（毫秒）
     * @default 500
     * @param region - 可选的匹配区域，格式为 [x, y, width, height]，优先级高于构造时设置的区域
     * @returns 匹配成功返回匹配结果，超时返回空结果
     */
    wait(timeout = defaultMatcherConfig.waitTimeout, interval = defaultMatcherConfig.waitInterval, region?: [number, number, number, number]): IMatchResult {
        const startTime = Date.now();
        while (true) {
            if ((Date.now() - startTime) >= timeout) {
                return NULL_RESULT;
            }
            const result = this.match(region);
            if (result.isNull()) {
                sleep(interval);
            } else {
                return result;
            }
        }
    }
}

/**
 * 图片模板配置选项接口
 * @description 继承基础配置，添加图片模板路径
 * @extends TemplateOptions
 */
interface ImageTemplateOptions extends TemplateOptions {
    /**
     * 模板图片路径
     * @description 用于匹配的目标图片文件路径
     */
    templatePath: string;
}

/**
 * 图片模板类
 * @description 基于模板图片进行屏幕匹配的模板实现
 * @extends Template
 */
class ImageTemplate extends Template {
    /** 模板图片文件路径 */
    templatePath: string;

    /**
     * 创建图片模板实例
     * @param options - 图片模板配置选项
     */
    constructor(options: ImageTemplateOptions) {
        super(options);
        this.templatePath = options.templatePath;
    }

    /**
     * 执行图片匹配操作
     * @description 截取当前屏幕并与模板图片进行匹配
     * @param region - 可选的匹配区域，格式为 [x, y, width, height]，优先级高于构造时设置的区域
     * @returns 匹配成功返回包含匹配位置的结果，失败返回空结果
     */
    match(region?: [number, number, number, number]): IMatchResult {
        const template = loadTemplate(this.templatePath);
        const result = images.findImage(captureScreenEx(), template, {
            threshold: this.threshold,
            region: region ?? this.region ?? undefined
        });
        if (result) {
            return new MatchResult(
                { x: result.x, y: result.y },
                { x: result.x + template.width, y: result.y + template.height }
            );
        }
        return NULL_RESULT;
    }
}

/**
 * 多点找色模板配置选项接口
 * @description 继承基础配置，添加多点找色相关参数
 * @extends TemplateOptions
 */
interface MultiColorTemplateOptions extends TemplateOptions {
    /**
     * 第一个点的颜色
     * @description 可以是十六进制颜色字符串（如 "#ffffff"）或颜色数值
     */
    firstColor: string | number;

    /**
     * 其余点相对于第一个点的位置和颜色数组
     * @description 每个元素格式为 [相对x坐标, 相对y坐标, 颜色]
     * @example [[10, 20, "#ffffff"], [30, 40, "#000000"]]
     */
    colors: Array<[number, number, string | number]>;
}

/**
 * 多点找色模板类
 * @description 基于多点颜色特征进行屏幕匹配的模板实现
 * @extends Template
 * @example
 * ```typescript
 * const template = new MultiColorTemplate({
 *     firstColor: "#123456",
 *     colors: [[10, 20, "#ffffff"], [30, 40, "#000000"]],
 *     threshold: 4,
 *     region: [0, 0, 1080, 1920]
 * });
 * const result = template.match();
 * ```
 */
class MultiColorTemplate extends Template {
    /** 第一个点的颜色 */
    firstColor: string | number;
    /** 其余点相对于第一个点的位置和颜色数组 */
    colors: Array<[number, number, string | number]>;

    /**
     * 创建多点找色模板实例
     * @param options - 多点找色模板配置选项
     */
    constructor(options: MultiColorTemplateOptions) {
        super(options);
        this.firstColor = options.firstColor;
        this.colors = options.colors;
    }

    /**
     * 执行多点找色匹配操作
     * @description 截取当前屏幕并进行多点颜色匹配
     * @param region - 可选的匹配区域，格式为 [x, y, width, height]，优先级高于构造时设置的区域
     * @returns 匹配成功返回包含匹配位置的结果（单点），失败返回空结果
     */
    match(region?: [number, number, number, number]): IMatchResult {
        const result = images.findMultiColors(captureScreenEx(), this.firstColor, this.colors, {
            threshold: Math.round((1 - this.threshold) * 255),
            region: region ?? this.region ?? undefined
        });
        if (result) {
            return new MatchResult(
                { x: result.x, y: result.y },
                { x: result.x, y: result.y }
            );
        }
        return NULL_RESULT;
    }
}

/**
 * OCR 模板配置选项接口
 * @description 继承基础配置，添加 OCR 相关参数
 * @extends TemplateOptions
 */
interface OcrTemplateOptions extends TemplateOptions {
    /**
     * 要匹配的文本
     * @description 支持字符串或正则表达式
     */
    text: string | RegExp;

    /**
     * 自定义模型路径
     * @description 使用自定义模型时的绝对路径，设置后 cpuThreadNum 和 useSlim 将被忽略
     * @default undefined
     */
    modelPath?: string;

    /**
     * 识别使用的 CPU 核心数量
     * @description 仅在未设置 modelPath 时生效
     * @default 4
     */
    cpuThreadNum?: number;

    /**
     * 是否使用快速模型
     * @description 仅在未设置 modelPath 时生效。true 使用 ocr_v2_for_cpu(slim) 快速模型，false 使用 ocr_v2_for_cpu 精准模型
     * @default true
     */
    useSlim?: boolean;
}

/**
 * OCR 模板类
 * @description 基于 Paddle OCR 文字识别进行屏幕匹配的模板实现
 * @extends Template
 * @example
 * ```typescript
 * const template = new OcrTemplate({
 *     text: "登录",
 *     region: [0, 0, 1080, 500]
 * });
 * const result = template.match();
 * 
 * // 使用正则表达式匹配
 * const regexTemplate = new OcrTemplate({
 *     text: /价格[:：]\d+/
 * });
 * 
 * // 使用自定义模型
 * const customTemplate = new OcrTemplate({
 *     text: "确认",
 *     modelPath: "/sdcard/ocr_model/"
 * });
 * ```
 */
class OcrTemplate extends Template {
    /** 要匹配的文本 */
    text: string | RegExp;
    /** 自定义模型路径 */
    modelPath: string | null;
    /** 识别使用的 CPU 核心数量 */
    cpuThreadNum: number;
    /** 是否使用快速模型 */
    useSlim: boolean;

    /**
     * 创建 OCR 模板实例
     * @param options - OCR 模板配置选项
     */
    constructor(options: OcrTemplateOptions) {
        super(options);
        this.text = options.text;
        this.modelPath = options.modelPath ?? defaultOcrConfig.modelPath;
        this.cpuThreadNum = options.cpuThreadNum ?? defaultOcrConfig.cpuThreadNum;
        this.useSlim = options.useSlim ?? defaultOcrConfig.useSlim;
    }

    /**
     * 执行 OCR 匹配操作
     * @description 截取当前屏幕进行 OCR 识别，查找匹配的文本。
     *              当匹配到子字符串时，会根据文本位置比例计算更精确的坐标
     * @param region - 可选的匹配区域，格式为 [x, y, width, height]，优先级高于构造时设置的区域
     * @returns 匹配成功返回包含文本位置的结果，失败返回空结果
     */
    match(region?: [number, number, number, number]): IMatchResult {
        const matchRegion = region ?? this.region;
        let img = captureScreenEx();
        if (matchRegion) {
            img = images.clip(img, matchRegion[0], matchRegion[1], matchRegion[2], matchRegion[3]);
        }
        const ocrResults = this.modelPath
            ? paddle.ocr(img, this.modelPath)
            : paddle.ocr(img, this.cpuThreadNum, this.useSlim);
        for (const item of ocrResults) {
            let matchIndex = -1;
            let matchLength = 0;

            if (this.text instanceof RegExp) {
                const match = this.text.exec(item.text);
                if (match) {
                    matchIndex = match.index;
                    matchLength = match[0].length;
                }
            } else {
                matchIndex = item.text.indexOf(this.text);
                matchLength = this.text.length;
            }

            if (matchIndex >= 0 && item.confidence >= this.threshold) {
                const offsetX = matchRegion ? matchRegion[0] : 0;
                const offsetY = matchRegion ? matchRegion[1] : 0;

                const totalLength = item.text.length;
                const boundsWidth = item.bounds.right - item.bounds.left;

                const charWidth = boundsWidth / totalLength;
                const left = item.bounds.left + matchIndex * charWidth;
                const right = left + matchLength * charWidth;

                return new MatchResult(
                    { x: Math.round(left + offsetX), y: item.bounds.top + offsetY },
                    { x: Math.round(right + offsetX), y: item.bounds.bottom + offsetY }
                );
            }
        }
        return NULL_RESULT;
    }
}

export {
    Template,
    ImageTemplate,
    MultiColorTemplate,
    OcrTemplate,
    MatchResult,
    NullMatchResult
}

export type {
    IMatchResult,
    TemplateOptions,
    ImageTemplateOptions,
    MultiColorTemplateOptions,
    OcrTemplateOptions
};
