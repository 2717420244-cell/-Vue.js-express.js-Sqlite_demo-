<template>
  <div class="audit-page">
    <h2 class="page-title">📋 商品审核</h2>

    <!-- 说明 -->
    <div class="card audit-info" v-if="authStore.isAdmin">
      <p>👑 管理员：<strong>{{ authStore.username }}</strong></p>
      <p class="hint">审核卖家发布的商品，通过后商品才会在商城显示。</p>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <!-- 审核列表 -->
    <div v-else-if="items.length" class="audit-list">
      <div v-for="item in items" :key="item.item_id" class="card audit-card">
        <div class="audit-header">
          <h4>{{ item.title }}</h4>
          <span class="audit-status">⏳ 待审核</span>
        </div>

        <div class="audit-grid">
          <div class="ag-item"><span class="ag-label">分类</span><span>{{ item.category }}</span></div>
          <div class="ag-item"><span class="ag-label">价格</span><span class="price">¥{{ item.price }}</span></div>
          <div class="ag-item"><span class="ag-label">卖家</span><span>{{ item.seller_name }}</span></div>
          <div class="ag-item"><span class="ag-label">发布时间</span><span>{{ item.created_at }}</span></div>
          <div class="ag-item full"><span class="ag-label">描述</span><span>{{ item.description || '暂无描述' }}</span></div>
        </div>

        <div class="audit-actions">
          <button class="btn btn--reject" @click="handleAudit(item, 'reject')">❌ 拒绝</button>
          <button class="btn btn--approve" @click="handleAudit(item, 'approve')">✅ 通过</button>
        </div>
      </div>
    </div>

    <!-- 空 -->
    <div v-else class="state-wrap state--empty">🎉 暂无待审核商品</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/tradeAuth'
import { getAdminAudits, auditItem } from '@/api/trade'

const authStore = useAuthStore()
const items = ref([])
const loading = ref(false)

async function fetchAudits() {
  loading.value = true
  try {
    const res = await getAdminAudits()
    items.value = res.data?.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function handleAudit(item, action) {
  const label = action === 'approve' ? '通过' : '拒绝'
  if (!confirm(`确定${label}「${item.title}」吗？`)) return
  try {
    await auditItem(item.item_id, action)
    alert(`已${label}！`)
    fetchAudits()
  } catch (e) { alert(e.message) }
}

onMounted(() => fetchAudits())
</script>

<style scoped>
.audit-page { max-width: 800px; }
.page-title { font-size: 22px; margin-bottom: 20px; }
.audit-info { padding: 16px 20px; }
.audit-info .hint { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
.audit-list { display: flex; flex-direction: column; gap: 12px; }
.audit-card { padding: 20px; }
.audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.audit-header h4 { font-size: 16px; }
.audit-status { font-size: 12px; padding: 3px 10px; border-radius: 12px; background: #fef3c7; color: #d97706; font-weight: 500; }
.audit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.ag-item { display: flex; flex-direction: column; gap: 2px; }
.ag-item.full { grid-column: 1/-1; }
.ag-label { font-size: 11px; color: var(--text-secondary); font-weight: 600; }
.price { font-weight: 700; color: #ef4444; }
.audit-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 14px; border-top: 1px solid #f0f2f5; }
.btn--reject { background: #ef4444; }
.btn--reject:hover { background: #f87171; }
.btn--approve { background: #16a34a; }
.btn--approve:hover { background: #22c55e; }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.state--empty { font-size: 18px; }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
