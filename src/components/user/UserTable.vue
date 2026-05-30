<template>
  <!--
    用户列表表格组件
    ================
    设计要点：
    1. 通过 props 接收用户数据（单向数据流）
    2. 通过 emit 向父组件发送操作事件（编辑、删除、选中）
    3. v-for 列表渲染 + :key 唯一标识
    4. v-if / v-else 条件渲染（空状态、加载状态）
    5. 使用 UserStatusBadge 子组件（跨层级复用）
  -->
  <div class="user-table-wrap card">
    <!-- ===== 条件渲染：加载态 ===== -->
    <div v-if="loading" class="table-state">
      <span class="spinner"></span>
      <span>正在加载用户数据...</span>
    </div>

    <!-- ===== 条件渲染：空数据态 ===== -->
    <div v-else-if="users.length === 0" class="table-state table-state--empty">
      <span class="empty-icon">📭</span>
      <p class="empty-title">暂无用户数据</p>
      <p class="empty-desc">尝试调整搜索条件，或创建新用户</p>
    </div>

    <!-- ===== 正常渲染：用户列表 ===== -->
    <div v-else class="table-list">
      <!-- v-for 列表渲染，:key 必须唯一 -->
      <div
        v-for="user in users"
        :key="user.id"
        class="table-row"
        @click="goDetail(user.id)"
      >
        <!-- 头像 -->
        <div class="col-avatar">
          <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
        </div>

        <!-- 用户基本信息 — 通过 props 传递到子组件显示 -->
        <div class="col-info">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-meta">@{{ user.username }} · {{ user.email }}</div>
        </div>

        <!-- 公司信息 -->
        <div class="col-company">
          <span class="muted-text">{{ user.company?.name || '-' }}</span>
        </div>

        <!-- 城市 -->
        <div class="col-city">
          <span class="muted-text">{{ user.address?.city || '-' }}</span>
        </div>

        <!-- 状态徽章：子组件复用 -->
        <div class="col-status">
          <UserStatusBadge :status="getUserStatus(user.id)" />
        </div>

        <!-- 操作按钮 — 通过 emit 向父组件传递事件 -->
        <div class="col-actions" @click.stop>
          <button
            class="action-btn action-btn--edit"
            title="编辑"
            @click="$emit('edit', user)"
          >
            ✏️
          </button>
          <button
            class="action-btn"
            title="查看详情"
            @click="goDetail(user.id)"
          >
            👁️
          </button>
          <button
            class="action-btn action-btn--del"
            title="删除"
            @click="$emit('delete', user)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 底部分页信息 -->
    <div v-if="!loading && users.length > 0" class="table-footer">
      <span class="footer-text">
        共 <strong>{{ users.length }}</strong> 条记录
      </span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import UserStatusBadge from './UserStatusBadge.vue'

// ============================================
// Props — 父组件传递数据（单向数据流）
// ============================================
defineProps({
  users: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// ============================================
// Emits — 子组件向父组件通信
// ============================================
defineEmits(['edit', 'delete'])

const router = useRouter()

// 跳转到用户详情（动态路由）
function goDetail(id) {
  router.push({ name: 'UserDetail', params: { id } })
}

// 为每个用户分配伪状态（演示用）
function getUserStatus(id) {
  const statuses = ['active', 'active', 'active', 'inactive', 'pending']
  return statuses[id % statuses.length]
}
</script>

<style scoped>
.user-table-wrap {
  padding: 0;
  overflow: hidden;
}

.table-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.table-state--empty {
  flex-direction: column;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-regular);
}

.empty-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 表格行 */
.table-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
  transition: background 0.15s;
}

.table-row:hover {
  background: #fafbfc;
}

.table-row:last-child {
  border-bottom: none;
}

.col-avatar {
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #764ba2);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-info {
  flex: 2;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-company,
.col-city {
  flex: 1;
  min-width: 0;
  font-size: 13px;
}

.muted-text {
  color: var(--text-secondary);
  font-size: 13px;
}

.col-status {
  flex-shrink: 0;
}

.col-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  padding: 4px 6px;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.15s;
}

.action-btn:hover {
  opacity: 1;
  background: #f0f2f5;
}

.action-btn--edit:hover {
  background: #ecf5ff;
}

.action-btn--del:hover {
  background: #fef0f0;
}

.table-footer {
  padding: 12px 20px;
  border-top: 1px solid #f2f3f5;
  background: #fafbfc;
}

.footer-text {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
