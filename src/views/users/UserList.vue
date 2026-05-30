<template>
  <div class="user-list-page">
    <div class="page-header">
      <h2 class="page-title">👥 用户管理</h2>
      <button class="btn" @click="fetchUsers" :disabled="loading">
        {{ loading ? '加载中...' : '刷新列表' }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="card loading-wrap">
      <span class="spinner"></span>
      <span>正在获取用户数据...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="card error-wrap">
      <span>❌ {{ error }}</span>
      <button class="btn btn--sm" @click="fetchUsers">重试</button>
    </div>

    <!-- 用户列表 -->
    <div v-else class="user-grid">
      <div
        v-for="user in users"
        :key="user.id"
        class="card user-card"
        @click="goDetail(user.id)"
      >
        <div class="user-avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <h4>{{ user.name }}</h4>
          <p>@{{ user.username }}</p>
          <p class="user-email">{{ user.email }}</p>
          <p class="user-company">{{ user.company?.name }}</p>
        </div>
        <button
          class="btn btn--sm"
          @click.stop="goProfile(user.id)"
        >
          查看资料
        </button>
      </div>
    </div>

    <!-- 子路由出口（嵌套路由） -->
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
/**
 * 用户列表页面
 *
 * 功能：
 * 1. 通过 Axios 调用 getUsers() 获取数据
 * 2. 展示 loading / error / data 三种状态
 * 3. 点击卡片进入动态路由 /users/:id
 * 4. 包含嵌套路由出口 <router-view>
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUsers } from '@/api/user'

const router = useRouter()
const users = ref([])
const loading = ref(false)
const error = ref('')

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    users.value = await getUsers()
    console.log('[UserList] 获取到用户数据:', users.value.length, '条')
  } catch (err) {
    error.value = err.message || '获取用户列表失败'
    console.error('[UserList]', err)
  } finally {
    loading.value = false
  }
}

function goDetail(id) {
  router.push({ name: 'UserDetail', params: { id } })
}

function goProfile(id) {
  router.push({ name: 'UserProfile', params: { id } })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list-page {
  max-width: 900px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #67c23a);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  font-size: 15px;
  margin-bottom: 2px;
}

.user-info p {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: var(--color-primary) !important;
}

.loading-wrap,
.error-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
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
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
