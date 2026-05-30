<template>
  <header class="app-header">
    <div class="header-left">
      <span class="logo">📦 Vue Demo</span>
      <span class="subtitle">Axios + Router 示例项目</span>
    </div>
    <nav class="header-nav">
      <span class="nav-hint">模拟已登录用户</span>
    </nav>
  </header>
</template>

<script setup>
// 顶部导航栏 — 纯展示
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 13px;
  opacity: 0.7;
}

.nav-hint {
  font-size: 13px;
  opacity: 0.6;
  padding: 4px 12px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
}
</style>
