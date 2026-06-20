<template>
  <div class="my-items-page">
    <h2 class="page-title">📦 我发布的商品</h2>

    <!-- 状态统计条 -->
    <div class="status-bar card">
      <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ active: statusFilter === tab.value }" @click="statusFilter = tab.value; page = 1; fetchItems()">
        {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <!-- 商品列表 -->
    <div v-else-if="items.length" class="item-list">
      <div v-for="item in items" :key="item.item_id" class="card item-row" @click="$router.push(`/trade/items/${item.item_id}`)">
        <div class="row-left">
          <h4 class="item-title">{{ item.title }}</h4>
          <span class="item-meta">{{ item.category }} · {{ item.created_at }}</span>
        </div>
        <div class="row-right">
          <span class="item-price">¥{{ item.price }}</span>
          <span class="status-badge" :class="'s--' + item.status">{{ statusMap[item.status] }}</span>
          <!-- 操作 -->
          <button v-if="item.status !== 2" class="btn btn--sm" @click.stop="$router.push(`/trade/publish?id=${item.item_id}`)">编辑</button>
        </div>
      </div>
    </div>

    <!-- 空 -->
    <div v-else class="state-wrap state--empty">📭 暂无商品，去 <router-link to="/trade/publish">发布一个</router-link></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/tradeAuth'
import { getItems } from '@/api/trade'

const authStore = useAuthStore()
const items = ref([])
const loading = ref(false)
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const limit = 20

const statusMap = { 0: '待审核', 1: '已上架', 2: '已售出', 3: '已下架' }

const tabs = computed(() => [
  { label: '全部',   value: '',  count: total.value },
  { label: '待审核', value: '0', count: 0 },
  { label: '已上架', value: '1', count: 0 },
  { label: '已售出', value: '2', count: 0 },
  { label: '已下架', value: '3', count: 0 },
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

onMounted(() => fetchItems())
watch(statusFilter, () => { page.value = 1; fetchItems() })
</script>

<style scoped>
.my-items-page { max-width: 900px; }
.page-title { font-size: 22px; margin-bottom: 16px; }

.status-bar { display: flex; gap: 4px; padding: 8px 12px; }
.tab-btn {
  padding: 6px 16px; border: none; border-radius: 20px; font-size: 13px; cursor: pointer;
  background: transparent; color: var(--text-secondary); transition: all 0.18s;
}
.tab-btn:hover { background: #f0fdf4; color: #16a34a; }
.tab-btn.active { background: #16a34a; color: #fff; }
.tab-count { font-size: 11px; opacity: 0.7; }

.item-list { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.item-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; cursor: pointer; transition: transform 0.15s; }
.item-row:hover { transform: translateX(4px); }
.row-left { flex: 1; }
.item-title { font-size: 15px; margin-bottom: 4px; }
.item-meta { font-size: 12px; color: var(--text-secondary); }
.row-right { display: flex; align-items: center; gap: 14px; }
.item-price { font-size: 18px; font-weight: 700; color: #ef4444; }

.status-badge { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 500; }
.s--0 { background: #fef3c7; color: #d97706; }
.s--1 { background: #dcfce7; color: #16a34a; }
.s--2 { background: #fee2e2; color: #dc2626; }
.s--3 { background: #f3f4f6; color: #9ca3af; }

.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.state--empty { font-size: 16px; }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
