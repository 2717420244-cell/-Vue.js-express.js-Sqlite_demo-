<template>
  <div class="dashboard-page">
    <h2 class="page-title">📊 仪表盘</h2>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="card stat-card">
        <div class="stat-value">10</div>
        <div class="stat-label">用户总数</div>
      </div>
      <div class="card stat-card stat-card--success">
        <div class="stat-value">8</div>
        <div class="stat-label">活跃用户</div>
      </div>
      <div class="card stat-card stat-card--warning">
        <div class="stat-value">3</div>
        <div class="stat-label">待处理任务</div>
      </div>
      <div class="card stat-card stat-card--info">
        <div class="stat-value">99.9%</div>
        <div class="stat-label">系统可用率</div>
      </div>
    </div>

    <!-- 说明信息 -->
    <div class="card">
      <h3 class="card-title">🔐 权限验证说明</h3>
      <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.8;">
        此页面设置了 <code>meta.requiresAuth = true</code>，全局导航守卫会检查
        <code>localStorage</code> 中的 <code>auth_token</code>。<br />
        当前状态：
        <span v-if="hasToken" style="color: var(--color-success);">✅ 已登录（Token 存在）</span>
        <span v-else style="color: var(--color-danger);">❌ 未登录（Token 不存在）— 只打印警告，不阻拦</span>
      </p>
      <button class="btn" style="margin-top: 12px;" @click="toggleToken">
        {{ hasToken ? '模拟退出' : '模拟登录' }}
      </button>
    </div>

    <!-- 路由导航守卫演示 -->
    <div class="card">
      <h3 class="card-title">🛡️ 路由独享守卫</h3>
      <p style="color: var(--text-secondary); font-size: 14px;">
        此路由还配置了 <code>beforeEnter</code> 路由独享守卫，请在浏览器控制台查看输出。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hasToken = ref(!!localStorage.getItem('auth_token'))

function toggleToken() {
  if (hasToken.value) {
    localStorage.removeItem('auth_token')
  } else {
    localStorage.setItem('auth_token', 'demo_token_' + Date.now())
  }
  hasToken.value = !hasToken.value
  location.reload()
}
</script>

<style scoped>
.dashboard-page {
  max-width: 900px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 20px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 28px 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-card--success .stat-value { color: var(--color-success); }
.stat-card--warning .stat-value { color: var(--color-warning); }
.stat-card--info .stat-value { color: var(--color-info); }

.stat-label {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
