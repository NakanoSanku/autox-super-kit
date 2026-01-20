/** 导入 android 类 */
declare function importClass(name: any)
declare function importPackage(name: any)
declare let Packages
declare let web
declare let android
declare let log
declare let java
declare let Date
declare let open
declare let rawInput

declare function sleep(n): any
declare function currentPackage(): any
declare function currentActivity(): any
declare function setClip(text): any
declare function getClip(): any
declare function toast(message): any
declare function toastLog(message): any
declare function waitForActivity(activity, period?): any
declare function waitForPackage(pkg, period?): any
declare function exit(): any
declare function random(min, max): any
declare function random(): any
declare function requiresApi(api): any
declare function requiresAutojsVersion(version): any

declare let runtime: {
  requestPermissions: (permissions) => any
  loadJar: (path) => any
  loadDex: (path) => any
}

/**
 * 全局变量。一个 android.content.Context 对象。
 * 注意该对象为 ApplicationContext，
 * 因此不能用于界面、对话框等的创建。
 */
declare let context
