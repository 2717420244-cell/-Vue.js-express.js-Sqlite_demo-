<template>
  <div class="not-found-page">
    <div class="card not-found-card">
      <div class="nf-code">404</div>
      <h2>页面未找到</h2>
      <p>你访问的路径 <code>{{ $route.fullPath }}</code> 不存在。</p>
      <button class="btn" @click="$router.push('/')">🏠 返回首页</button>
    </div>
  </div>
</template>

<script setup>
// 404 页面 — 通配符路由
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.not-found-card {
  text-align: center;
  padding: 60px 80px;
}

.nf-code {
  font-size: 96px;
  font-weight: 800;
  color: var(--border-color);
  line-height: 1;
  margin-bottom: 12px;
}

.not-found-card h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.not-found-card p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.not-found-card code {
  background: #f0f2f5;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
