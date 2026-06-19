/**
 * ============================================================
 * 账号交易系统 API（v2 — 支持多 baseURL）
 * ============================================================
 *
 * 这个 Axios 实例指向账号交易后端（localhost:3001），
 * 与之前的 JSONPlaceholder 实例互相独立。
 */
import axios from 'axios'

const tradeHttp = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：自动注入 Token
tradeHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem('trade_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (import.meta.env.DEV) {
    console.log(`[Trade API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
  }
  return config
}, (error) => Promise.reject(error))

// 响应拦截器：统一处理
tradeHttp.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) {
      console.log(`[Trade API] ← ${res.status} ${res.config.url}`)
    }
    return res.data
  },
  (error) => {
    const msg = error.response?.data?.message || error.message
    if (error.response?.status === 401) {
      localStorage.removeItem('trade_token')
    }
    return Promise.reject(new Error(msg))
  }
)

export default tradeHttp
