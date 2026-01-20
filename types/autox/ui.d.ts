declare let ui: {
  /** 界面 */
  layout: (jsx: any) => void
  /** 在 ui 线程上执行代码 */
  run: (fn: () => void) => void
  [x: string]: any
  __widgets__: any
  __defineGetter__: any
  layoutFile: any
  inflate: any
  __inflate__: any
  registerWidget: any
  setContentView: any
  findById: any
  findView: any
  isUiThread: any
  post: any
  statusBarColor: any
  finish: any
  findByStringId: any
  Widget: any
}

declare function require<T = any>(name: string): T

// 允许指定固定字符串 与 其他字符串, 智能提示可以给出类型
type _string = string & { _?: never }

interface baseJsxProps {
  id: string
  w: string
  h: 'auto' | '*' | _string
  [x: string]: any
}

// 定义 jsx 组件 (小写开头)
declare namespace JSX {
  interface IntrinsicElements {
    /** 文本 */
    text: Partial<{ text: string } & baseJsxProps>
    /** 按钮 */
    button: Partial<{
      text: string
      style:
        | 'Widget.AppCompat.Button.Colored'
        | 'Widget.AppCompat.Button.Borderless'
        | 'Widget.AppCompat.Button.Borderless.Colored'
    } & baseJsxProps>
    /** 输入框 */
    input: Partial<{ text: string } & baseJsxProps>
    /** 图片 */
    img: Partial<{
      /**
       * @example
       * // 指定内置的图标
       * src="@drawable/ic_android_black_48dp"
       */
      src: string
    } & baseJsxProps>
    /** 纵向布局 */
    vertical: Partial<{} & baseJsxProps>
    /** 横向布局 */
    horizontal: Partial<{} & baseJsxProps>
    /**
     * 线性布局 (默认:横向,通过 orientation 修改)
     *
     * 垂直布局和水平布局都属于线性布局
     */
    linear: Partial<{
      /** 方向 */
      orientation: 'vertical' | 'horizontal'
    } & baseJsxProps>
    /** 帧布局 */
    frame: Partial<{} & baseJsxProps>
    /** 相对布局 */
    relative: Partial<{} & baseJsxProps>
    /** 勾选框 */
    checkbox: Partial<{ text: string } & baseJsxProps>
    /** 选择框 */
    radio: Partial<{ text: string } & baseJsxProps>
    /** 选择框布局 */
    radiogroup: Partial<{} & baseJsxProps>
    /** 进度条 */
    progressbar: Partial<{} & baseJsxProps>
    /** 拖动条 */
    seekbar: Partial<{} & baseJsxProps>
    /** 下拉菜单 */
    spinner: Partial<{
      /**
       * 选项 ("选项1|选项2|选项3")
       *
       * @example
       * // 获取
       * getSelectedItemPosition()
       * // 设置
       * setSelection(2)
       */
      entries: string
      spinnerMode: string
    } & baseJsxProps>
    /** 时间选择 */
    timepicker: Partial<{} & baseJsxProps>
    /** 日期选择 */
    datepicker: Partial<{} & baseJsxProps>
    /** 浮动按钮 */
    fab: Partial<{} & baseJsxProps>
    /** 标题栏 */
    toolbar: Partial<{} & baseJsxProps>
    /** 卡片 */
    card: Partial<{ cardCornerRadius; cardBackgroundColor; cardElevation } & baseJsxProps>
    /** 抽屉 */
    drawer: Partial<{} & baseJsxProps>
    /** 列表 */
    list: Partial<{} & baseJsxProps>
    /** Tab */
    tab: Partial<{} & baseJsxProps>
    /** web */
    webview: Partial<{} & baseJsxProps>
    // any jsx
    [x: string]: any
  }
}

// 大写开头的 jsx 组件这样定义
declare let View: (props: any) => JSX.IntrinsicElements
declare let TextView: (props: any) => JSX.IntrinsicElements
declare let ScrollView: (props: any) => JSX.IntrinsicElements
declare let TableLayout: (props: any) => JSX.IntrinsicElements
declare let TableRow: (props: any) => JSX.IntrinsicElements
/** 开关 */
declare let Switch: (props: Partial<{} & baseJsxProps>) => JSX.IntrinsicElements
