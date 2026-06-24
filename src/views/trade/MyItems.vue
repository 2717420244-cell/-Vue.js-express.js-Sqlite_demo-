<template>
  <div class="my-items-page">
    <h2 class="page-title">📦 我发布的商品</h2>

    <div class="status-bar card">
      <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ active: statusFilter === tab.value }" @click="statusFilter = tab.value; page = 1; fetchItems()">
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <div v-else-if="items.length" class="item-list">
      <div v-for="item in items" :key="item.item_id" class="card item-row" :class="{ 'row--deliver': item.order_delivery_status == 0 }">
        <div class="row-left">
          <h4 class="item-title">{{ item.title }}</h4>
          <span class="item-meta">{{ item.category }} · ¥{{ item.price }} · {{ item.created_at }}</span>
        </div>

        <div class="row-body" v-if="item.order_delivery_status == 0">
          <!-- 待交付：卖家填写账号信息 -->
          <textarea v-model="deliverForms[item.item_id]" rows="2" class="deliver-input" placeholder="在此填写交付给买家的账号信息（账号、密码等）..." @click.stop></textarea>
          <button class="btn btn--sm btn--deliver" @click.stop="handleDeliver(item)">📦 交付</button>
        </div>

        <div class="row-right">
          <span class="status-badge" :class="'s--' + deliverStatus(item)">{{ deliverLabel(item) }}</span>
          <button v-if="item.status === 1" class="btn btn--sm btn--down" @click.stop="handleDown(item)">下架</button>
          <button v-if="item.status !== 2 && item.status !== 1" class="btn btn--sm" @click.stop="$router.push(`/trade/publish?id=${item.item_id}`)">编辑</button>
        </div>
      </div>
    </div>

    <div v-else class="state-wrap state--empty">📭 暂无商品，去 <router-link to="/trade/publish">发布一个</router-link></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/tradeAuth'
import { getItems, updateItemStatus, deliverOrder } from '@/api/trade'

const authStore = useAuthStore()
const items = ref([])
const loading = ref(false)
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const limit = 20
const deliverForms = reactive({})

const statusMap = { 0: '待审核', 1: '已上架', 2: '已售出', 3: '已下架' }

function deliverStatus(item) {
  const ds = Number(item.order_delivery_status)
  const ps = Number(item.pay_status)
  if (item.status != 2) return item.status
  if (isNaN(ds)) return 2       // 已售但未支付
  if (ds === 0 && ps === 1) return 'pending'   // 待交付
  if (ds === 1) return 'delivered'             // 已交付
  if (ds === 2) return 'done'                  // 已完成
  return 2
}

function deliverLabel(item) {
  const labels = { ...statusMap, pending: '待交付', delivered: '已交付', done: '已完成' }
  return labels[deliverStatus(item)] || '已售出'
}

const tabs = computed(() => [
  { label: '全部',   value: '' },
  { label: '待审核', value: '0' },
  { label: '已上架', value: '1' },
  { label: '已售出', value: '2' },
  { label: '已下架', value: '3' },
])

async function fetchItems() {
  if (!authStore.uid) return
  loading.value = true
  try {
    const params = { page: page.value, limit, seller_id: authStore.uid }
    if (statusFilter.value !== '') params.status = parseInt(statusFilter.value)
    const res = await getItems(params)
    items.value = res.data?.items || []
    total.value = res.data?.pagination?.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function handleDeliver(item) {
  const info = (deliverForms[item.item_id] || '').trim()
  if (!info) return alert('请填写交付的账号信息')
  try {
    await deliverOrder(item.order_id, info)
    alert('交付成功！买家收货后钱款将转入你的账户')
    deliverForms[item.item_id] = ''
    fetchItems()
  } catch (e) { alert(e.message) }
}

async function handleDown(item) {
  if (!confirm(`确定下架「${item.title}」吗？`)) return
  try { await updateItemStatus(item.item_id, 3); alert('已下架'); fetchItems() }
  catch (e) { alert(e.message) }
}

onMounted(() => fetchItems())
watch(statusFilter, () => { page.value = 1; fetchItems() })
</script>

<style scoped>
.my-items-page { max-width: 900px; }
.page-title { font-size: 22px; margin-bottom: 16px; }

.status-bar { display: flex; gap: 4px; padding: 8px 12px; }
.tab-btn { padding: 6px 16px; border: none; border-radius: 20px; font-size: 13px; cursor: pointer; background: transparent; color: var(--text-secondary); transition: all 0.18s; }
.tab-btn:hover { background: #f0fdf4; color: #16a34a; }
.tab-btn.active { background: #16a34a; color: #fff; }

.item-list { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.item-row { padding: 16px 20px; transition: transform 0.15s; }
.item-row:hover { transform: translateX(4px); }
.row--deliver { border-left: 3px solid #409eff; }
.row-left { flex: 1; margin-bottom: 8px; }
.item-title { font-size: 15px; margin-bottom: 4px; }
.item-meta { font-size: 12px; color: var(--text-secondary); }

.row-body { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; padding: 8px 12px; background: #eff6ff; border-radius: 8px; }
.row-body .deliver-input { flex: 1; padding: 8px 10px; border: 1px solid #dbeafe; border-radius: 6px; font-size: 13px; outline: none; resize: vertical; font-family: inherit; min-height: 50px; }
.row-body .deliver-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

.row-right { display: flex; align-items: center; gap: 10px; }
.status-badge { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 500; }
.s--0 { background: #fef3c7; color: #d97706; }
.s--1 { background: #dcfce7; color: #16a34a; }
.s--2 { background: #fee2e2; color: #dc2626; }
.s--3 { background: #f3f4f6; color: #9ca3af; }
.s--pending { background: #dbeafe; color: #1d4ed8; font-weight: 600; }
.s--delivered { background: #dcfce7; color: #16a34a; }
.s--done { background: #f3f4f6; color: #6b7280; }
.btn--down { background: #f59e0b; }
.btn--down:hover { background: #fbbf24; }
.btn--deliver { background: #3b82f6; white-space: nowrap; }
.btn--deliver:hover { background: #60a5fa; }

.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.state--empty { font-size: 16px; }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
