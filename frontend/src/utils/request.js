import axios from 'axios'
import { Message, Loading } from 'element-ui'

// 请求map
const pendingMap = new Map()
// loading实例
const LoadingInstance = {
  _target: null,
  _count: 0
}

function request(axiosConfig, insetCustomOptions, loadingOptions) {
  const service = axios.create({
    baseURL: axiosConfig.baseUrl || '/', // 设置统一的请求前缀
    timeout: 10000, // 设置统一的超时时长10s
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })

  // 自定义配置
  const customOptions = Object.assign(
    {
      repeatRequestCancel: true, // 是否开启取消重复请求，默认为 true
      loading: true // 是否开启loading层效果，默认为true
    },
    insetCustomOptions
  )

  // 请求拦截
  service.interceptors.request.use(
    config => {
      removePending(config)
      customOptions.repeatRequestCancel && addPending(config)
      // 创建loading实例
      if (customOptions.loading) {
        LoadingInstance._count++
        if (LoadingInstance._count === 1) {
          LoadingInstance._target = Loading.service(
            Object.assign(
              {
                lock: true,
                text: '请稍后...',
                spinner: 'el-icon-loading',
                background: '#f7f8fa'
              },
              loadingOptions
            )
          )
        }
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // 响应拦截
  service.interceptors.response.use(
    response => {
      removePending(response.config)
      customOptions.loading && closeLoading(customOptions) // 关闭loading
      if (response.data) {
        if (response.data.code === 401) {
          Message({
            type: 'info',
            message: '登录过期，请重新登录',
            duration: 1000
          })
          return Promise.reject(response.data)
        } else if (response.data.code === 500) {
          Message({
            type: 'info',
            message: '服务端错误',
            duration: 1000
          })
          return Promise.reject(response.data)
        } else if (response.data.code === 200) {
          return Promise.resolve(response.data)
        }
      } else {
        Message({
          type: 'error',
          message: '服务端异常'
        })
        return Promise.reject({ code: 503, message: '服务端异常' })
      }
    },
    error => {
      error.config && removePending(error.config)
      customOptions.loading && closeLoading(customOptions) // 关闭loading
      return Promise.reject(error) // 错误继续返回给到具体页面
    }
  )

  return service(axiosConfig)
}

export default request

/**
 * 关闭Loading层实例
 * @param {*} _options
 */
function closeLoading(_options) {
  if (_options.loading && LoadingInstance._count > 0) LoadingInstance._count--
  if (LoadingInstance._count === 0) {
    LoadingInstance._target.close()
    LoadingInstance._target = null
  }
}

/**
 * 储存每个请求的唯一cancel回调, 以此为标识
 * @param {*} config
 */
function addPending(config) {
  const pendingKey = getPendingKey(config)
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken(cancel => {
      if (!pendingMap.has(pendingKey)) {
        pendingMap.set(pendingKey, cancel)
      }
    })
}

/**
 * 删除重复的请求
 * @param {*} config
 */
function removePending(config) {
  const pendingKey = getPendingKey(config)
  if (pendingMap.has(pendingKey)) {
    const cancelToken = pendingMap.get(pendingKey)
    cancelToken(pendingKey)
    pendingMap.delete(pendingKey)
  }
}

/**
 * 生成唯一的每个请求的唯一key
 * @param {*} config
 * @returns
 */
function getPendingKey(config) {
  let { url, method, params, data } = config
  if (typeof data === 'string') data = JSON.parse(data) // response里面返回的config.data是个字符串对象
  return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
}
