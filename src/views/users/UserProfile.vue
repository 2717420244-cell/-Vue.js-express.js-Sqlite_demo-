<template>
  <div class="user-profile-page">
    <div class="card">
      <div class="back-link" @click="$router.push('/users')">← 返回用户列表</div>

      <div v-if="loading" class="loading-wrap">
        <span class="spinner"></span> 加载用户资料...
      </div>

      <template v-else-if="user">
        <div class="profile-header">
          <div class="profile-avatar">{{ user.name.charAt(0) }}</div>
          <div>
            <h2>{{ user.name }}</h2>
            <p class="profile-role">{{ user.company?.bs || 'Software Developer' }}</p>
          </div>
        </div>

        <h3 class="section-title">📋 详细资料</h3>
        <div class="profile-details">
          <div class="pd-item">
            <span>🏢</span>
            <div>
              <strong>公司</strong>
              <p>{{ user.company?.name }}</p>
              <p class="muted">{{ user.company?.catchPhrase }}</p>
            </div>
          </div>
          <div class="pd-item">
            <span>📍</span>
            <div>
              <strong>地址</strong>
              <p>{{ user.address?.city }}, {{ user.address?.street }}</p>
            </div>
          </div>
          <div class="pd-item">
            <span>📧</span>
            <div>
              <strong>联系方式</strong>
              <p>{{ user.email }}</p>
              <p class="muted">{{ user.phone }}</p>
            </div>
          </div>
          <div class="pd-item">
            <span>🌐</span>
            <div>
              <strong>网站</strong>
              <p>{{ user.website }}</p>
            </div>
          </div>
        </div>

        <!-- 嵌套动态路由说明 -->
        <div class="route-info">
          💡 这是嵌套动态路由：<code>/users/{{ user.id }}/profile</code>
        </div>
      </template>

      <div v-else class="error-wrap">❌ 未找到该用户</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 用户资料页 — 嵌套动态路由
 *
 * URL: /users/:id/profile
 * 这是 /users/:id 的子路由，展示更详细的用户资料
 */
import { ref, watch } from 'vue'
import { getUserById } from '@/api/user'

const props = defineProps({
  id: { type: String, required: true }
})

const user = ref(null)
const loading = ref(false)

async function loadProfile(id) {
  loading.value = true
  try {
    user.value = await getUserById(id)
  } catch (err) {
    console.error('[UserProfile]', err)
    user.value = null
  } finally {
    loading.value = false
  }
}

loadProfile(props.id)
watch(() => props.id, (newId) => loadProfile(newId))
</script>

<style scoped>
.user-profile-page {
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

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #764ba2);
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-role {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
}

.section-title {
  font-size: 16px;
  margin-bottom: 16px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pd-item {
  display: flex;
  gap: 14px;
  font-size: 14px;
}

.pd-item strong {
  display: block;
  margin-bottom: 2px;
}

.pd-item .muted {
  color: var(--text-secondary);
  font-size: 13px;
}

.route-info {
  margin-top: 24px;
  padding: 12px 16px;
  background: #f0f9eb;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-success);
}

.route-info code {
  background: rgba(103,194,58,0.15);
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
