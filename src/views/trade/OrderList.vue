<template>
  <div class="order-list-page">
    <h2 class="page-title">📦 我的订单</h2>

    <div class="order-card order-summary card" v-if="authStore.isLoggedIn">
      <span>当前用户：<strong>{{ authStore.username }}</strong></span>
      <span>UID：{{ authStore.uid }}</span>
    </div>

    <div v-if="!authStore.isLoggedIn" class="state-wrap">
      <p>请先登录查看订单</p>
      <button class="btn" @click="$router.push('/trade/login')" style="margin-top:12px;">去登录</button>
    </div>

    <div v-else-if="loading" class="state-wrap"><span class="spinner"></span> 加载中...</div>

    <div v-else-if="orders.length" class="order-list">
      <OrderCard v-for="o in orders" :key="o.order_id" :order="o" />
    </div>

    <div v-else class="state-wrap state--empty">📭 暂无订单</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/tradeAuth'
import { getOrders } from '@/api/trade'
import OrderCard from '@/components/trade/OrderCard.vue'

const authStore = useAuthStore()
const orders = ref([])
const loading = ref(false)

onMounted(async () => {
  if (!authStore.isLoggedIn) return
  loading.value = true
  try {
    const res = await getOrders()
    orders.value = res.data?.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>

<style scoped>
.order-list-page { max-width: 900px; }
.page-title { font-size: 22px; margin-bottom: 20px; }
.order-summary { display: flex; gap: 24px; font-size: 14px; color: var(--text-regular); padding: 16px 20px; margin-bottom: 20px; }
.order-list { display: flex; flex-direction: column; gap: 12px; }
.state-wrap { text-align: center; padding: 60px; color: var(--text-secondary); }
.state--empty { font-size: 18px; }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border-color); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
