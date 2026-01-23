# 任务框架使用指南

本文档介绍任务框架的设计思路和使用方法。

## 目录

- [设计思路](#设计思路)
- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [API 参考](#api-参考)
- [高级功能](#高级功能)
- [最佳实践](#最佳实践)
- [已知限制与注意事项](#已知限制与注意事项)

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

  // 声明式场景配置（可选）
  static sceneConfig = {
    targetTemplate: { templatePath: 'assets/yuhun/scene.png' },
    navigationSteps: [
      { templatePath: 'assets/explore.png' },
      { templatePath: 'assets/yuhun_entry.png' },
    ],
  }

  private failureCount = 0
  private readonly maxFailures = 4

  onEnter(reason: 'start' | 'resume') {
    this.log.info(`御魂任务${reason === 'start' ? '开始' : '恢复'}`)
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

  onLeave(reason: 'complete' | 'suspend' | 'stop' | 'error') {
    this.log.info(`御魂任务结束: ${reason}`)
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

### 任务生命周期

```
┌──────────────────────────────────────────────────────────────┐
│                       任务生命周期                            │
├──────────────────────────────────────────────────────────────┤
│  onEnter('start')                                            │
│       ↓                                                      │
│  ┌─→ execute() → SUCCESS → 检查中断队列 ─┐                   │
│  │       ↓                               │                   │
│  │   CONTINUE                            │                   │
│  │       ↓                               │                   │
│  └── sleep(interval) ←───────────────────┘                   │
│                                                              │
│  中断发生时:                                                  │
│    onLeave('suspend') → 保存状态 → 执行中断任务               │
│    → 恢复状态 → onEnter('resume') → 继续 execute()           │
│                                                              │
│  正常结束: onLeave('complete')                                │
│  外部停止: onLeave('stop')                                    │
│  发生错误: onLeave('error')                                   │
└──────────────────────────────────────────────────────────────┘
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

> ⚠️ **重要**：`stateKeys` 中声明的字段必须是 **JSON 可序列化** 的基本类型或普通对象。不支持 `Date`、`Map`、`Set`、函数、类实例或循环引用。

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

// ✅ 持续点击直到目标消失
this.runner.clickUntilGone(
  () => $({ templatePath: 'close.png' }).match().click(),
  1000
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
  // 静态配置
  static stateKeys: string[] = []        // 需要保存的状态字段
  static sceneConfig?: SceneConfig       // 场景配置（声明式导航）

  // 运行时引用（由 Runner 注入）
  protected ctx: TaskContext             // 任务上下文
  protected log: Logger                  // 日志记录器
  protected runner: {                    // 可中断操作
    sleep(ms: number): void
    waitUntil(condition: () => boolean, timeout?: number, interval?: number): boolean
    clickUntilGone(clickFn: () => boolean, interval?: number): boolean
  }

  // 生命周期方法
  onEnter?(reason: 'start' | 'resume'): void
  abstract execute(): ExecuteResult
  onLeave?(reason: 'complete' | 'suspend' | 'stop' | 'error'): void
}
```

### TaskRunner

```typescript
class TaskRunner {
  start(task: Task, options?: RunnerOptions): TaskHandle
  pause(): void
  resume(): void
  stop(): void
  addInterrupt(request: InterruptRequest): void
  readonly state: RunnerState
}

interface TaskHandle {
  pause(): void
  resume(): void
  stop(): void
  readonly state: RunnerState
  readonly context: TaskContext
  on(event: TaskEventType, callback: TaskEventCallback): void
  off(event: TaskEventType, callback: TaskEventCallback): void
  wait(): TaskResult
}

interface RunnerOptions {
  times?: number           // 执行次数，默认无限
  interval?: number        // 循环间隔(ms)，默认 800
  params?: Record<string, any>  // 自定义参数
}
```

### TaskQueue

```typescript
class TaskQueue {
  add(task: Task, options?: RunnerOptions): this
  addAll(tasks: QueuedTask[]): this
  clear(): void
  reset(): void
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

### Scheduler

```typescript
class Scheduler {
  schedule(job: TimedJob): this      // 定时任务（每天固定时间）
  every(job: IntervalJob): this      // 周期任务（间隔执行）
  on(job: EventJob): this            // 事件任务（条件触发，并行执行）
  remove(name: string): this         // 移除任务
  start(queue: TaskQueue): QueueHandle
  stop(): void
}
```

### Navigator

```typescript
const Navigator = {
  configure(options: Partial<SceneConfig>): void   // 配置主界面
  ensureStableUI(timeout?: number): boolean        // 确保回到主界面
  ensureScene(task: Task): boolean                 // 确保任务在正确场景
  navigateToScene(sceneConfig: SceneConfig): boolean
}
```

---

## 高级功能

### 任务队列

顺序执行多个任务：

```typescript
import { Scheduler, TaskQueue } from './task'
import { DoujiTask } from './tasks/DoujiTask'
import { YuHunTask } from './tasks/YuHunTask'

const queue = new TaskQueue({
  onTaskStart: (task, i) => console.log(`开始第 ${i + 1} 个任务`),
  onTaskEnd: (task, result, i) => console.log(`任务 ${i + 1} 完成`)
})

queue
  .add(new YuHunTask(), { times: 50 })
  .add(new DoujiTask(), { times: 10 })

const scheduler = new Scheduler()
const handle = scheduler.start(queue)

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

// 事件任务：御魂爆满（在独立线程中并行执行）
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

### 声明式场景导航

使用静态 `sceneConfig` 声明任务的目标场景，框架会在中断恢复后自动导航：

```typescript
class YuHunTask extends Task {
  static sceneConfig = {
    targetTemplate: { templatePath: 'assets/yuhun/scene.png' },
    navigationSteps: [
      { templatePath: 'assets/explore.png' },
      { templatePath: 'assets/yuhun_entry.png' },
    ],
    timeout: 30000,  // 可选，默认 30000ms
    interval: 500,   // 可选，默认 500ms
  }
}
```

中断恢复流程：

```
中断任务完成
    ↓
恢复主任务状态（ctx + stateKeys 字段）
    ↓
onEnter('resume')
    ↓
检查是否在目标场景
    ↓ 不在场景内
ensureStableUI() → 回到主界面
    ↓
navigateToScene() → 进入任务场景
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

### 5. Task 实例不要并发复用

**每次运行应使用新的 Task 实例**，避免在不同 Runner 或事件任务中复用同一实例：

```typescript
// ❌ 危险：同一实例可能被并发使用
const sharedTask = new QingLiYuHunTask()
scheduler.on({
  task: sharedTask,  // 危险！
})

// ✅ 安全：每次使用新实例
scheduler.on({
  task: new QingLiYuHunTask(),
})
```

---

## 已知限制与注意事项

### 1. Task 实例并发限制

**Task 实例禁止并发运行**。Runner 会向 Task 注入 `ctx` 和 `runner` 引用，如果同一 Task 实例被多个 Runner 并发执行，会导致状态混乱。框架会自动检测并抛出异常。

**建议**：
- 每次运行任务时创建新的 Task 实例
- 事件任务、定时任务、周期任务都应使用独立的 Task 实例

### 2. 状态序列化限制

`stateKeys` 中的字段使用 `JSON.stringify/parse` 进行深拷贝，以下类型**不被支持**：
- `Date` 对象（会变成字符串）
- `Map`、`Set`（会变成空对象）
- 函数、类实例
- 循环引用
- `undefined`（会被丢弃）

**建议**：只保存基本类型（number、string、boolean）和普通对象/数组。

### 3. 事件监听器累积

`TaskHandle.on()` 注册的监听器不会在任务重新运行时自动清除。如果需要多次运行同一 Runner，建议：

```typescript
// 运行前清除旧监听器
runner.clearListeners()
const handle = runner.start(task, options)
handle.on('finish', callback)
```

### 4. Runner 重入限制

一个 `TaskRunner` 实例在 RUNNING 或 PAUSED 状态时不能再次调用 `start()`，会抛出异常。如需并行运行多个任务，请创建多个 TaskRunner 实例。

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
│   ├── index.ts            # 模块入口
│   └── TaskGuide.md        # 本文档
│
└── tasks/                   # 具体任务实现
    ├── DoujiTask.ts        # 斗技
    ├── QilingTask.ts       # 契灵
    └── ...
```
