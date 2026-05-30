<template>
  <div class="user-detail-page">
    <div class="card">
      <div class="back-link" @click="$router.push('/users')">← 返回用户列表</div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-wrap">
        <span class="spinner"></span> 加载中...
      </div>

      <!-- 用户详情 -->
      <template v-else-if="user">
        <h2 class="detail-title">👤 {{ user.name }}</h2>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">用户名</span>
            <span>@{{ user.username }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">邮箱</span>
            <span>{{ user.email }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">电话</span>
            <span>{{ user.phone }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">网站</span>
            <span>{{ user.website }}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">地址</span>
            <span>
              {{ user.address?.city }}, {{ user.address?.street }}, {{ user.address?.suite }}
              ({{ user.address?.zipcode }})
            </span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">公司</span>
            <span>{{ user.company?.name }} — {{ user.company?.catchPhrase }}</span>
          </div>
        </div>

        <!-- 动态路由参数展示 -->
        <div class="route-info">
          💡 当前路由参数：<code>/users/{{ user.id }}</code>，这是一个动态路由。
        </div>
      </template>

      <!-- 错误 -->
      <div v-else class="error-wrap">❌ 未找到该用户</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 用户详情页 — 动态路由示例
 *
 * URL: /users/:id
 * 通过 defineProps 接收动态路由的参数（props: true）
 */
import { ref, watch } from 'vue'
import { getUserById } from '@/api/user'

// 动态路由参数通过 props 传递（router 中配置 props: true）
const props = defineProps({
  id: { type: String, required: true }
})

const user = ref(null)
const loading = ref(false)

async function loadUser(id) {
  loading.value = true
  try {
    user.value = await getUserById(id)
  } catch (err) {
    console.error('[UserDetail]', err)
    user.value = null
  } finally {
    loading.value = false
  }
}

// 初始加载
loadUser(props.id)

// 当动态路由参数变化时重新加载（在同一页面切换不同用户）
watch(() => props.id, (newId) => {
  loadUser(newId)
})
</script>

<style scoped>
.user-detail-page {
  max-width: 700px;
  margin-top: 20px;
}

.back-link {
  display: inline-block;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
}

.back-link:hover {
  text-decoration: underline;
}

.detail-title {
  font-size: 22px;
  margin-bottom: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
}

.route-info {
  margin-top: 24px;
  padding: 12px 16px;
  background: #ecf5ff;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-primary);
}

.route-info code {
  background: rgba(64,158,255,0.15);
  padding: 2px 6px;
  border-radius: 4px;
}

.loading-wrap,
.error-wrap {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
