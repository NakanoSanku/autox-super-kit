import { useState } from 'react'

function invokeFn<T = any>(name: string, data?: any): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    MyAutoxBridge.invoke(name, data, (r: T & { __message?: string }) => {
      if (r?.__message)
        reject(r.__message)
      else
        resolve(r)
    })
  })
}

function App() {
  const [status, setStatus] = useState<string>('')
  const [result, setResult] = useState<string>('')

  const showLog = () => invokeFn('show_log')

  const gameInit = async () => {
    setResult('初始化中...')
    const r = await invokeFn('game_init')
    setResult(JSON.stringify(r))
  }

  const gameConfigure = async () => {
    const r = await invokeFn('game_configure', [300, 100])
    setResult(JSON.stringify(r))
  }

  const gameRegisterScene = async () => {
    const r = await invokeFn('game_register_scene')
    setResult(JSON.stringify(r))
  }

  const gameRegisterTask = async () => {
    const r = await invokeFn('game_register_task')
    setResult(JSON.stringify(r))
  }

  const gameStart = async () => {
    const r = await invokeFn('game_start')
    setResult(JSON.stringify(r))
  }

  const gamePause = async () => {
    const r = await invokeFn('game_pause')
    setResult(JSON.stringify(r))
  }

  const gameResume = async () => {
    const r = await invokeFn('game_resume')
    setResult(JSON.stringify(r))
  }

  const gameStop = async () => {
    const r = await invokeFn('game_stop')
    setResult(JSON.stringify(r))
  }

  const gameStatus = async () => {
    const r = await invokeFn('game_status')
    setStatus(JSON.stringify(r, null, 2))
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ textAlign: 'center', margin: 0 }}>Game 框架测试</h3>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={showLog}>日志窗口</button>
        <button onClick={gameInit}>初始化</button>
        <button onClick={gameConfigure}>配置</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={gameRegisterScene}>注册场景</button>
        <button onClick={gameRegisterTask}>注册任务</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={gameStart}>启动</button>
        <button onClick={gamePause}>暂停</button>
        <button onClick={gameResume}>恢复</button>
        <button onClick={gameStop}>停止</button>
      </div>

      <button onClick={gameStatus}>刷新状态</button>

      <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, margin: 0, whiteSpace: 'pre-wrap' }}>
        {result}
      </pre>

      <pre style={{ fontSize: 11, background: '#e8f5e9', padding: 8, margin: 0, whiteSpace: 'pre-wrap' }}>
        {status}
      </pre>
    </div>
  )
}

export default App
