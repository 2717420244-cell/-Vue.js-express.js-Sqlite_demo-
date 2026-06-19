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
    </nav>

    <div class="sidebar-footer">
      <span class="footer-text">账号交易系统 v1.0</span>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/trade/items',   icon: '🛒', label: '账号商城' },
  { path: '/trade/orders',  icon: '📦', label: '我的订单' },
  { path: '/trade/publish', icon: '➕', label: '发布账号' },
  { path: '/trade/profile', icon: '👤', label: '个人中心' },
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

.sidebar-footer {
  padding: 14px;
  border-top: 1px solid #f0f2f5;
}

.footer-text {
  font-size: 11px;
  color: var(--text-placeholder);
}
</style>
