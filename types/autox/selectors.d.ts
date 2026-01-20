// 基于控件的操作
declare let auto
declare let click
declare let longClick
declare let scrollUp
declare let scrollDown
declare let setText
declare let input
declare let text
declare let textContains
declare let textStartsWith
declare let textEndsWith
declare let textMatches
declare let desc
declare let descContains
declare let descStartsWith
declare let descEndsWith
declare let descMatches
declare let id
declare let idContains
declare let idStartsWith
declare let idEndsWith
declare let idMatches
declare let className
declare let classNameContains
declare let classNameStartsWith
declare let classNameEndsWith
declare let classNameMatches
declare let packageName
declare let packageNameContains
declare let packageNameStartsWith
declare let packageNameEndsWith
declare let packageNameMatches
declare let bounds
declare let boundsInside
declare let boundsContains

// 基于坐标的操作
declare let setScreenMetrics
declare let press
declare let swipe
declare let gesture

declare class JavaAdapter {
  constructor(...p: any[])
  tap
  swipe
  press
  longPress
  touchDown
  touchMove
  touchUp;
  [x: string]: any
}

declare let Tap
declare let Swipe
