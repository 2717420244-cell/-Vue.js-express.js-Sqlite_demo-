<template>
  <div class="profile-page">
    <h2 class="page-title">👤 个人中心</h2>

    <div v-if="!authStore.isLoggedIn" class="state-wrap">
      <p>请先登录</p>
      <button class="btn" @click="$router.push('/trade/login')" style="margin-top:12px;">去登录</button>
    </div>

    <template v-else>
      <!-- 个人信息 -->
      <div class="card profile-card">
        <div class="profile-header">
          <div class="profile-avatar">{{ avatarText }}</div>
          <div>
            <h3>{{ user?.username }}</h3>
            <p class="profile-phone">{{ user?.phone }}</p>
          </div>
        </div>

        <div class="profile-grid">
          <div class="dg-item"><span class="dg-label">UID</span><span>{{ user?.uid }}</span></div>
          <div class="dg-item"><span class="dg-label">真实姓名</span><span>{{ user?.real_name || '未设置' }}</span></div>
          <div class="dg-item"><span class="dg-label">余额</span><span class="balance">¥{{ user?.balance || 0 }}</span></div>
          <div class="dg-item"><span class="dg-label">注册时间</span><span>{{ user?.created_at }}</span></div>
        </div>

        <div class="profile-actions">
          <button class="btn" @click="showEdit = !showEdit">✏️ 编辑资料</button>
          <button class="btn btn--danger" @click="handleLogout">🚪 退出登录</button>
        </div>
      </div>

      <!-- 编辑表单 -->
      <div v-if="showEdit" class="card edit-card">
        <h3>编辑个人资料</h3>
        <div class="form-item">
          <label>用户名</label>
          <input v-model="editForm.username" class="form-input" />
        </div>
        <div class="form-item">
          <label>真实姓名</label>
          <input v-model="editForm.real_name" class="form-input" placeholder="请输入真实姓名" />
        </div>
        <div class="form-item">
          <label>头像链接</label>
          <input v-model="editForm.avatar" class="form-input" placeholder="https://..." />
        </div>
        <span v-if="editErr" class="field-error">{{ editErr }}</span>
        <div class="form-actions">
          <button class="btn btn--cancel" @click="showEdit = false">取消</button>
          <button class="btn" @click="handleUpdate" :disabled="editLoading">保存</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/tradeAuth'
import { updateProfile } from '@/api/trade'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const avatarText = computed(() => user.value?.username?.charAt(0)?.toUpperCase() || '?')

const showEdit = ref(false)
const editErr = ref('')
const editLoading = ref(false)
const editForm = reactive({ username: '', real_name: '', avatar: '' })

// 初始化编辑表单
function initEditForm() {
  editForm.username = user.value?.username || ''
  editForm.real_name = user.value?.real_name || ''
  editForm.avatar = user.value?.avatar || ''
}

async function handleUpdate() {
  editErr.value = ''
  editLoading.value = true
  try {
    await updateProfile({ ...editForm })
    await authStore.fetchProfile()
    alert('更新成功！')
    showEdit.value = false
  } catch (e) {
    editErr.value = e.message
  } finally {
    editLoading.value = false
  }
}

function handleLogout() {
  authStore.doLogout()
  router.push('/trade/login')
}

onMounted(() => {
  initEditForm()
})
</script>

<style scoped>
.profile-page { max-width: 700px; }
.page-title { font-size: 22px; margin-bottom: 20px; }
.profile-card { padding: 28px; }
.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f2f3f5; }
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), #764ba2); color: #fff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.profile-phone { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.dg-item { display: flex; flex-direction: column; gap: 4px; }
.dg-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
.balance { font-weight: 700; color: #f56c6c; }
.profile-actions { display: flex; gap: 10px; padding-top: 16px; border-top: 1px solid #f2f3f5; }
.btn--danger { background: var(--color-danger); }
.btn--danger:hover { background: #f89898; }
.edit-card { padding: 24px; margin-top: 16px; }
.edit-card h3 { margin-bottom: 16px; }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.form-input { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(64,158,255,0.1); }
.form-actions { display: flex; gap: 12px; padding-top: 4px; }
.btn--cancel { background: #f0f2f5; color: var(--text-regular); border-color: var(--border-color); }
.btn--cancel:hover { background: #e5e7eb; }
.field-error { font-size: 12px; color: var(--color-danger); }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
</style>
