<template>
  <div class="about-page">
    <div class="card">
      <h2 class="page-title">ℹ️ 关于本项目</h2>

      <section class="about-section">
        <h3>📋 项目说明</h3>
        <p>
          本项目是一个 Vue 3 前端示例项目，使用 Vite 作为构建工具，
          完整展示了现代前端项目的核心配置与开发流程。
        </p>
      </section>

      <section class="about-section">
        <h3>⚙️ 环境要求</h3>
        <ul>
          <li><strong>Node.js</strong> ≥ 16.0（推荐 18+）</li>
          <li><strong>npm</strong> ≥ 7.0</li>
        </ul>
      </section>

      <section class="about-section">
        <h3>🏗️ 项目启动流程</h3>
        <div class="step-list">
          <div class="step">
            <span class="step-num">1</span>
            <div>
              <strong>环境搭建</strong>
              <p>安装 Node.js（nodejs.org），npm 随 Node.js 自动安装。验证：<code>node -v</code>、<code>npm -v</code></p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <div>
              <strong>依赖安装</strong>
              <p>在项目根目录执行 <code>npm install</code>，npm 根据 package.json 安装所有依赖</p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <div>
              <strong>启动开发服务器</strong>
              <p>执行 <code>npm run dev</code>，Vite 启动热更新开发服务器（默认 http://localhost:5173）</p>
            </div>
          </div>
          <div class="step">
            <span class="step-num">4</span>
            <div>
              <strong>生产构建</strong>
              <p>执行 <code>npm run build</code>，Vite 打包优化后的静态文件到 <code>dist/</code> 目录</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h3>📁 项目结构</h3>
        <pre class="tree"><code>qianduan/
├── index.html              # 入口 HTML
├── package.json            # 项目配置与依赖
├── vite.config.js          # Vite 配置（别名、插件）
└── src/
    ├── main.js             # 应用入口
    ├── App.vue             # 根组件
    ├── style.css           # 全局样式
    ├── api/
    │   ├── index.js        # Axios 实例与拦截器
    │   └── user.js         # 用户 API 封装
    ├── router/
    │   └── index.js        # 路由配置（含守卫）
    ├── components/
    │   ├── AppHeader.vue   # 顶部导航栏
    │   └── AppSidebar.vue  # 侧边栏导航
    └── views/
        ├── Home.vue        # 首页
        ├── Dashboard.vue   # 仪表盘
        ├── About.vue       # 关于项目
        ├── NotFound.vue    # 404
        └── users/
            ├── UserList.vue    # 用户列表（父路由）
            ├── UserDetail.vue  # 用户详情（动态路由）
            └── UserProfile.vue # 用户资料（嵌套动态路由）</code></pre>
      </section>
    </div>
  </div>
</template>

<script setup>
// 关于页面 — 纯展示，无数据请求
</script>

<style scoped>
.about-page {
  max-width: 860px;
}

.page-title {
  font-size: 22px;
  margin-bottom: 24px;
}

.about-section {
  margin-bottom: 28px;
}

.about-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.about-section p,
.about-section li {
  font-size: 14px;
  color: var(--text-regular);
  line-height: 1.8;
}

.about-section ul {
  padding-left: 20px;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  display: flex;
  gap: 14px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step strong {
  display: block;
  font-size: 14px;
}

.step p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.step code,
.about-section code {
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.tree {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 20px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
}

.tree code {
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  background: transparent !important;
  color: inherit !important;
}
</style>
