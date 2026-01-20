// 对话框 Dialogs
declare let dialogs
declare let alert
declare let confirm: (s: string) => boolean

// 悬浮窗 Floaty
declare let floaty: {
  checkPermission: () => boolean
  requestPermission: () => any
  window: (layout) => floatyWindow
  rawWindow: (layout) => floatyWindow
  closeAll: () => any
}

interface floatyWindow {
  setAdjustEnabled: (enabled) => any
  setPosition: (x, y) => any
  getX: () => any
  getY: () => any
  setSize: (width, height) => any
  getWidht: () => any
  getHeight: () => any
  close: () => any
  exitOnClose: () => any
  setTouchable: (touchable) => any
}
