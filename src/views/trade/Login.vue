<template>
  <div class="login-page">
    <div class="login-card card">
      <!-- Tab 切换 -->
      <div class="login-tabs">
        <button :class="{ active: tab === 'login' }" @click="switchTab('login')">登录</button>
        <button :class="{ active: tab === 'register' }" @click="switchTab('register')">注册</button>
      </div>

      <!-- 登录表单 -->
      <form v-if="tab === 'login'" class="login-form" @submit.prevent="handleLogin">
        <div class="form-item">
          <label>手机号</label>
          <input v-model="loginForm.phone" type="text" maxlength="11" placeholder="请输入手机号" class="form-input" />
          <span v-if="loginErr" class="field-error">{{ loginErr }}</span>
        </div>
        <div class="form-item">
          <label>密码</label>
          <input v-model="loginForm.password" type="password" placeholder="请输入密码" class="form-input" />
        </div>
        <button type="submit" class="btn btn--full" :disabled="loginLoading">
          {{ loginLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-else class="login-form" @submit.prevent="handleRegister">
        <div class="form-item">
          <label>用户名</label>
          <input v-model="regForm.username" type="text" placeholder="请输入用户名" class="form-input" />
        </div>
        <div class="form-item">
          <label>手机号</label>
          <input v-model="regForm.phone" type="text" maxlength="11" placeholder="请输入手机号" class="form-input" />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input v-model="regForm.password" type="password" placeholder="请输入密码（至少6位）" class="form-input" />
        </div>
        <span v-if="regErr" class="field-error" style="display:block;margin-bottom:12px;">{{ regErr }}</span>
        <button type="submit" class="btn btn--full" :disabled="regLoading">
          {{ regLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p v-if="authStore.isLoggedIn" class="logged-hint">
        ✅ 已登录：{{ authStore.username }}
        <a href="#" @click.prevent="$router.push('/trade/items')">进入商城 →</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/tradeAuth'

const router = useRouter()
const authStore = useAuthStore()

const tab = ref('login')
const loginErr = ref('')
const regErr = ref('')
const loginLoading = ref(false)
const regLoading = ref(false)

const loginForm = reactive({ phone: '', password: '' })
const regForm = reactive({ username: '', phone: '', password: '' })

function switchTab(t) {
  tab.value = t
  loginErr.value = ''
  regErr.value = ''
}

async function handleLogin() {
  loginErr.value = ''
  if (!loginForm.phone || !loginForm.password) {
    loginErr.value = '请填写手机号和密码'
    return
  }
  loginLoading.value = true
  try {
    await authStore.doLogin({ phone: loginForm.phone, password: loginForm.password })
    router.push('/trade/items')
  } catch (e) {
    loginErr.value = e.message
  } finally {
    loginLoading.value = false
  }
}

async function handleRegister() {
  regErr.value = ''
  if (!regForm.username || !regForm.phone || !regForm.password) {
    regErr.value = '请填写所有字段'
    return
  }
  if (regForm.password.length < 6) {
    regErr.value = '密码至少6位'
    return
  }
  regLoading.value = true
  try {
    await authStore.doRegister(regForm)
    router.push('/trade/items')
  } catch (e) {
    regErr.value = e.message
  } finally {
    regLoading.value = false
  }
}
</script>

<style scoped>
.login-page { display: flex; justify-content: center; padding-top: 40px; }
.login-card { width: 420px; padding: 32px; }
.login-tabs { display: flex; gap: 0; margin-bottom: 28px; border-bottom: 2px solid #f0f2f5; }
.login-tabs button {
  flex: 1; padding: 10px; border: none; background: none; font-size: 16px; cursor: pointer;
  color: var(--text-secondary); border-bottom: 2px solid transparent; margin-bottom: -2px;
  transition: all 0.2s;
}
.login-tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; }
.form-item { margin-bottom: 18px; }
.form-item label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.form-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(64,158,255,0.1); }
.field-error { font-size: 12px; color: var(--color-danger); margin-top: 4px; }
.btn--full { width: 100%; padding: 12px; font-size: 15px; margin-top: 8px; }
.logged-hint { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-secondary); }
</style>
