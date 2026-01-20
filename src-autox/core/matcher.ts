import { captureScreenEx } from "./capture";
import { loadTemplate } from "./image";

class MatchResult {
    readonly leftTop: Point;
    readonly rightBottom: Point;
    constructor(leftTop: Point, rightBottom: Point) {
        this.leftTop = leftTop;
        this.rightBottom = rightBottom;
    }
    isPoint(): boolean {
        return this.leftTop.x === this.rightBottom.x && this.leftTop.y === this.rightBottom.y;
    }
    get center(): Point {
        return {
            x: Math.floor((this.leftTop.x + this.rightBottom.x) / 2),
            y: Math.floor((this.leftTop.y + this.rightBottom.y) / 2)
        };
    }
    get width(): number {
        return this.rightBottom.x - this.leftTop.x;
    }
    get height(): number {
        return this.rightBottom.y - this.leftTop.y;
    }
}
interface MatcherOptions {
    threshold?: number; // 匹配阈值，默认0.9
    region?: [number, number, number, number]; // 匹配区域 [x, y, width, height]
}
abstract class Matcher {
    constructor(options?: MatcherOptions) { }
    protected abstract match(): MatchResult | null
    abstract exists(): boolean
    abstract wait(timeout?: number): boolean
    abstract click(): boolean
}
interface ImageMatcherOptions extends MatcherOptions {
    templatePath: string;
    // 未来可扩展图片匹配特有的选项
}

class ImageMatcher extends Matcher {
    private readonly templatePath: string;
    private readonly options: MatcherOptions;
    constructor(options: ImageMatcherOptions) {
        super(options);
        this.templatePath = options.templatePath;
        this.options = options;
    }
    protected match(): MatchResult | null {
        const templateImg = loadTemplate(this.templatePath);
        const result = images.findImage(captureScreenEx(), templateImg, this.options);
        if (result) {
            return new MatchResult(
                { x: result.x, y: result.y },
                { x: result.x + templateImg.width, y: result.y + templateImg.height }
            );
        }
        return null;
    }
    exists(): boolean {
        return this.match() !== null;
    }
    wait(timeout?: number): boolean {
        // Implementation for waiting for an image to appear
        return this.match() !== null;
    }
    click(): boolean {
        throw new Error("Method not implemented.");
    }
}