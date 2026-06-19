/**
 * 账号交易系统 — 全部 API
 */
import http from './tradeHttp'

// ==================== 认证 ====================
export function register(data) {
  return http.post('/auth/register', data)
}
export function login(data) {
  return http.post('/auth/login', data)
}
export function getProfile() {
  return http.get('/auth/profile')
}
export function updateProfile(data) {
  return http.put('/auth/profile', data)
}

// ==================== 商品 ====================
export function getItems(params) {
  return http.get('/items', { params })
}
export function getItemById(id) {
  return http.get(`/items/${id}`)
}
export function createItem(data) {
  return http.post('/items', data)
}
export function updateItem(id, data) {
  return http.put(`/items/${id}`, data)
}
export function deleteItem(id) {
  return http.delete(`/items/${id}`)
}
export function updateItemStatus(id, status) {
  return http.put(`/items/${id}/status`, { status })
}

// ==================== 订单 ====================
export function getOrders(params) {
  return http.get('/orders', { params })
}
export function getOrderById(id) {
  return http.get(`/orders/${id}`)
}
export function createOrder(itemId) {
  return http.post('/orders', { item_id: itemId })
}
export function payOrder(id) {
  return http.put(`/orders/${id}/pay`)
}
export function deliverOrder(id, accountInfo) {
  return http.put(`/orders/${id}/deliver`, { account_info: accountInfo })
}
export function confirmOrder(id) {
  return http.put(`/orders/${id}/confirm`)
}

// ==================== 评价 ====================
export function getReviews(itemId, params) {
  return http.get('/reviews', { params: { item_id: itemId, ...params } })
}
export function createReview(data) {
  return http.post('/reviews', data)
}
