<template>
  <div class="order-detail-page">
    <div class="back-link" @click="$router.push('/trade/orders')">← 返回订单列表</div>

    <div v-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <template v-else-if="order">
      <!-- 订单信息 -->
      <div class="card detail-card">
        <div class="order-status-bar" :class="statusClass">
          <span class="status-text">{{ statusLabel }}</span>
        </div>

        <div class="detail-grid">
          <div class="dg-item"><span class="dg-label">订单编号</span><span>#{{ order.order_id }}</span></div>
          <div class="dg-item"><span class="dg-label">金额</span><span class="price">¥{{ order.amount }}</span></div>
          <div class="dg-item"><span class="dg-label">商品 ID</span><span>{{ order.item_id }}</span></div>
          <div class="dg-item"><span class="dg-label">买家 ID</span><span>{{ order.buyer_id }}</span></div>
          <div class="dg-item"><span class="dg-label">卖家 ID</span><span>{{ order.seller_id }}</span></div>
          <div class="dg-item"><span class="dg-label">创建时间</span><span>{{ order.create_time }}</span></div>
          <div class="dg-item"><span class="dg-label">支付状态</span><span>{{ order.pay_status === 1 ? '✅ 已支付' : '⏳ 待支付' }}</span></div>
          <div class="dg-item"><span class="dg-label">交付状态</span><span>{{ deliveryLabel }}</span></div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar" v-if="authStore.isLoggedIn">
          <button v-if="order.pay_status === 0 && order.buyer_id === authStore.uid"
            class="btn" @click="handlePay">💳 支付</button>
          <button v-if="order.pay_status === 1 && order.delivery_status === 0 && order.seller_id === authStore.uid"
            class="btn btn--deliver" @click="handleDeliver">📦 确认交付</button>
          <button v-if="order.delivery_status === 1 && order.buyer_id === authStore.uid"
            class="btn" @click="handleConfirm">✅ 确认收货</button>
          <button v-if="order.delivery_status === 2 && order.buyer_id === authStore.uid && !hasReviewed"
            class="btn btn--review" @click="showReview = true">⭐ 评价</button>
        </div>
      </div>

      <!-- 评价表单 -->
      <div v-if="showReview" class="card review-form-card">
        <h3>提交评价</h3>
        <div class="form-item">
          <label>评分</label>
          <RatingStars v-model="rating" interactive size="lg" />
        </div>
        <div class="form-item">
          <label>评价内容</label>
          <textarea v-model="comment" rows="3" class="form-input" placeholder="说说你的购买体验..."></textarea>
        </div>
        <span v-if="reviewErr" class="field-error">{{ reviewErr }}</span>
        <div class="form-actions">
          <button class="btn btn--cancel" @click="showReview = false">取消</button>
          <button class="btn" @click="submitReview" :disabled="reviewSubmitting">
            {{ reviewSubmitting ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </template>

    <div v-else class="state-wrap">❌ 订单不存在</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/tradeAuth'
import { getOrderById, payOrder, deliverOrder, confirmOrder, createReview } from '@/api/trade'
import RatingStars from '@/components/trade/RatingStars.vue'

const route = useRoute()
const authStore = useAuthStore()
const order = ref(null)
const loading = ref(false)

// 评价相关
const showReview = ref(false)
const hasReviewed = ref(false)
const rating = ref(5)
const comment = ref('')
const reviewErr = ref('')
const reviewSubmitting = ref(false)

const statusLabel = computed(() => {
  const o = order.value; if (!o) return ''
  if (o.delivery_status === 2) return '已完成'
  if (o.delivery_status === 1) return '已交付，待收货'
  if (o.pay_status === 1) return '已支付，待交付'
  return '待支付'
})

const statusClass = computed(() => {
  const o = order.value; if (!o) return ''
  if (o.delivery_status === 2) return 's--done'
  if (o.delivery_status === 1) return 's--deliver'
  if (o.pay_status === 1) return 's--paid'
  return 's--pending'
})

const deliveryLabel = computed(() => {
  const o = order.value; if (!o) return ''
  if (o.delivery_status === 2) return '✅ 已完成'
  if (o.delivery_status === 1) return '✅ 已交付'
  return '⏳ 未交付'
})

async function load() {
  loading.value = true
  try {
    const res = await getOrderById(route.params.id)
    order.value = res.data
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function handlePay() {
  if (!confirm('确认支付？')) return
  try { await payOrder(order.value.order_id); alert('支付成功！'); load() }
  catch (e) { alert(e.message) }
}

async function handleDeliver() {
  const info = prompt('请输入交付给买家的账号信息（账号名、密码等）：')
  if (!info) return
  try { await deliverOrder(order.value.order_id, info); alert('交付确认成功！'); load() }
  catch (e) { alert(e.message) }
}

async function handleConfirm() {
  if (!confirm('确认收货？确认后订单将完成。')) return
  try { await confirmOrder(order.value.order_id); alert('收货确认成功！'); load() }
  catch (e) { alert(e.message) }
}

async function submitReview() {
  reviewErr.value = ''
  reviewSubmitting.value = true
  try {
    await createReview({ order_id: order.value.order_id, rating: rating.value, comment: comment.value })
    alert('评价提交成功！')
    showReview.value = false
    hasReviewed.value = true
  } catch (e) { reviewErr.value = e.message }
  finally { reviewSubmitting.value = false }
}

onMounted(() => load())
</script>

<style scoped>
.order-detail-page { max-width: 750px; }
.back-link { color: var(--color-primary); cursor: pointer; font-size: 14px; margin-bottom: 16px; display: inline-block; }
.back-link:hover { text-decoration: underline; }
.detail-card { padding: 0; overflow: hidden; }
.order-status-bar { padding: 18px 24px; font-size: 16px; font-weight: 600; }
.s--pending { background: #fdf6ec; color: #e6a23c; }
.s--paid { background: #ecf5ff; color: #409eff; }
.s--deliver { background: #f0f9eb; color: #67c23a; }
.s--done { background: #f4f4f5; color: #909399; }
.detail-grid { padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dg-item { display: flex; flex-direction: column; gap: 4px; }
.dg-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
.price { font-size: 20px; font-weight: 700; color: #f56c6c; }
.action-bar { display: flex; gap: 10px; padding: 16px 24px; border-top: 1px solid #f2f3f5; background: #fafbfc; }
.btn--deliver { background: #67c23a; }
.btn--deliver:hover { background: #85ce61; }
.btn--review { background: #f7ba2a; }
.btn--review:hover { background: #f9cd4c; }
.review-form-card { padding: 24px; margin-top: 16px; }
.review-form-card h3 { margin-bottom: 16px; }
.form-item { margin-bottom: 16px; }
.form-item label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.form-input { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; resize: vertical; font-family: inherit; }
.field-error { font-size: 12px; color: var(--color-danger); }
.form-actions { display: flex; gap: 12px; padding-top: 8px; }
.btn--cancel { background: #f0f2f5; color: var(--text-regular); border-color: var(--border-color); }
.btn--cancel:hover { background: #e5e7eb; }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
