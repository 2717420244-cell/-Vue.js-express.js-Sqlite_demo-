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
      <div class="status-dot"></div>
      <span>系统运行中</span>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { path: '/',          icon: '🏠', label: '首页' },
  { path: '/dashboard', icon: '📊', label: '仪表盘' },
  { path: '/users',     icon: '👥', label: '用户管理' },
  { path: '/about',     icon: 'ℹ️', label: '关于项目' },
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
  width: var(--sidebar-width);
  background: #fff;
  border-right: 1px solid var(--border-color);
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
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: var(--text-regular);
  user-select: none;
}

.nav-item:hover {
  background: #ecf5ff;
  color: var(--color-primary);
}

.nav-item.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 12px;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
