# 任务框架使用指南

本文档介绍任务框架的设计思路和使用方法。

## 目录

- [设计思路](#设计思路)
- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [API 参考](#api-参考)
- [高级功能](#高级功能)
- [最佳实践](#最佳实践)

---

## 设计思路

### 为什么需要这个框架？

原有的任务代码（如 `douji.js`）存在以下问题：

1. **循环与业务耦合** - `while` 循环写在任务内部，无法统一控制
2. **无法暂停/恢复** - 一旦开始就只能等待完成或强制终止
3. **中断困难** - 定时任务、突发事件难以插入
4. **状态难以恢复** - 中断后无法从断点继续

### 核心设计理念

```
┌─────────────────────────────────────────────────────────┐
│  原有设计                                                │
│  function task(times) {                                  │
│    while (i < times) {  ← 循环在任务内部                 │
│      // 业务逻辑                                         │
│    }                                                     │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↓ 拆分
┌─────────────────────────────────────────────────────────┐
│  新设计                                                  │
│  Task.execute()     ← 只负责单次循环体                   │
│  TaskRunner         ← 负责循环调度、暂停/恢复/停止        │
│  Scheduler          ← 负责定时/周期/事件任务中断          │
└─────────────────────────────────────────────────────────┘
```

### 线程模型

```
┌─────────────────────────────────────────────────────────────┐
│                        单 Runner 线程                        │
│  所有游戏交互（截图/找图/点击）都在此线程串行执行              │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ 投递中断请求（只写队列，不做交互）
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────┴───────┐   ┌─────────┴─────────┐   ┌───────┴───────┐
│  定时检查线程  │   │   周期检查线程     │   │  事件检测线程  │
└───────────────┘   └───────────────────┘   └───────────────┘
```

**关键原则**：调度线程只能投递中断请求，禁止直接调用截图/点击等操作。

---

## 快速开始

### 1. 定义任务

```typescript
// tasks/YuHunTask.ts
import { $, ExecuteResult, Task } from '../task'

class YuHunTask extends Task {
  // 声明需要在中断时保存的状态字段
  static stateKeys = ['failureCount']

  private failureCount = 0
  private readonly maxFailures = 4

  setup() {
    this.log.info('御魂任务开始')
  }

  execute(): ExecuteResult {
    // 点击挑战
    if ($({ templatePath: 'assets/yuhun/challenge.png' }).match().click()) {
      this.failureCount++
      this.runner.sleep(random(2000, 5000))
    }

    // 胜利结算
    if ($({ text: '胜利' }).match().click()) {
      this.failureCount = 0
      this.log.info(`${this.ctx.count + 1}/${this.ctx.times} 完成`)
      return ExecuteResult.SUCCESS
    }

    // 失败检测
    if ($({ text: '失败' }).exists()) {
      this.log.warn('检测到失败')
      return ExecuteResult.STOP
    }

    // 失败次数过多
    if (this.failureCount >= this.maxFailures) {
      this.log.warn('连续失败过多，停止')
      return ExecuteResult.STOP
    }

    return ExecuteResult.CONTINUE
  }

  cleanup() {
    this.log.info('御魂任务结束')
  }
}

export { YuHunTask }
```

### 2. 运行任务

```typescript
import { TaskRunner } from './task'
import { YuHunTask } from './tasks/YuHunTask'

const runner = new TaskRunner()
const handle = runner.start(new YuHunTask(), { times: 50 })

// 监听事件
handle.on('success', () => console.log('完成一次'))
handle.on('finish', (result) => {
  console.log(`任务结束: ${result.successCount}/${result.totalLoops}`)
})
```

### 3. 控制任务

```typescript
// 在 UI 按钮回调中
handle.pause()   // 暂停
handle.resume()  // 恢复
handle.stop()    // 停止
```

---

## 核心概念

### ExecuteResult（执行结果）

每次 `execute()` 必须返回一个结果，告诉 Runner 下一步该做什么：

| 返回值 | 说明 |
|--------|------|
| `ExecuteResult.CONTINUE` | 继续下一次循环，不计入成功次数 |
| `ExecuteResult.SUCCESS` | 本次成功，成功计数+1，继续循环 |
| `ExecuteResult.STOP` | 停止任务 |
| `ExecuteResult.ERROR` | 发生错误，停止任务 |

### TaskContext（任务上下文）

通过 `this.ctx` 访问运行时上下文：

```typescript
interface TaskContext {
  count: number      // 当前成功次数
  times: number      // 目标执行次数
  loops: number      // 总循环次数（包括不成功的）
  startTime: number  // 任务开始时间戳
  params: Record<string, any>  // 自定义参数
}
```

示例：

```typescript
execute(): ExecuteResult {
  this.log.info(`进度: ${this.ctx.count}/${this.ctx.times}`)
  
  // 使用自定义参数
  const delayTime = this.ctx.params.delayTime ?? 800
  this.runner.sleep(delayTime)
  
  return ExecuteResult.CONTINUE
}
```

### stateKeys（状态字段声明）

当任务被中断时，框架会保存 `stateKeys` 中声明的字段，恢复时自动还原：

```typescript
class MyTask extends Task {
  // 只有这两个字段会在中断时被保存
  static stateKeys = ['isLocked', 'failureCount']

  private isLocked = false      // ← 会被保存
  private failureCount = 0      // ← 会被保存
  private readonly maxFailures = 4  // ← 不会被保存（常量无需保存）
}
```

### 可中断操作

任务内部应使用 `this.runner` 提供的可中断方法，而不是全局的 `sleep()`：

```typescript
// ❌ 不推荐：裸 sleep 无法响应 stop/pause/interrupt
sleep(5000)

// ✅ 推荐：可中断睡眠
this.runner.sleep(5000)

// ❌ 不推荐：Template.wait() 可能长时间阻塞
$({ text: '按钮' }).wait(30000)

// ✅ 推荐：使用可中断等待
this.runner.waitUntil(
  () => $({ text: '按钮' }).exists(),
  30000
)
```

### 安全中断点

中断任务（如定时任务、突发事件）只会在 `execute()` 返回 `SUCCESS` 后触发，确保当前战斗/操作完成后才会被打断：

```
御魂战斗中 → execute() 返回 CONTINUE → 不中断，继续战斗
    ↓
战斗胜利 → execute() 返回 SUCCESS → 检查中断队列
    ↓
有阴界之门任务 → 保存状态 → 执行阴界之门 → 恢复御魂任务
```

这样可以保证：
- 战斗不会被中途打断
- 定时任务在下一个「安全点」才会插入执行

---

## API 参考

### Task 基类

```typescript
abstract class Task {
  // 由 Runner 注入
  protected ctx: TaskContext
  protected log: Logger
  protected runner: { sleep, waitUntil }

  // 需要实现
  abstract execute(): ExecuteResult

  // 可选实现
  setup?(): void           // 任务开始前调用一次
  cleanup?(): void         // 任务结束后调用一次
  isInScene?(): boolean    // 检测是否在任务场景内
  entryScene?(): void      // 导航到任务入口场景
}
```

### TaskRunner

```typescript
class TaskRunner {
  // 启动任务，返回句柄
  start(task: Task, options?: RunnerOptions): TaskHandle

  // 可中断的睡眠
  sleep(ms: number): void

  // 可中断的条件等待
  waitUntil(condition: () => boolean, timeout?: number, interval?: number): boolean
}

interface RunnerOptions {
  times?: number      // 执行次数，默认无限
  interval?: number   // 循环间隔(ms)，默认 800
  params?: Record<string, any>  // 自定义参数
}
```

### TaskHandle

```typescript
interface TaskHandle {
  pause(): void       // 暂停任务
  resume(): void      // 恢复任务
  stop(): void        // 停止任务
  
  readonly state: RunnerState
  readonly context: TaskContext
  
  on(event: TaskEventType, callback: (data?: any) => void): void
  wait(): TaskResult  // 阻塞等待任务完成
}
```

### TaskQueue

```typescript
class TaskQueue {
  add(task: Task, options?: RunnerOptions): this
  clear(): void
  readonly length: number
  readonly currentIndex: number
}

// 使用示例
const queue = new TaskQueue({
  onTaskStart: (task, i) => console.log(`开始任务 ${i + 1}`),
  onTaskEnd: (task, result, i) => console.log(`任务 ${i + 1} 完成`)
})

queue
  .add(new YuHunTask(), { times: 50 })
  .add(new DoujiTask(), { times: 10 })
```

---

## 高级功能

### 任务队列

顺序执行多个任务：

```typescript
import { TaskQueue, TaskRunner } from './task'
import { DoujiTask } from './tasks/DoujiTask'
import { YuHunTask } from './tasks/YuHunTask'

const queue = new TaskQueue({
  onTaskStart: (task, i) => console.log(`开始第 ${i + 1} 个任务`),
  onTaskEnd: (task, result, i) => console.log(`任务 ${i + 1} 完成`)
})

queue
  .add(new YuHunTask(), { times: 50 })
  .add(new DoujiTask(), { times: 10 })

const runner = new TaskRunner()
const handle = runner.startQueue(queue)

// 控制
handle.skip()   // 跳过当前任务，执行下一个
handle.stop()   // 停止整个队列
```

### 调度器（定时/周期/事件任务）

```typescript
import { InterruptPriority, Scheduler, TaskQueue } from './task'
import { JiYangTask } from './tasks/JiYangTask'
import { QingLiYuHunTask } from './tasks/QingLiYuHunTask'
import { YinJieMenTask } from './tasks/YinJieMenTask'
import { YuHunTask } from './tasks/YuHunTask'

const scheduler = new Scheduler()

// 定时任务：每天 7 点打阴界之门
scheduler.schedule({
  name: '阴界之门',
  time: '07:00',
  task: new YinJieMenTask(),
  options: { times: 3 },
  priority: InterruptPriority.HIGH,
})

// 周期任务：每 30 分钟寄养
scheduler.every({
  name: '寄养',
  interval: 30 * 60 * 1000,
  task: new JiYangTask(),
  priority: InterruptPriority.NORMAL,
})

// 突发事件：御魂爆满（在独立线程中并行执行）
scheduler.on({
  name: '御魂爆满',
  condition: () => $({ templatePath: 'assets/yuhun_full.png' }).exists(),
  checkInterval: 60 * 1000,
  task: new QingLiYuHunTask(),
})

// 主任务队列
const mainQueue = new TaskQueue()
  .add(new YuHunTask(), { times: 100 })

// 启动调度器
const handle = scheduler.start(mainQueue)
```

### 中断优先级

| 优先级 | 说明 |
|--------|------|
| `InterruptPriority.LOW` | 低优先级，队列末尾 |
| `InterruptPriority.NORMAL` | 普通优先级 |
| `InterruptPriority.HIGH` | 高优先级，队列前部 |

### 事件任务（并行执行）

事件任务触发后会在**独立线程**中并行执行，不会中断主任务。适用于处理弹窗、网络卡顿等与主任务逻辑可共存的场景：

```typescript
// 事件任务：御魂爆满（在独立线程中执行，不影响主任务）
scheduler.on({
  name: '御魂爆满',
  condition: () => $({ templatePath: 'assets/yuhun_full.png' }).exists(),
  checkInterval: 60 * 1000,
  task: new QingLiYuHunTask(),
})
```

### 场景导航

实现 `isInScene()` 和 `entryScene()` 方法，框架会在中断恢复后自动导航回任务场景：

```typescript
class YuHunTask extends Task {
  isInScene(): boolean {
    return $({ text: '御魂' }).exists()
  }

  entryScene() {
    $({ text: '探索' }).wait().click()
    this.runner.sleep(1000)
    $({ text: '御魂' }).wait().click()
    this.runner.sleep(1000)
  }
}
```

中断恢复流程：

```
中断任务完成
    ↓
恢复主任务状态（ctx + stateKeys 字段）
    ↓
检查 isInScene()
    ↓ 不在场景内
调用 entryScene() 导航
    ↓
继续 execute()
```

---

## 最佳实践

### 1. 状态字段最小化

只在 `stateKeys` 中声明真正需要跨中断保存的字段：

```typescript
// ✅ 好的做法
static stateKeys = ['isLocked', 'failureCount']

// ❌ 避免：不需要保存常量或可重新计算的值
static stateKeys = ['isLocked', 'failureCount', 'maxFailures', 'startTime']
```

### 2. 事件检测轻量化

事件检测会频繁执行，避免使用重操作（如 OCR）：

```typescript
// ❌ 不推荐：OCR 较重
scheduler.on({
  condition: () => $({ text: '御魂已满' }).exists(),
  checkInterval: 10 * 1000,  // 每10秒 OCR 一次太频繁
})

// ✅ 推荐：使用图片模板
scheduler.on({
  condition: () => $({ templatePath: 'yuhun_full.png' }).exists(),
  checkInterval: 60 * 1000,
})
```

### 3. 使用可中断方法

确保任务能及时响应暂停/停止/中断：

```typescript
execute(): ExecuteResult {
  // ✅ 使用可中断睡眠
  this.runner.sleep(random(2000, 5000))
  
  // ✅ 使用可中断等待
  const found = this.runner.waitUntil(
    () => $({ text: '继续' }).exists(),
    10000
  )
  
  if (!found) {
    return ExecuteResult.STOP
  }
  
  return ExecuteResult.CONTINUE
}
```

### 4. 合理划分任务粒度

每个任务应该是独立的、可复用的单元：

```typescript
// ✅ 好的做法：每个副本一个任务
class YuHunTask extends Task { ... }
class YuLingTask extends Task { ... }
class DoujiTask extends Task { ... }

// ❌ 避免：一个任务做太多事情
class AllInOneTask extends Task {
  execute() {
    // 打御魂
    // 打御灵
    // 打斗技
    // ...
  }
}
```

---

## 目录结构

```
src-autox/
├── core/                    # 核心库
│   ├── matcher.ts          # Template 匹配器
│   ├── action.ts           # 人类化动作
│   ├── capture.ts          # 截图
│   ├── config.ts           # 默认配置
│   └── logger.ts           # 日志
│
├── task/                    # 任务框架
│   ├── types.ts            # 类型定义
│   ├── Task.ts             # 任务基类
│   ├── TaskRunner.ts       # 任务运行器
│   ├── TaskQueue.ts        # 任务队列
│   ├── Scheduler.ts        # 调度器
│   ├── Navigator.ts        # 统一导航层
│   └── index.ts            # 模块入口
│
└── tasks/                   # 具体任务实现
    ├── DoujiTask.ts        # 斗技
    ├── QilingTask.ts       # 契灵
    └── ...
```
