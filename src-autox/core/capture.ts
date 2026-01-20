const captureLock = threads.lock();

/**
 * 线程安全的截图函数
 * 确保在多线程环境下调用截图函数时不会发生冲突
 * @returns 截图对象
 */
export function captureScreenEx(): Image {
    captureLock.lock();
    try {
        return captureScreen();
    } finally {
        captureLock.unlock();
    }
}

/** 根据设备的当前方向请求屏幕捕获
 * 如果设备处于横屏模式，则请求横屏截图；如果处于竖屏模式，则请求竖屏截图
 * @returns 请求是否成功
 */
export function requestScreenCaptureEx(): boolean {
    return requestScreenCapture(device.height > device.width);
}