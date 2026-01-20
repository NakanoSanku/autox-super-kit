/**
 * Shell 命令执行结果
 */
interface ShellResult {
  /** 返回码，执行成功时为 0 */
  code: number
  /** 运行结果 (stdout) */
  result: string
  /** 运行的错误信息 (stderr) */
  error: string
}

/**
 * Shell 回调函数
 */
interface ShellCallback {
  /** 每当 shell 有新的输出时调用 */
  onOutput?: (output: string) => void
  /** 每当 shell 有新的一行输出时调用 */
  onNewLine?: (line: string) => void
}

/**
 * Shell 对象，用于执行多条命令
 */
declare class Shell {
  /**
   * 创建一个 Shell 对象
   * @param root 是否以 root 权限运行，默认 false
   */
  constructor(root?: boolean)

  /**
   * 执行命令（异步，非阻塞）
   * @param cmd 要执行的命令
   */
  exec(cmd: string): void

  /** 直接退出 shell，正在执行的命令会被强制退出 */
  exit(): void

  /** 执行 exit 命令并等待执行完成后退出 shell */
  exitAndWaitFor(): void

  /**
   * 设置 Shell 的回调函数
   * @param callback 回调函数
   */
  setCallback(callback: ShellCallback): void
}

/**
 * 一次性执行 shell 命令
 * @param cmd 要执行的命令
 * @param root 是否以 root 权限运行，默认 false
 * @returns 命令执行结果
 */
declare function shell(cmd: string, root?: boolean): ShellResult
