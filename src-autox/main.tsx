/**
 * AutoX 入口文件 - Game 框架测试
 */

import { AutojsWebRuntime } from '../src-runtime/runtime-autojs'
import { requestScreenCaptureEx } from './core/capture'
import { Navigator } from './task'

const g_web_url = 'autojs-todo-web-url'
const g_web_type: any = 'autojs-todo-web-type'

const web_runtime = new AutojsWebRuntime()
web_runtime.init_web_view_ui(g_web_url, g_web_type)

// 打开日志窗口
web_runtime.on('show_log', () => {
  threads.start(() => {
    requestScreenCaptureEx()
    launchApp('阴阳师')
    Navigator.ensureStableUI()
  })
})
