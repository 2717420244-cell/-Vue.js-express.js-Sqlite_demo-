<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <div
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item) }"
        @click="navigate(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </div>

      <!-- 管理员分区 -->
      <template v-if="authStore.isAdmin">
        <div class="nav-divider"></div>
        <div class="nav-section-label">⚙️ 管理</div>
        <div
          v-for="item in adminItems"
          :key="item.path"
          class="nav-item nav-item--admin"
          :class="{ active: isActive(item) }"
          @click="navigate(item.path)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <span v-if="authStore.isSuperAdmin" class="footer-text">⭐ 超级管理员</span>
      <span v-else-if="authStore.isAdmin" class="footer-text">👑 管理员</span>
      <span v-else class="footer-text">{{ authStore.username || '未登录' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/tradeAuth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { path: '/trade/items',   icon: '🛒', label: '账号商城' },
  { path: '/trade/orders',  icon: '📦', label: '我的订单' },
  { path: '/trade/publish', icon: '➕', label: '发布账号' },
  { path: '/trade/profile', icon: '👤', label: '个人中心' },
]

const adminItems = [
  { path: '/trade/admin/audits', icon: '📋', label: '商品审核' },
  { path: '/trade/admin/users',  icon: '👥', label: '用户管理' },
]

function isActive(item) {
  return route.path === item.path || route.path.startsWith(item.path + '/')
}

function navigate(path) {
  router.push(path)
}
</script>

<style scoped>
.app-sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 12px;
  flex-shrink: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s;
  font-size: 14px;
  color: var(--text-regular);
  user-select: none;
}

.nav-item:hover {
  background: #f0fdf4;
  color: #16a34a;
}

.nav-item.active {
  background: #16a34a;
  color: #fff;
  font-weight: 600;
}

.nav-icon {
  font-size: 17px;
  width: 22px;
  text-align: center;
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 12px;
}

.nav-section-label {
  font-size: 11px;
  color: var(--text-placeholder);
  padding: 4px 14px 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.nav-item--admin.active {
  background: #dc2626;
}

.sidebar-footer {
  padding: 14px;
  border-top: 1px solid #f0f2f5;
}

.footer-text {
  font-size: 11px;
  color: var(--text-placeholder);
}
</style>
