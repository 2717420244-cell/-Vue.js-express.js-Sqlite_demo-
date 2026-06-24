<template>
  <div class="profile-page">
    <h2 class="page-title">👤 个人中心</h2>

    <div v-if="!authStore.isLoggedIn" class="state-wrap">
      <p>请先登录</p>
      <button class="btn" @click="$router.push('/trade/login')" style="margin-top:12px;">去登录</button>
    </div>

    <template v-else>
      <!-- 钱包卡片 -->
      <div class="wallet-card card">
        <div class="wallet-header">
          <h3>💰 我的钱包</h3>
          <button class="btn btn--sm" @click="showRecharge = !showRecharge">{{ showRecharge ? '取消' : '充值' }}</button>
        </div>

        <div class="wallet-row">
          <div class="wallet-item wallet-item--single">
            <span class="wl-label">余额</span>
            <span class="wl-value">¥{{ wallet.balance }}</span>
          </div>
        </div>

        <!-- 充值 -->
        <div v-if="showRecharge" class="recharge-bar">
          <input v-model.number="rechargeAmount" type="number" placeholder="输入充值金额" min="1" max="10000" class="recharge-input" />
          <button class="btn" @click="doRecharge" :disabled="recharging">{{ recharging ? '充值中...' : '确认充值' }}</button>
        </div>
      </div>

      <!-- 交易记录 -->
      <div class="card tx-card">
        <h3>📋 交易记录</h3>
        <div v-if="txLoading" class="state-wrap"><span class="spinner"></span> 加载中...</div>
        <div v-else-if="transactions.length === 0" class="tx-empty">暂无交易记录</div>
        <div v-else class="tx-list">
          <div v-for="tx in transactions" :key="tx.tx_id" class="tx-item">
            <div class="tx-left">
              <span class="tx-type" :class="'tx--' + tx.type">{{ txLabel(tx) }}</span>
              <span class="tx-remark">{{ tx.remark }}</span>
            </div>
            <div class="tx-right">
              <span :class="tx.amount >= 0 ? 'tx-plus' : 'tx-minus'">
                {{ tx.amount >= 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}
              </span>
              <span class="tx-time">{{ formatTime(tx.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

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
          <div class="dg-item"><span class="dg-label">角色</span><span>{{ roleLabel }}</span></div>
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
        <div class="form-item"><label>用户名</label><input v-model="editForm.username" class="form-input" /></div>
        <div class="form-item"><label>真实姓名</label><input v-model="editForm.real_name" class="form-input" placeholder="请输入真实姓名" /></div>
        <div class="form-item"><label>头像链接</label><input v-model="editForm.avatar" class="form-input" placeholder="https://..." /></div>
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
import { updateProfile, getBalance, recharge, getWalletTransactions } from '@/api/trade'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const avatarText = computed(() => user.value?.username?.charAt(0)?.toUpperCase() || '?')
const roleLabel = computed(() => {
  if (authStore.isSuperAdmin) return '⭐ 超级管理员'
  if (authStore.isAdmin) return '👑 管理员'
  return '👤 普通用户'
})

// 钱包
const wallet = reactive({ balance: 0 })
const showRecharge = ref(false)
const rechargeAmount = ref(100)
const recharging = ref(false)

async function loadBalance() {
  try {
    const res = await getBalance()
    Object.assign(wallet, res.data)
  } catch (e) { /* ignore */ }
}

async function doRecharge() {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) return alert('请输入有效金额')
  recharging.value = true
  try {
    const res = await recharge(rechargeAmount.value)
    wallet.balance = res.data.balance
    alert(res.message)
    showRecharge.value = false
    loadTransactions()
  } catch (e) { alert(e.message) }
  finally { recharging.value = false }
}

// 交易记录
const transactions = ref([])
const txLoading = ref(false)

async function loadTransactions() {
  txLoading.value = true
  try {
    const res = await getWalletTransactions({ limit: 20 })
    transactions.value = res.data?.items || []
  } catch (e) { /* ignore */ }
  finally { txLoading.value = false }
}

const txTypeMap = { recharge: '💳 充值', pay: '💸 支付', income: '💰 收入', refund: '↩️ 退款' }
function txLabel(tx) { return txTypeMap[tx.type] || tx.type }
function formatTime(t) { return t ? String(t).substring(0, 19) : '' }

// 编辑资料
const showEdit = ref(false)
const editErr = ref('')
const editLoading = ref(false)
const editForm = reactive({ username: '', real_name: '', avatar: '' })

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
  } catch (e) { editErr.value = e.message }
  finally { editLoading.value = false }
}

function handleLogout() { authStore.doLogout(); router.push('/trade/login') }

onMounted(() => { initEditForm(); loadBalance(); loadTransactions() })
</script>

<style scoped>
.profile-page { max-width: 700px; }
.page-title { font-size: 22px; margin-bottom: 20px; }

/* 钱包 */
.wallet-card { padding: 20px 24px; }
.wallet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.wallet-header h3 { font-size: 16px; }
.wallet-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.wallet-item { text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px; }
.wl-label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.wl-value { font-size: 22px; font-weight: 700; color: #16a34a; }
.wallet-item--single { grid-column: 1 / -1; max-width: 300px; justify-self: center; }
.recharge-bar { display: flex; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #f0f2f5; }
.recharge-input { flex: 1; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }

/* 交易记录 */
.tx-card { padding: 20px 24px; }
.tx-card h3 { font-size: 16px; margin-bottom: 12px; }
.tx-empty { text-align: center; color: var(--text-secondary); padding: 24px; font-size: 14px; }
.tx-list { display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto; }
.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f9fafb; border-radius: 8px; }
.tx-left { display: flex; flex-direction: column; gap: 2px; }
.tx-type { font-size: 13px; font-weight: 600; }
.tx-type.tx--recharge, .tx-type.tx--income { color: #16a34a; }
.tx-type.tx--freeze { color: #f59e0b; }
.tx-type.tx--pay, .tx-type.tx--refund { color: #ef4444; }
.tx-remark { font-size: 12px; color: var(--text-secondary); }
.tx-right { text-align: right; display: flex; flex-direction: column; gap: 2px; }
.tx-plus { color: #16a34a; font-weight: 600; }
.tx-minus { color: #ef4444; font-weight: 600; }
.tx-time { font-size: 11px; color: var(--text-placeholder); }

/* 个人信息 */
.profile-card { padding: 28px; }
.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f2f3f5; }
.profile-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #16a34a, #764ba2); color: #fff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.profile-phone { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
.dg-item { display: flex; flex-direction: column; gap: 4px; }
.dg-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
.profile-actions { display: flex; gap: 10px; padding-top: 16px; border-top: 1px solid #f2f3f5; }
.btn--danger { background: var(--color-danger); }
.btn--danger:hover { background: #f89898; }

.edit-card { padding: 24px; margin-top: 16px; }
.edit-card h3 { margin-bottom: 16px; }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.form-input { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(22,163,74,0.1); }
.form-actions { display: flex; gap: 12px; padding-top: 4px; }
.btn--cancel { background: #f0f2f5; color: var(--text-regular); border-color: var(--border-color); }
.btn--cancel:hover { background: #e5e7eb; }
.field-error { font-size: 12px; color: var(--color-danger); }
.state-wrap { text-align: center; padding: 30px; color: var(--text-secondary); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
