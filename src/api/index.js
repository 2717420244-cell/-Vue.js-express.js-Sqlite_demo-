/**
 * ============================================================
 * Axios 网络请求配置与封装
 * ============================================================
 *
 * 本文件包含：
 * 1. Axios 实例创建及 baseURL 配置
 * 2. 请求拦截器（添加 Token、显示 Loading）
 * 3. 响应拦截器（统一错误处理、数据提取）
 * 4. 封装通用的 GET/POST/PUT/DELETE 方法
 */

import axios from 'axios'

// -----------------------------------------------------------
// 1. 创建 Axios 实例 & baseURL 配置
// -----------------------------------------------------------
// 使用 JSONPlaceholder 作为免费的 Mock API 服务
// 实际项目中替换为你的后端 API 地址
const http = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,              // 请求超时 10 秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// -----------------------------------------------------------
// 2. 请求拦截器
// -----------------------------------------------------------
// 在每次请求发出前进行处理
http.interceptors.request.use(
  (config) => {
    // 2.1 从 localStorage 读取 Token 并附加到请求头
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 2.2 开发环境下打印请求信息，方便调试
    if (import.meta.env.DEV) {
      console.log(`[Axios] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    }

    return config
  },
  (error) => {
    // 请求配置出错时直接拒绝
    console.error('[Axios] 请求配置错误:', error)
    return Promise.reject(error)
  }
)

// -----------------------------------------------------------
// 3. 响应拦截器
// -----------------------------------------------------------
// 在每次收到响应后进行处理
http.interceptors.response.use(
  (response) => {
    // 3.1 开发环境下打印响应信息
    if (import.meta.env.DEV) {
      console.log(`[Axios] ← ${response.status} ${response.config.url}`)
    }

    // 3.2 直接返回 data，简化调用方代码
    return response.data
  },
  (error) => {
    // 3.3 统一错误处理
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权 — 清除 Token 并跳转登录页
          console.error('[Axios] 401 未授权，请重新登录')
          localStorage.removeItem('auth_token')
          // router.push('/login')  // 实际项目中取消注释
          break
        case 403:
          console.error('[Axios] 403 权限不足')
          break
        case 404:
          console.error('[Axios] 404 资源不存在')
          break
        case 500:
          console.error('[Axios] 500 服务器错误:', data)
          break
        default:
          console.error(`[Axios] HTTP ${status}:`, data)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应（网络问题）
      console.error('[Axios] 网络连接失败，请检查网络')
    } else {
      console.error('[Axios] 请求错误:', error.message)
    }

    return Promise.reject(error)
  }
)

// -----------------------------------------------------------
// 4. 导出封装好的实例
// -----------------------------------------------------------
export default http
