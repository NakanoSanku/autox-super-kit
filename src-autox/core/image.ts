import { captureScreenEx } from './capture';
import { defaultImageCacheConfig } from './config';

const cacheLock = threads.lock();
let cache: Record<string, CacheEntry> = {};
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

interface CacheEntry {
    image: Image;
    lastUsed: number;
    timeout: number;
}

interface CacheStats {
    count: number;
    keys: string[];
}

/**
 * 加载并缓存模板图片
 * @param path - 图片路径
 * @param timeout - 缓存超时时间(ms)，默认60秒
 */
export function loadTemplate(path: string, timeout: number = defaultImageCacheConfig.timeout): Image {
    cacheLock.lock();
    try {
        const entry = cache[path];
        if (entry && entry.image) {
            entry.lastUsed = Date.now();
            return entry.image;
        }
        const img = images.read(path);
        if (img) {
            cache[path] = {
                image: img,
                lastUsed: Date.now(),
                timeout: timeout,
            };
            return img;
        }
        throw new Error(`can't load template ${path}`);
    } finally {
        cacheLock.unlock();
    }
}

/**
 * 清理过期缓存
 */
export function cleanupExpired(): void {
    cacheLock.lock();
    try {
        const now = Date.now();
        const keys = Object.keys(cache);
        for (const key of keys) {
            const entry = cache[key];
            if (now - entry.lastUsed > entry.timeout) {
                if (entry.image) {
                    entry.image.recycle();
                }
                delete cache[key];
            }
        }
    } finally {
        cacheLock.unlock();
    }
}

/**
 * 启动自动清理定时器
 * @param interval - 清理间隔(ms)，默认30秒
 */
export function startAutoCleanup(interval: number = defaultImageCacheConfig.cleanupInterval): void {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(cleanupExpired, interval);
}

/**
 * 停止自动清理
 */
export function stopAutoCleanup(): void {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}

/**
 * 强化版findImage
 * @param template - 模板图片路径
 * @param options - 查找选项
 * @param src - 源图片，不传则自动截图
 */
export function findImageEx(
    template: string,
    options?: FindImageOptions,
    src?: Image,
): Point | null {
    const templateImg = loadTemplate(template);
    let srcImg = src;
    let needRecycleSrc = false;
    if (!srcImg) {
        srcImg = captureScreenEx();
        needRecycleSrc = true;
    }
    if (!srcImg) {
        return null;
    }

    try {
        return images.findImage(srcImg, templateImg, options);
    } finally {
        if (needRecycleSrc && srcImg) {
            srcImg.recycle();
        }
    }
}
/**
 * 移除指定模板缓存
 */
export function removeCache(path: string): void {
    cacheLock.lock();
    try {
        const entry = cache[path];
        if (entry) {
            if (entry.image) {
                entry.image.recycle();
            }
            delete cache[path];
        }
    } finally {
        cacheLock.unlock();
    }
}

/**
 * 清空所有缓存
 */
export function clearAllCache(): void {
    cacheLock.lock();
    try {
        const keys = Object.keys(cache);
        for (const key of keys) {
            const entry = cache[key];
            if (entry.image) {
                entry.image.recycle();
            }
        }
        cache = {};
    } finally {
        cacheLock.unlock();
    }
}

/**
 * 获取缓存统计
 */
export function getCacheStats(): CacheStats {
    cacheLock.lock();
    try {
        return {
            count: Object.keys(cache).length,
            keys: Object.keys(cache),
        };
    } finally {
        cacheLock.unlock();
    }
}