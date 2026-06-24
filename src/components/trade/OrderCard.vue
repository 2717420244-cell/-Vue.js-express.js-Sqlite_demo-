<template>
  <div class="order-card card" @click="$router.push(`/trade/orders/${order.order_id}`)">
    <div class="order-header">
      <span class="order-id">订单 #{{ order.order_id }}</span>
      <span class="order-status" :class="statusClass">{{ statusLabel }}</span>
    </div>
    <div class="order-body">
      <div class="order-info">
        <p><strong>{{ order.title || order.item_title || '商品' }}</strong></p>
        <p class="order-amount">¥{{ order.amount }}</p>
      </div>
      <div class="order-meta">
        <p>买家 ID: {{ order.buyer_id }}</p>
        <p>卖家 ID: {{ order.seller_id }}</p>
        <p class="order-time">{{ order.create_time }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ order: { type: Object, required: true } })

const statusLabel = computed(() => {
  const o = props.order
  const ds = Number(o.delivery_status)
  const ps = Number(o.pay_status)
  if (ds === -1 && ps === 0) return '已过期'
  if (ds === 2) return '已完成'
  if (ds === 1) return '已交付'
  if (ps === 1) return '已支付'
  return '待支付'
})

const statusClass = computed(() => {
  const o = props.order
  const ds = Number(o.delivery_status)
  const ps = Number(o.pay_status)
  if (ds === -1 && ps === 0) return 's--expired'
  if (ds === 2) return 's--done'
  if (ds === 1) return 's--deliver'
  if (ps === 1) return 's--paid'
  return 's--pending'
})
</script>

<style scoped>
.order-card { padding: 18px; cursor: pointer; transition: transform 0.2s; }
.order-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-id { font-weight: 600; font-size: 14px; }
.order-status { font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 500; }
.s--pending { background: #fdf6ec; color: #e6a23c; }
.s--paid { background: #ecf5ff; color: #409eff; }
.s--deliver { background: #f0f9eb; color: #67c23a; }
.s--done { background: #f4f4f5; color: #909399; }
.s--expired { background: #fee2e2; color: #dc2626; }
.order-body { display: flex; justify-content: space-between; gap: 16px; }
.order-info { flex: 1; }
.order-amount { font-size: 18px; font-weight: 700; color: #f56c6c; margin-top: 4px; }
.order-meta { text-align: right; font-size: 12px; color: var(--text-secondary); }
.order-time { margin-top: 4px; }
</style>
