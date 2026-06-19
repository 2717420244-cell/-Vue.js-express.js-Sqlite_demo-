<template>
  <div class="admin-users-page">
    <div class="page-header">
      <h2 class="page-title">👥 用户管理</h2>
      <span class="hierarchy-hint">
        {{ authStore.isSuperAdmin ? '⭐ 超级管理员 — 可管理所有用户' : '👑 管理员 — 可管理普通用户' }}
      </span>
    </div>

    <div class="search-bar">
      <input v-model="keyword" type="text" placeholder="搜索用户名或手机号..." class="search-input" @keyup.enter="search" />
      <button class="btn" @click="search">搜索</button>
    </div>

    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <div v-else class="card table-wrap">
      <table class="user-table">
        <thead>
          <tr>
            <th>UID</th>
            <th>用户名</th>
            <th>手机号</th>
            <th>角色</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.uid" :class="{ 'row--self': u.uid === authStore.uid }">
            <td class="col-id">{{ u.uid }}</td>
            <td>
              <strong>{{ u.username }}</strong>
              <span v-if="u.real_name" class="real-name">({{ u.real_name }})</span>
            </td>
            <td class="col-phone">{{ u.phone }}</td>
            <td>
              <span class="role-badge" :class="'role--' + u.role">
                {{ roleLabel(u.role) }}
              </span>
            </td>
            <td class="col-time">{{ formatTime(u.created_at) }}</td>
            <td class="col-actions">
              <!-- 超级管理员可以看到所有操作按钮 -->
              <template v-if="authStore.isSuperAdmin">
                <!-- 自己是超管：不可操作 -->
                <span v-if="u.uid === authStore.uid" class="self-tag">当前用户</span>
                <!-- 另一个超管：不可操作 -->
                <span v-else-if="u.role === 'super_admin'" class="noop-tag">受保护</span>
                <!-- 其他人：下拉选择角色 + 删除 -->
                <template v-else>
                  <select
                    class="role-select"
                    :value="u.role"
                    @change="changeRole(u, $event.target.value)"
                  >
                    <option value="user">👤 普通用户</option>
                    <option value="admin">👑 管理员</option>
                  </select>
                  <button class="action-btn btn--del" @click="handleDelete(u)">删除</button>
                </template>
              </template>

              <!-- 普通管理员 -->
              <template v-else-if="authStore.isAdmin">
                <span v-if="u.uid === authStore.uid" class="self-tag">当前用户</span>
                <!-- 超级管理员：不可操作 -->
                <span v-else-if="u.role === 'super_admin'" class="noop-tag">受保护</span>
                <!-- 其他管理员：不可操作 -->
                <span v-else-if="u.role === 'admin'" class="noop-tag">无权限</span>
                <!-- 普通用户：可管理 -->
                <button v-else class="action-btn btn--del" @click="handleDelete(u)">删除</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="table-empty">暂无用户</div>
      <div v-else class="table-footer">共 <strong>{{ total }}</strong> 个用户</div>
    </div>

    <div v-if="total > limit" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total / limit) }}</span>
      <button :disabled="page >= Math.ceil(total / limit)" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/tradeAuth'
import { getAdminUsers, setUserRole, deleteAdminUser } from '@/api/trade'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const limit = 15

function roleLabel(r) {
  if (r === 'super_admin') return '⭐ 超级管理员'
  if (r === 'admin') return '👑 管理员'
  return '👤 普通用户'
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getAdminUsers({ page: page.value, limit, keyword: keyword.value })
    users.value = res.data?.items || []
    total.value = res.data?.pagination?.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function search() { page.value = 1; fetchUsers() }
function changePage(p) { page.value = p; fetchUsers() }

async function changeRole(user, newRole) {
  if (user.role === newRole) return
  const labels = { user: '普通用户', admin: '管理员' }
  if (!confirm(`确定将「${user.username}」设为${labels[newRole]}吗？`)) return
  try {
    await setUserRole(user.uid, newRole)
    alert(`已将「${user.username}」设为${labels[newRole]}`)
    fetchUsers()
  } catch (e) { alert(e.message) }
}

async function handleDelete(user) {
  if (!confirm(`确定删除用户「${user.username}」吗？此操作不可撤销。`)) return
  try {
    await deleteAdminUser(user.uid)
    alert('已删除')
    fetchUsers()
  } catch (e) { alert(e.message) }
}

function formatTime(t) {
  return t ? String(t).substring(0, 19) : ''
}

onMounted(() => fetchUsers())
</script>

<style scoped>
.admin-users-page { max-width: 1000px; }
.page-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.page-title { font-size: 22px; }
.hierarchy-hint { font-size: 13px; color: var(--text-secondary); }
.search-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-input { flex: 1; padding: 9px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
.table-wrap { padding: 0; overflow: hidden; }
.user-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.user-table th { background: #fafbfc; padding: 12px 16px; text-align: left; font-size: 12px; color: var(--text-secondary); font-weight: 600; border-bottom: 1px solid var(--border-color); }
.user-table td { padding: 12px 16px; border-bottom: 1px solid #f2f3f5; }
.user-table tbody tr:hover { background: #f9fafb; }
.row--self { background: #f0fdf4; }
.real-name { font-size: 12px; color: var(--text-secondary); margin-left: 6px; }
.role-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.role--super_admin { background: #fee2e2; color: #dc2626; }
.role--admin { background: #fef3c7; color: #d97706; }
.role--user { background: #f3f4f6; color: #6b7280; }
.col-id { width: 50px; color: var(--text-secondary); }
.col-phone { color: var(--text-secondary); }
.col-time { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }
.col-actions { display: flex; gap: 6px; white-space: nowrap; }
.action-btn { padding: 4px 12px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; cursor: pointer; background: #fff; transition: all 0.15s; }
.action-btn:hover:not(:disabled) { background: #f0f2f5; }
.action-btn:disabled { opacity: 0.35; cursor: default; }
.btn--upgrade { color: #d97706; border-color: #fcd34d; }
.btn--upgrade:hover:not(:disabled) { background: #fef3c7; }
.btn--downgrade { color: #6b7280; }
.btn--del { color: #ef4444; border-color: #fca5a5; }
.btn--del:hover:not(:disabled) { background: #fef2f2; }
.role-select { padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 12px; background: #fff; cursor: pointer; outline: none; }
.role-select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(22,163,74,0.1); }
.self-tag { font-size: 12px; color: var(--color-primary); padding: 4px 8px; }
.noop-tag { font-size: 12px; color: var(--text-placeholder); padding: 4px 8px; }
.table-empty { text-align: center; padding: 48px; color: var(--text-secondary); }
.table-footer { padding: 10px 16px; border-top: 1px solid #f2f3f5; font-size: 12px; color: var(--text-secondary); background: #fafbfc; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
.pagination button { padding: 6px 16px; border: 1px solid var(--border-color); border-radius: 6px; background: #fff; cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: default; }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
