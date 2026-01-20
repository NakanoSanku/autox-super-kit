/**
 * files 模块提供了一些常见的文件处理，包括文件读写、移动、复制、删掉等。
 *
 * 一次性的文件读写可以直接使用 files.read(), files.write(), files.append() 等方便的函数，
 * 但如果需要频繁读写或随机读写，则使用 open() 函数打开一个文件对象来操作文件，并在操作完毕后调用 close() 函数关闭文件。
 *
 * @stability 稳定
 */
declare let files: {
  /**
   * 返回路径 path 是否是文件。
   * @param path 路径
   * @returns 是否是文件
   * @example
   * log(files.isFile("/sdcard/文件.txt")); // 返回 true
   */
  isFile: (path: string) => boolean

  /**
   * 返回路径 path 是否是文件夹。
   * @param path 路径
   * @returns 是否是文件夹
   * @example
   * log(files.isDir("/sdcard/文件夹/")); // 返回 true
   */
  isDir: (path: string) => boolean

  /**
   * 返回文件夹 path 是否为空文件夹。如果该路径并非文件夹，则直接返回 false。
   * @param path 路径
   * @returns 是否为空文件夹
   */
  isEmptyDir: (path: string) => boolean

  /**
   * 连接两个路径并返回。
   * @param parent 父目录路径
   * @param child 子路径
   * @returns 连接后的路径
   * @example
   * files.join("/sdcard/", "1.txt"); // 返回 "/sdcard/1.txt"
   */
  join: (parent: string, child: string) => string

  /**
   * 创建一个文件或文件夹并返回是否创建成功。如果文件已经存在，则直接返回 false。
   * @param path 路径
   * @returns 是否创建成功
   * @example
   * files.create("/sdcard/新文件夹/");
   */
  create: (path: string) => boolean

  /**
   * 创建一个文件或文件夹并返回是否创建成功。如果文件所在文件夹不存在，则先创建他所在的一系列文件夹。
   * 如果文件已经存在，则直接返回 false。
   * @param path 路径
   * @returns 是否创建成功
   * @example
   * files.createWithDirs("/sdcard/新文件夹/新文件夹/新文件夹/1.txt");
   */
  createWithDirs: (path: string) => boolean

  /**
   * 返回在路径 path 处的文件是否存在。
   * @param path 路径
   * @returns 文件是否存在
   */
  exists: (path: string) => boolean

  /**
   * 确保路径 path 所在的文件夹存在。如果该路径所在文件夹不存在，则创建该文件夹。
   * 例如对于路径 "/sdcard/Download/ABC/1.txt"，如果 /Download/ 文件夹不存在，则会先创建 Download，再创建 ABC 文件夹。
   * @param path 路径
   */
  ensureDir: (path: string) => void

  /**
   * 读取文本文件 path 的所有内容并返回。如果文件不存在，则抛出 FileNotFoundException。
   * @param path 路径
   * @param encoding 字符编码，可选，默认为 utf-8
   * @returns 文件内容
   * @example
   * log(files.read("/sdcard/1.txt"));
   */
  read: (path: string, encoding?: string) => string

  /**
   * 读取文件 path 的所有内容并返回一个字节数组。如果文件不存在，则抛出 FileNotFoundException。
   * 注意，该数组是 Java 的数组，不具有 JavaScript 数组的 forEach, slice 等函数。
   * @param path 路径
   * @returns 字节数组
   */
  readBytes: (path: string) => number[]

  /**
   * 把 text 写入到文件 path 中。如果文件存在则覆盖，不存在则创建。
   * @param path 路径
   * @param text 要写入的文本内容
   * @param encoding 字符编码，可选，默认为 utf-8
   * @example
   * files.write("/sdcard/1.txt", "文件内容");
   */
  write: (path: string, text: string, encoding?: string) => void

  /**
   * 把 bytes 写入到文件 path 中。如果文件存在则覆盖，不存在则创建。
   * @param path 路径
   * @param bytes 字节数组，要写入的二进制数据
   */
  writeBytes: (path: string, bytes: number[]) => void

  /**
   * 把 text 追加到文件 path 的末尾。如果文件不存在则创建。
   * @param path 路径
   * @param text 要追加的文本内容
   * @param encoding 字符编码，可选，默认为 utf-8
   * @example
   * files.append("/sdcard/1.txt", "追加的文件内容");
   */
  append: (path: string, text: string, encoding?: string) => void

  /**
   * 把 bytes 追加到文件 path 的末尾。如果文件不存在则创建。
   * @param path 路径
   * @param bytes 字节数组，要追加的二进制数据
   * @param encoding 字符编码，可选
   */
  appendBytes: (path: string, bytes: number[], encoding?: string) => void

  /**
   * 复制文件，返回是否复制成功。
   * @param fromPath 要复制的原文件路径
   * @param toPath 复制到的文件路径
   * @returns 是否复制成功
   * @example
   * files.copy("/sdcard/1.txt", "/sdcard/Download/1.txt");
   */
  copy: (fromPath: string, toPath: string) => boolean

  /**
   * 移动文件，返回是否移动成功。
   * @param fromPath 要移动的原文件路径
   * @param toPath 移动到的文件路径
   * @returns 是否移动成功
   * @example
   * files.move("/sdcard/1.txt", "/sdcard/Download/1.txt");
   */
  move: (fromPath: string, toPath: string) => boolean

  /**
   * 重命名文件，并返回是否重命名成功。
   * @param path 要重命名的原文件路径
   * @param newName 要重命名的新文件名
   * @returns 是否重命名成功
   * @example
   * files.rename("/sdcard/1.txt", "2.txt");
   */
  rename: (path: string, newName: string) => boolean

  /**
   * 重命名文件，不包含拓展名，并返回是否重命名成功。
   * @param path 要重命名的原文件路径
   * @param newName 要重命名的新文件名（不含拓展名）
   * @returns 是否重命名成功
   * @example
   * files.renameWithoutExtension("/sdcard/1.txt", "2"); // 会把 "1.txt" 重命名为 "2.txt"
   */
  renameWithoutExtension: (path: string, newName: string) => boolean

  /**
   * 返回文件的文件名。
   * @param path 路径
   * @returns 文件名
   * @example
   * files.getName("/sdcard/1.txt"); // 返回 "1.txt"
   */
  getName: (path: string) => string

  /**
   * 返回不含拓展名的文件的文件名。
   * @param path 路径
   * @returns 不含拓展名的文件名
   * @example
   * files.getNameWithoutExtension("/sdcard/1.txt"); // 返回 "1"
   */
  getNameWithoutExtension: (path: string) => string

  /**
   * 返回文件的拓展名。
   * @param path 路径
   * @returns 拓展名
   * @example
   * files.getExtension("/sdcard/1.txt"); // 返回 "txt"
   */
  getExtension: (path: string) => string

  /**
   * 删除文件或空文件夹，返回是否删除成功。
   * @param path 路径
   * @returns 是否删除成功
   */
  remove: (path: string) => boolean

  /**
   * 删除文件夹，如果文件夹不为空，则删除该文件夹的所有内容再删除该文件夹，返回是否全部删除成功。
   * @param path 路径
   * @returns 是否全部删除成功
   */
  removeDir: (path: string) => boolean

  /**
   * 返回 SD 卡路径。所谓 SD 卡，即外部存储器。
   * @returns SD 卡路径
   */
  getSdcardPath: () => string

  /**
   * 返回脚本的"当前工作文件夹路径"。
   * 该路径指的是，如果脚本本身为脚本文件，则返回这个脚本文件所在目录；否则返回 null 或其他设定路径。
   * @returns 当前工作文件夹路径
   * @example
   * // 对于脚本文件 "/sdcard/脚本/1.js" 运行 files.cwd() 返回 "/sdcard/脚本/"
   */
  cwd: () => string | null

  /**
   * 返回相对路径对应的绝对路径。
   * @param relativePath 相对路径
   * @returns 绝对路径
   * @example
   * // 如果运行这个语句的脚本位于文件夹 "/sdcard/脚本/" 中
   * files.path("./1.png"); // 返回 "/sdcard/脚本/1.png"
   */
  path: (relativePath: string) => string

  /**
   * 列出文件夹 path 下的满足条件的文件和文件夹的名称的数组。如果不加 filter 参数，则返回所有文件和文件夹。
   * @param path 路径
   * @param filter 过滤函数，可选。接收一个 string 参数（文件名），返回一个 boolean 值。
   * @returns 文件和文件夹名称数组
   * @example
   * var arr = files.listDir("/sdcard/");
   * log(arr);
   * @example
   * // 列出脚本目录下所有 js 脚本文件
   * var dir = "/sdcard/脚本/";
   * var jsFiles = files.listDir(dir, function(name){
   *     return name.endsWith(".js") && files.isFile(files.join(dir, name));
   * });
   */
  listDir: (path: string, filter?: (fileName: string) => boolean) => string[]
}

/**
 * 打开一个文件。根据打开模式返回不同的文件对象。
 * - "r": 返回一个 ReadableTextFile 对象。
 * - "w", "a": 返回一个 WritableTextFile 对象。
 *
 * 对于 "w" 模式，如果文件并不存在，则会创建一个，已存在则会清空该文件内容；其他模式文件不存在会抛出 FileNotFoundException。
 * @param path 文件路径，例如 "/sdcard/1.txt"
 * @param mode 文件打开模式，包括：
 *   - "r": 只读文本模式。该模式下只能对文件执行文本读取操作。
 *   - "w": 只写文本模式。该模式下只能对文件执行文本覆盖写入操作。
 *   - "a": 附加文本模式。该模式下将会把写入的文本附加到文件末尾。
 *   - "rw": 随机读写文本模式。
 * @param encoding 字符编码，可选，默认为 utf-8
 * @param bufferSize 文件读写的缓冲区大小，可选，默认为 8192
 * @returns 文件对象
 */
declare function open(path: string, mode?: 'r', encoding?: string, bufferSize?: number): ReadableTextFile
declare function open(path: string, mode: 'w' | 'a', encoding?: string, bufferSize?: number): WritableTextFile
declare function open(path: string, mode: 'rw', encoding?: string, bufferSize?: number): ReadableTextFile & WritableTextFile

/**
 * 可读文件对象。
 */
interface ReadableTextFile {
  /**
   * 返回该文件剩余的所有内容的字符串。
   * @returns 文件剩余内容
   */
  read(): string

  /**
   * 读取该文件接下来最长为 maxCount 的字符串并返回。即使文件剩余内容不足 maxCount 也不会出错。
   * @param maxCount 最大读取的字符数量
   * @returns 读取的字符串
   */
  read(maxCount: number): string

  /**
   * 读取一行并返回（不包含换行符）。
   * @returns 一行内容
   */
  readline(): string

  /**
   * 读取剩余的所有行，并返回它们按顺序组成的字符串数组。
   * @returns 行数组
   */
  readlines(): string[]

  /**
   * 关闭该文件。
   * 打开一个文件不再使用时务必关闭。
   */
  close(): void
}

/**
 * 可写文件对象。
 */
interface WritableTextFile {
  /**
   * 把文本内容 text 写入到文件中。
   * @param text 文本
   */
  write(text: string): void

  /**
   * 把文本 line 写入到文件中并写入一个换行符。
   * @param line 文本
   */
  writeline(line: string): void

  /**
   * 把很多行写入到文件中。
   * @param lines 字符串数组
   */
  writelines(lines: string[]): void

  /**
   * 把缓冲区内容输出到文件中。
   */
  flush(): void

  /**
   * 关闭文件。同时会把缓冲区内容输出到文件。
   * 打开一个文件写入后，不再使用时务必关闭，否则文件可能会丢失。
   */
  close(): void
}
