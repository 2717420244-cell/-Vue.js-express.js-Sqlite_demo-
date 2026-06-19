/**
 * 账号交易系统 — Pinia 认证 Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as tradeApi from '@/api/trade'

export const useAuthStore = defineStore('tradeAuth', () => {
  // ---- 状态 ----
  const token = ref(localStorage.getItem('trade_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('trade_user') || 'null'))

  // ---- 计算属性 ----
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username || '')
  const uid = computed(() => user.value?.uid || null)

  // ---- 操作 ----
  function saveAuth(t, u) {
    token.value = t
    user.value = u
    localStorage.setItem('trade_token', t)
    localStorage.setItem('trade_user', JSON.stringify(u))
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('trade_token')
    localStorage.removeItem('trade_user')
  }

  async function doRegister(data) {
    const res = await tradeApi.register(data)
    saveAuth(res.data.token, res.data.user)
    return res
  }

  async function doLogin(data) {
    const res = await tradeApi.login(data)
    saveAuth(res.data.token, res.data.user)
    return res
  }

  function doLogout() {
    clearAuth()
  }

  async function fetchProfile() {
    const res = await tradeApi.getProfile()
    user.value = res.data
    localStorage.setItem('trade_user', JSON.stringify(res.data))
    return res
  }

  return {
    token, user, isLoggedIn, username, uid,
    doRegister, doLogin, doLogout, fetchProfile, clearAuth
  }
})
