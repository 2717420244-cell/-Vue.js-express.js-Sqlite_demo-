<template>
  <div class="home-page">
    <div class="hero-banner">
      <h1>🚀 Vue 3 前端项目示例</h1>
      <p class="hero-desc">
        本项目演示了 Vue 3 + Vite 项目搭建、Axios 网络配置以及 Vue Router 路由系统的完整流程。
      </p>
      <div class="tech-stack">
        <span class="tag">Vue 3.4</span>
        <span class="tag">Vite 5</span>
        <span class="tag">Vue Router 4</span>
        <span class="tag">Axios</span>
        <span class="tag">Pinia</span>
      </div>
    </div>

    <div class="feature-grid">
      <div class="card feature-card">
        <h3>📡 Axios 网络配置</h3>
        <ul>
          <li>baseURL 统一配置</li>
          <li>请求拦截器（自动添加 Token）</li>
          <li>响应拦截器（统一错误处理）</li>
          <li>封装通用请求方法</li>
        </ul>
      </div>

      <div class="card feature-card">
        <h3>🗺️ Vue Router 路由</h3>
        <ul>
          <li>嵌套路由（Users → UserDetail）</li>
          <li>动态路由（/users/:id）</li>
          <li>路由懒加载（动态 import）</li>
          <li>全局导航守卫 & 路由独享守卫</li>
        </ul>
      </div>

      <div class="card feature-card">
        <h3>📦 项目工程化</h3>
        <ul>
          <li>Vite 极速开发服务器</li>
          <li>路径别名 @ → src/</li>
          <li>CSS 变量主题系统</li>
          <li>组件化开发模式</li>
        </ul>
      </div>
    </div>

    <div class="card quick-start">
      <h3 class="card-title">📋 快速开始</h3>
      <pre class="code-block"><code># 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 构建生产版本
npm run build</code></pre>
    </div>
  </div>
</template>

<script setup>
// 首页 — 无需数据请求
</script>

<style scoped>
.home-page {
  max-width: 900px;
}

.hero-banner {
  text-align: center;
  padding: 40px 0 32px;
}

.hero-banner h1 {
  font-size: 32px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  color: var(--text-secondary);
  font-size: 15px;
  max-width: 560px;
  margin: 0 auto 20px;
}

.tech-stack {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  background: #ecf5ff;
  color: var(--color-primary);
  font-weight: 500;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 16px;
  margin-bottom: 12px;
}

.feature-card ul {
  padding-left: 18px;
  color: var(--text-regular);
  font-size: 14px;
}

.feature-card li {
  margin-bottom: 6px;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Cascadia Code', 'Fira Code', monospace;
}
</style>
