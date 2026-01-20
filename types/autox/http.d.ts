declare let http: {
  get: (url: string, options?: http_request_options, callback?) => Response
  post: (url: string, data, options?: http_request_options, callback?) => Response
  postJson: (url: string, data?, options?: http_request_options, callback?) => Response
  postMultipart: (url: string, files: any, options?: http_request_options, callback?) => Response
  request: (url: string, options?: http_request_options, callback?) => Response
}

interface http_request_options {
  headers?: any
  method?: string
  contentType?: string
  body?: string | Array<any> | Function
}

interface Response {
  statusCode: number
  statusMessage: string
  headers: any
  body: {
    bytes: () => Array<any>
    string: () => string
    json: () => any
    contentType: string
  }
  request: any
  url: any
  /** 当前响应所对应的 HTTP 请求的方法。例如 "GET", "POST", "PUT" 等。 */
  method: string
}

// webSocket
declare class OkHttpClient {
  constructor(...p: any[])
  static Builder;
  [x: string]: any
}

declare class Request {
  constructor(...p: any[])
  static Builder;
  [x: string]: any
}

declare class WebSocketListener {
  constructor(...p: any[])
  [x: string]: any
}

declare class MutableOkHttp {
  constructor(...p: any[])
  [x: string]: any
}

declare let MediaType
declare let RequestBody
