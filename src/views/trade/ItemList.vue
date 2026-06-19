<template>
  <div class="item-list-page">
    <div class="page-header">
      <h2 class="page-title">🎮 账号商城</h2>
      <button v-if="authStore.isLoggedIn" class="btn" @click="$router.push('/trade/publish')">➕ 发布账号</button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input v-model="keyword" type="text" placeholder="搜索游戏账号..." class="search-input" @keyup.enter="search" />
      <select v-model="category" class="category-select" @change="search">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <button class="btn" @click="search">搜索</button>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <!-- 商品网格 -->
    <div v-else-if="items.length" class="item-grid">
      <ItemCard v-for="item in items" :key="item.item_id" :item="item" />
    </div>

    <!-- 空 -->
    <div v-else class="state-wrap state--empty">📭 暂无商品</div>

    <!-- 分页 -->
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
import { getItems } from '@/api/trade'
import ItemCard from '@/components/trade/ItemCard.vue'

const authStore = useAuthStore()
const items = ref([])
const loading = ref(false)
const keyword = ref('')
const category = ref('')
const page = ref(1)
const total = ref(0)
const limit = 12
const categories = ref([])

async function fetchItems() {
  loading.value = true
  try {
    const res = await getItems({ page: page.value, limit, keyword: keyword.value, category: category.value, status: 1 })
    items.value = res.data.items
    total.value = res.data.pagination?.total || 0
    // 收集所有分类
    const cats = new Set()
    res.data.items.forEach(i => i.category && cats.add(i.category))
    categories.value = [...cats]
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function search() { page.value = 1; fetchItems() }
function changePage(p) { page.value = p; fetchItems() }

onMounted(() => fetchItems())
</script>

<style scoped>
.item-list-page { max-width: 1100px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 22px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 24px; }
.search-input { flex: 1; padding: 9px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(64,158,255,0.1); }
.category-select { padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; min-width: 130px; }
.item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.state--empty { font-size: 18px; }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.pagination button { padding: 6px 16px; border: 1px solid var(--border-color); border-radius: 6px; background: #fff; cursor: pointer; }
.pagination button:disabled { opacity: 0.4; cursor: default; }
</style>
