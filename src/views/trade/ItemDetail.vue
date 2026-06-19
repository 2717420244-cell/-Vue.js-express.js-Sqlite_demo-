<template>
  <div class="item-detail-page">
    <div class="back-link" @click="$router.push('/trade/items')">← 返回商城</div>

    <!-- 加载 -->
    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <template v-else-if="item">
      <div class="card detail-card">
        <!-- 状态 + 标题 -->
        <div class="detail-header">
          <h2>{{ item.title }}</h2>
          <span class="item-status" :class="'status--' + item.status">{{ statusMap[item.status] }}</span>
        </div>

        <!-- 基本信息 -->
        <div class="detail-grid">
          <div class="dg-item"><span class="dg-label">分类</span><span>{{ item.category }}</span></div>
          <div class="dg-item"><span class="dg-label">卖家</span><span>{{ item.seller_name }}</span></div>
          <div class="dg-item"><span class="dg-label">浏览量</span><span>{{ item.views }}</span></div>
          <div class="dg-item"><span class="dg-label">发布时间</span><span>{{ item.created_at }}</span></div>
          <div class="dg-item full"><span class="dg-label">描述</span><span>{{ item.description || '暂无描述' }}</span></div>
        </div>

        <!-- 价格 + 操作 -->
        <div class="detail-action">
          <span class="detail-price">¥{{ item.price }}</span>
          <div>
            <button v-if="item.status === 1 && authStore.isLoggedIn && item.seller_id !== authStore.uid"
              class="btn" @click="handleBuy">立即购买</button>
            <button v-if="item.status === 1 && authStore.isLoggedIn && item.seller_id === authStore.uid"
              class="btn btn--warn" @click="$router.push(`/trade/publish?id=${item.item_id}`)">编辑商品</button>
            <button v-if="item.status === 2" class="btn btn--disabled" disabled>已售出</button>
            <button v-if="!authStore.isLoggedIn" class="btn" @click="$router.push('/trade/login')">登录后购买</button>
          </div>
        </div>
      </div>

      <!-- 评价 -->
      <div class="card reviews-card">
        <h3 class="section-title">📝 买家评价</h3>
        <div v-if="reviews.length" class="reviews-list">
          <div v-for="r in reviews" :key="r.review_id" class="review-item">
            <div class="review-header">
              <RatingStars :model-value="r.rating" size="sm" />
              <span class="review-date">{{ r.created_at }}</span>
            </div>
            <p v-if="r.comment" class="review-comment">{{ r.comment }}</p>
          </div>
        </div>
        <p v-else class="no-review">暂无评价</p>
      </div>
    </template>

    <div v-else class="state-wrap">❌ 商品不存在</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/tradeAuth'
import { getItemById, getReviews, createOrder } from '@/api/trade'
import RatingStars from '@/components/trade/RatingStars.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const item = ref(null)
const reviews = ref([])
const loading = ref(false)
const statusMap = { 0: '待审核', 1: '在售', 2: '已售', 3: '已下架' }

async function load() {
  loading.value = true
  try {
    const id = route.params.id
    const [itemRes, reviewRes] = await Promise.all([
      getItemById(id),
      getReviews(id).catch(() => ({ data: { reviews: [] } }))
    ])
    item.value = itemRes.data
    reviews.value = reviewRes.data?.reviews || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleBuy() {
  if (!confirm('确定购买此账号？创建订单后请尽快支付。')) return
  try {
    const res = await createOrder(item.value.item_id)
    alert('订单创建成功！')
    router.push(`/trade/orders/${res.data.order_id}`)
  } catch (e) {
    alert(e.message)
  }
}

onMounted(() => load())
</script>

<style scoped>
.item-detail-page { max-width: 800px; }
.back-link { color: var(--color-primary); cursor: pointer; font-size: 14px; margin-bottom: 16px; display: inline-block; }
.back-link:hover { text-decoration: underline; }
.detail-card { padding: 28px; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.detail-header h2 { font-size: 22px; }
.item-status { font-size: 12px; padding: 4px 10px; border-radius: 12px; }
.status--0 { background: #fdf6ec; color: #e6a23c; }
.status--1 { background: #f0f9eb; color: #67c23a; }
.status--2 { background: #fef0f0; color: #f56c6c; }
.status--3 { background: #f4f4f5; color: #909399; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
.dg-item { display: flex; flex-direction: column; gap: 4px; }
.dg-item.full { grid-column: 1/-1; }
.dg-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
.detail-action { display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid #f2f3f5; }
.detail-price { font-size: 32px; font-weight: 700; color: #f56c6c; }
.btn--warn { background: #e6a23c; }
.btn--disabled { background: #c0c4cc; cursor: not-allowed; }
.reviews-card { padding: 24px; }
.section-title { font-size: 16px; margin-bottom: 16px; }
.reviews-list { display: flex; flex-direction: column; gap: 14px; }
.review-item { padding: 14px; background: #fafbfc; border-radius: 8px; }
.review-header { display: flex; justify-content: space-between; align-items: center; }
.review-date { font-size: 12px; color: var(--text-placeholder); }
.review-comment { margin-top: 8px; font-size: 14px; color: var(--text-regular); }
.no-review { color: var(--text-secondary); font-size: 14px; text-align: center; padding: 20px; }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
