/**
 * ============================================================
 * 用户管理 API 接口（增强版）
 * ============================================================
 *
 * 覆盖完整的 CRUD 操作：
 *   GET    /users      获取用户列表
 *   GET    /users/:id  获取单个用户
 *   POST   /users      创建用户（模拟）
 *   PUT    /users/:id  更新用户（模拟）
 *   DELETE /users/:id  删除用户（模拟）
 *
 * JSONPlaceholder 的 POST/PUT/DELETE 不会真正修改服务器数据，
 * 但会返回正确的响应格式，适合前端开发和演示。
 */

import http from './index'

// ---- 查询 ----

/** 获取所有用户列表 */
export function getUsers() {
  return http.get('/users')
}

/** 根据 ID 获取用户详情 */
export function getUserById(id) {
  return http.get(`/users/${id}`)
}

// ---- 新增 ----

/** 创建新用户（模拟 POST） */
export function createUser(userData) {
  return http.post('/users', userData)
}

// ---- 更新 ----

/** 更新用户信息（模拟 PUT） */
export function updateUser(id, userData) {
  return http.put(`/users/${id}`, userData)
}

// ---- 删除 ----

/** 删除用户（模拟 DELETE） */
export function deleteUser(id) {
  return http.delete(`/users/${id}`)
}
