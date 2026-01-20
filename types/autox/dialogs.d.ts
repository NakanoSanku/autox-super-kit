/**
 * dialogs 模块提供了简单的对话框支持，可以通过对话框和用户进行交互。
 */

/**
 * dialogs.build() 的配置选项
 */
interface DialogBuildOptions {
  /** 对话框标题 */
  title?: string
  /** 对话框标题的颜色 */
  titleColor?: string | number
  /** 对话框按钮的波纹效果颜色 */
  buttonRippleColor?: string | number
  /** 对话框的图标，是一个 URL 或者图片对象 */
  icon?: string | any
  /** 对话框文字内容 */
  content?: string
  /** 对话框文字内容的颜色 */
  contentColor?: string | number
  /** 对话框文字内容的行高倍数，1.0 为一倍行高 */
  contentLineSpacing?: number
  /** 对话框列表的选项 */
  items?: string[]
  /** 对话框列表的选项的文字颜色 */
  itemsColor?: string | number
  /** 对话框列表的选项选择模式: 'select' 普通选择模式, 'single' 单选模式, 'multi' 多选模式 */
  itemsSelectMode?: 'select' | 'single' | 'multi'
  /** 对话框列表中预先选中的项目索引，如果是单选模式为一个索引；多选模式则为数组 */
  itemsSelectedIndex?: number | number[]
  /** 对话框确定按钮的文字内容 (最右边按钮) */
  positive?: string
  /** 对话框确定按钮的文字颜色 (最右边按钮) */
  positiveColor?: string | number
  /** 对话框中立按钮的文字内容 (最左边按钮) */
  neutral?: string
  /** 对话框中立按钮的文字颜色 (最左边按钮) */
  neutralColor?: string | number
  /** 对话框取消按钮的文字内容 (确定按钮左边的按钮) */
  negative?: string
  /** 对话框取消按钮的文字颜色 (确定按钮左边的按钮) */
  negativeColor?: string | number
  /** 勾选框文字内容 */
  checkBoxPrompt?: string
  /** 勾选框是否勾选 */
  checkBoxChecked?: boolean
  /** 配置对话框进度条的对象 */
  progress?: {
    /** 进度条的最大值，如果为 -1 则为无限循环的进度条 */
    max?: number
    /** 如果为 true, 则对话框无限循环的进度条为水平进度条 */
    horizontal?: boolean
    /** 是否显示进度条的最大值和最小值 */
    showMinMax?: boolean
  }
  /** 对话框是否可取消，如果为 false，则对话框只能用代码手动取消 */
  cancelable?: boolean
  /** 对话框是否在点击对话框以外区域时自动取消，默认为 true */
  canceledOnTouchOutside?: boolean
  /** 对话框的输入框的输入提示 */
  inputHint?: string
  /** 对话框输入框的默认输入内容 */
  inputPrefill?: string
}

/**
 * Dialog 对话框对象
 */
interface Dialog {
  /**
   * 监听对话框事件
   * @param event 事件名称
   * @param listener 回调函数
   */
  on(event: 'show', listener: (dialog: Dialog) => void): Dialog
  on(event: 'cancel', listener: (dialog: Dialog) => void): Dialog
  on(event: 'dismiss', listener: (dialog: Dialog) => void): Dialog
  on(event: 'positive', listener: (dialog: Dialog) => void): Dialog
  on(event: 'negative', listener: (dialog: Dialog) => void): Dialog
  on(event: 'neutral', listener: (dialog: Dialog) => void): Dialog
  on(event: 'any', listener: (action: 'positive' | 'negative' | 'neutral', dialog: Dialog) => void): Dialog
  on(event: 'item_select', listener: (index: number, item: any, dialog: Dialog) => void): Dialog
  on(event: 'single_choice', listener: (index: number, item: any, dialog: Dialog) => void): Dialog
  on(event: 'multi_choice', listener: (indices: number[], items: any[], dialog: Dialog) => void): Dialog
  on(event: 'input', listener: (text: string, dialog: Dialog) => void): Dialog
  on(event: 'input_change', listener: (text: string, dialog: Dialog) => void): Dialog
  on(event: 'check', listener: (checked: boolean) => void): Dialog

  /** 显示对话框 */
  show(): Dialog
  /** 关闭对话框 */
  dismiss(): void
  /** 获取当前进度条的进度值 */
  getProgress(): number
  /** 获取当前进度条的最大进度值 */
  getMaxProgress(): number
  /**
   * 获取对话框的按钮
   * @param action 动作类型
   */
  getActionButton(action: 'positive' | 'negative' | 'neutral'): any
}

declare let dialogs: {
  /**
   * 显示一个只包含"确定"按钮的提示对话框。直至用户点击确定脚本才继续运行。
   * @param title 对话框的标题
   * @param content 对话框的内容
   * @param callback 回调函数，可选。当用户点击确定时被调用，一般用于 ui 模式。
   */
  alert(title: string, content?: string, callback?: () => void): void | Promise<void>

  /**
   * 显示一个包含"确定"和"取消"按钮的提示对话框。
   * @param title 对话框的标题
   * @param content 对话框的内容
   * @param callback 回调函数，可选。当用户点击确定时被调用，一般用于 ui 模式。
   * @returns 如果用户点击"确定"则返回 true，否则返回 false
   */
  confirm(title: string, content?: string, callback?: (confirmed: boolean) => void): boolean | Promise<boolean>

  /**
   * 显示一个包含输入框的对话框，等待用户输入内容，并在用户点击确定时将输入的字符串返回。
   * @param title 对话框的标题
   * @param prefill 输入框的初始内容
   * @param callback 回调函数，可选
   * @returns 输入的字符串，如果用户取消了输入，返回 null
   */
  rawInput(title: string, prefill?: string, callback?: (input: string | null) => void): string | null | Promise<string | null>

  /**
   * 等效于 eval(dialogs.rawInput(title, prefill, callback))
   * @param title 对话框的标题
   * @param prefill 输入框的初始内容
   * @param callback 回调函数，可选
   * @returns 输入内容经 eval 计算后的结果
   */
  input(title: string, prefill?: string, callback?: (input: any) => void): any | Promise<any>

  /**
   * 相当于 dialogs.rawInput()
   * @param title 对话框的标题
   * @param prefill 输入框的初始内容
   * @param callback 回调函数，可选
   */
  prompt(title: string, prefill?: string, callback?: (input: string | null) => void): string | null | Promise<string | null>

  /**
   * 显示一个带有选项列表的对话框，等待用户选择，返回用户选择的选项索引。
   * @param title 对话框的标题
   * @param items 对话框的选项列表
   * @param callback 回调函数，可选
   * @returns 用户选择的选项索引 (0 ~ item.length - 1)。如果用户取消了选择，返回 -1
   */
  select(title: string, items: string[], callback?: (index: number) => void): number | Promise<number>

  /**
   * 显示一个单选列表对话框，等待用户选择
   * @param title 对话框的标题
   * @param items 对话框的选项列表
   * @param index 对话框的初始选项的位置，默认为 0
   * @param callback 回调函数，可选
   * @returns 用户选择的选项索引 (0 ~ item.length - 1)。如果用户取消了选择，返回 -1
   */
  singleChoice(title: string, items: string[], index?: number, callback?: (index: number) => void): number | Promise<number>

  /**
   * 显示一个多选列表对话框，等待用户选择
   * @param title 对话框的标题
   * @param items 对话框的选项列表
   * @param indices 选项列表中初始选中的项目索引的数组，默认为空数组
   * @param callback 回调函数，可选
   * @returns 用户选择的选项索引的数组。如果用户取消了选择，返回空数组
   */
  multiChoice(title: string, items: string[], indices?: number[], callback?: (indices: number[]) => void): number[] | Promise<number[]>

  /**
   * 创建一个可自定义的对话框
   * @param properties 对话框属性
   * @returns Dialog 对象
   */
  build(properties: DialogBuildOptions): Dialog
}

// 全局函数

/**
 * 显示一个只包含"确定"按钮的提示对话框
 * @param title 对话框的标题
 * @param content 对话框的内容
 * @param callback 回调函数，可选
 */
declare function alert(title: string, content?: string, callback?: () => void): void | Promise<void>

/**
 * 显示一个包含"确定"和"取消"按钮的提示对话框
 * @param title 对话框的标题
 * @param content 对话框的内容
 * @param callback 回调函数，可选
 * @returns 如果用户点击"确定"则返回 true，否则返回 false
 */
declare function confirm(title: string, content?: string, callback?: (confirmed: boolean) => void): boolean | Promise<boolean>

/**
 * 显示一个包含输入框的对话框
 * @param title 对话框的标题
 * @param prefill 输入框的初始内容
 * @param callback 回调函数，可选
 * @returns 输入的字符串，如果用户取消了输入，返回 null
 */
declare function rawInput(title: string, prefill?: string, callback?: (input: string | null) => void): string | null | Promise<string | null>
