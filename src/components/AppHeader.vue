<template>
  <header class="app-header">
    <router-link to="/trade/items" class="logo-link">
      <span class="logo">🎮 账号交易平台</span>
    </router-link>

    <div class="header-right">
      <!-- 已登录：显示用户名 -->
      <template v-if="authStore.isLoggedIn">
        <span class="user-name">{{ authStore.username }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </template>
      <!-- 未登录：去登录 -->
      <router-link v-else to="/trade/login" class="login-link">登录</router-link>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/tradeAuth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.doLogout()
  router.push('/trade/items')
}
</script>

<style scoped>
.app-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #1a1a2e;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-link {
  text-decoration: none;
  color: #fff;
}

.logo {
  font-size: 18px;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-name {
  font-size: 13px;
  opacity: 0.85;
}

.logout-btn {
  background: rgba(255,255,255,0.12);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.22);
}

.login-link {
  font-size: 13px;
  color: #fff;
  text-decoration: none;
  padding: 4px 16px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  transition: background 0.2s;
}

.login-link:hover {
  background: rgba(255,255,255,0.12);
}
</style>
