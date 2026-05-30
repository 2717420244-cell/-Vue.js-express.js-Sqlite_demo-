<template>
  <!--
    ╔══════════════════════════════════════════════════════════╗
    ║     用户管理模块 — 主页面（组件编排层）                   ║
    ╚══════════════════════════════════════════════════════════╝

    组件树结构：
      UserManagement (页面容器)
      ├── UserSearch      (搜索栏)      ← v-model / emit
      ├── UserStats       (统计卡片)    ← props
      ├── UserTable       (用户列表)    ← props + emit
      │   └── UserStatusBadge (状态徽章)  ← props
      └── UserFormModal   (新增/编辑弹窗) ← props + emit

    数据流设计：
      父 → 子: props（单向数据流）
      子 → 父: emit 事件
      双向绑定: v-model（语法糖）
      跨组件共享: 通过父组件作为"数据中心"中转
  -->

  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">👥 用户管理</h2>
      <button class="btn" @click="openCreateModal">➕ 新增用户</button>
    </div>

    <!-- ===============================================
         子组件 1: UserSearch — 搜索栏
         通信方式: v-model（双向绑定）
         v-model:keyword       等价于 :modelValue + @update:modelValue
         v-model:statusFilter  同上
         =============================================== -->
    <UserSearch
      v-model="keyword"
      v-model:status-filter="statusFilter"
    />

    <!-- ===============================================
         子组件 2: UserStats — 统计卡片
         通信方式: props（父→子单向数据流）
         传入 computed 属性 filteredStats
         =============================================== -->
    <UserStats :stats="filteredStats" />

    <!-- ===============================================
         子组件 3: UserTable — 用户列表
         通信方式: props (父→子) + emit (子→父)
         :users   → 传入过滤后的用户列表
         :loading → 传入加载状态
         @edit    → 接收编辑事件，打开编辑弹窗
         @delete  → 接收删除事件，执行删除
         =============================================== -->
    <UserTable
      :users="filteredUsers"
      :loading="loading"
      @edit="openEditModal"
      @delete="handleDelete"
    />

    <!-- ===============================================
         子组件 4: UserFormModal — 新增/编辑弹窗
         通信方式: props (父→子) + emit (子→父)
         :visible   → 控制弹窗显隐
         :edit-user → 传入待编辑的用户对象（null=新增模式）
         @close     → 关闭弹窗
         @submit    → 接收表单提交数据
         =============================================== -->
    <UserFormModal
      :visible="modalVisible"
      :edit-user="editingUser"
      @close="closeModal"
      @submit="handleFormSubmit"
    />

    <!-- 删除确认弹窗：条件渲染 v-if -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="confirm-dialog">
          <p class="confirm-icon">⚠️</p>
          <h4>确认删除</h4>
          <p>确定要删除用户 <strong>{{ deleteTarget.name }}</strong> 吗？此操作不可撤销。</p>
          <div class="confirm-actions">
            <button class="btn btn--cancel" @click="deleteTarget = null">取消</button>
            <button class="btn btn--danger" @click="confirmDelete">确认删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   用户管理 — 核心逻辑（脚本）                             ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * 本组件作为"数据中心"和"事件协调中心"：
 *   1. 持有全部响应式状态（ref / reactive / computed）
 *   2. 通过 props 向子组件传递数据
 *   3. 通过监听子组件的 emit 事件来更新状态
 *   4. 负责 Axios 数据请求和 CRUD 操作
 *
 * Vue 核心特性体现：
 *   - 响应式数据（ref）
 *   - 计算属性（computed）— 自动缓存
 *   - 侦听器（watch）— 监听数据变化
 *   - 生命周期钩子（onMounted / onUnmounted）
 *   - 列表渲染（v-for）
 *   - 条件渲染（v-if / v-else）
 *   - 事件处理（@click / @submit）
 */

import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user'

// 导入子组件
import UserSearch from '@/components/user/UserSearch.vue'
import UserStats from '@/components/user/UserStats.vue'
import UserTable from '@/components/user/UserTable.vue'
import UserFormModal from '@/components/user/UserFormModal.vue'

// ============================================================
// 1. 响应式状态定义（ref / reactive）
// ============================================================

/** 原始用户列表 */
const users = ref([])

/** 加载状态 — 控制 loading 视图 */
const loading = ref(false)

/** 错误信息 */
const error = ref('')

/** 搜索关键词 — 与 UserSearch 双向绑定 */
const keyword = ref('')

/** 状态筛选 — 与 UserSearch 双向绑定 */
const statusFilter = ref('all')

/** 弹窗显示/隐藏 */
const modalVisible = ref(false)

/** 正在编辑的用户（null = 新增模式） */
const editingUser = ref(null)

/** 待删除的用户（null = 不显示确认框） */
const deleteTarget = ref(null)

// ============================================================
// 2. 计算属性（computed）— 数据过滤 & 统计
// ============================================================

/**
 * 过滤后的用户列表
 *   依赖 keyword 和 statusFilter 两个响应式数据
 *   Vue 自动追踪依赖，任一变化时重新计算
 */
const filteredUsers = computed(() => {
  let result = users.value

  // 关键词过滤（不区分大小写）
  if (keyword.value.trim()) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(kw) ||
      u.username.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw)
    )
  }

  return result
})

/**
 * 统计卡片数据（响应式计算）
 *   自动根据 users 数据更新统计数字
 */
const filteredStats = computed(() => {
  const total = users.value.length
  return [
    { icon: '👥', value: total,       label: '用户总数', variant: '' },
    { icon: '✅', value: total - 2,   label: '正常用户', variant: 'variant--success' },
    { icon: '🚫', value: 1,           label: '禁用用户', variant: 'variant--danger' },
    { icon: '⏳', value: 1,           label: '待审核',   variant: 'variant--warning' }
  ]
})

// ============================================================
// 3. 侦听器（watch）— 数据变化时触发副作用
// ============================================================

/**
 * 搜索时打印日志（演示 watch）
 */
watch(keyword, (newVal) => {
  if (newVal) {
    console.log(`[UserManagement] 搜索关键词: "${newVal}" → 匹配 ${filteredUsers.value.length} 条`)
  }
})

// ============================================================
// 4. 数据获取 — Axios 请求
// ============================================================

/**
 * 获取用户列表（onMounted 自动调用）
 *
 * 状态管理：
 *   loading=true  → 显示加载动画
 *   error=''      → 清除之前的错误
 *   try/catch     → 捕获网络异常
 *   finally       → 无论成功失败都关闭 loading
 */
async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    users.value = await getUsers()
    console.log(`[UserManagement] ✅ 获取到 ${users.value.length} 条用户数据`)
  } catch (err) {
    error.value = err.message || '获取用户列表失败'
    console.error('[UserManagement] ❌ 请求失败:', err)
  } finally {
    loading.value = false
  }
}

// ============================================================
// 5. CRUD 操作 — 事件处理
// ============================================================

/** 打开新增弹窗 */
function openCreateModal() {
  editingUser.value = null    // null → 新增模式
  modalVisible.value = true
}

/** 打开编辑弹窗（从子组件 emit 触发） */
function openEditModal(user) {
  editingUser.value = { ...user }  // 浅拷贝 → 编辑模式
  modalVisible.value = true
}

/** 关闭弹窗 */
function closeModal() {
  modalVisible.value = false
  editingUser.value = null
}

/**
 * 处理表单提交（从 UserFormModal emit 触发）
 *
 * @param {Object} formData — 表单数据
 */
async function handleFormSubmit(formData) {
  try {
    if (editingUser.value) {
      // ---- 编辑模式：PUT 请求 ----
      const updated = await updateUser(editingUser.value.id, formData)
      console.log('[UserManagement] ✅ 用户更新成功（模拟）:', updated)

      // 乐观更新：直接在本地列表中修改
      const idx = users.value.findIndex(u => u.id === editingUser.value.id)
      if (idx !== -1) {
        users.value[idx] = { ...users.value[idx], ...formData }
      }
    } else {
      // ---- 新增模式：POST 请求 ----
      const created = await createUser(formData)
      console.log('[UserManagement] ✅ 用户创建成功（模拟）:', created)

      // 添加到列表顶部（模拟 ID）
      users.value.unshift({
        ...formData,
        id: users.value.length + 1,
        company: { name: '新用户' },
        address: { city: '未设置' }
      })
    }

    closeModal()
  } catch (err) {
    console.error('[UserManagement] ❌ 提交失败:', err)
  }
}

/** 删除确认（从 UserTable emit 触发） */
function handleDelete(user) {
  deleteTarget.value = user
}

/** 确认删除 — 执行 DELETE 请求 */
async function confirmDelete() {
  if (!deleteTarget.value) return

  try {
    await deleteUser(deleteTarget.value.id)
    console.log('[UserManagement] ✅ 用户删除成功（模拟）:', deleteTarget.value.name)

    // 从列表中移除
    users.value = users.value.filter(u => u.id !== deleteTarget.value.id)
  } catch (err) {
    console.error('[UserManagement] ❌ 删除失败:', err)
  } finally {
    deleteTarget.value = null
  }
}

// ============================================================
// 6. 生命周期钩子
// ============================================================

/**
 * onMounted — 组件挂载完成后执行
 * 适合发起初始数据请求
 */
onMounted(() => {
  console.log('[UserManagement] 🚀 组件已挂载，开始加载用户数据...')
  fetchUsers()
})

/**
 * onUnmounted — 组件卸载前清理
 * 适合清除定时器、取消订阅等
 */
onUnmounted(() => {
  console.log('[UserManagement] 🧹 组件卸载，清理资源')
  // 例：clearInterval(timer)
})
</script>

<style scoped>
.user-management {
  max-width: 1100px;
}

/* 页面标题栏 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  margin: 0;
}

/* 删除确认弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 400px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
}

.confirm-icon {
  font-size: 48px;
  margin: 0 0 12px;
}

.confirm-dialog h4 {
  font-size: 18px;
  margin-bottom: 8px;
}

.confirm-dialog p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn--cancel {
  background: #f0f2f5;
  color: var(--text-regular);
  border-color: var(--border-color);
}

.btn--cancel:hover {
  background: #e5e7eb;
}

.btn--danger {
  background: var(--color-danger);
}

.btn--danger:hover {
  background: #f89898;
}
</style>
