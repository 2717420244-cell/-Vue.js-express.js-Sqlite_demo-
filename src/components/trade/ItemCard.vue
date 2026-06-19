<template>
  <div class="item-card card" @click="$router.push(`/trade/items/${item.item_id}`)">
    <!-- 状态标签 -->
    <span class="item-status" :class="'status--' + item.status">{{ statusLabel }}</span>

    <!-- 标题 -->
    <h4 class="item-title">{{ item.title }}</h4>

    <!-- 分类 -->
    <span class="item-category">{{ item.category }}</span>

    <!-- 描述 -->
    <p class="item-desc" v-if="item.description">{{ item.description }}</p>

    <!-- 底部：价格 + 卖家 -->
    <div class="item-footer">
      <span class="item-price">¥{{ item.price }}</span>
      <span class="item-seller">{{ item.seller_name }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})

const statusMap = { 0: '待审核', 1: '在售', 2: '已售', 3: '已下架' }
const statusLabel = computed(() => statusMap[props.item.status] || '未知')
</script>

<style scoped>
.item-card {
  padding: 18px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.item-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.item-status {
  position: absolute; top: 12px; right: 12px;
  font-size: 11px; padding: 2px 8px; border-radius: 10px;
}
.status--0 { background: #fdf6ec; color: #e6a23c; }
.status--1 { background: #f0f9eb; color: #67c23a; }
.status--2 { background: #fef0f0; color: #f56c6c; }
.status--3 { background: #f4f4f5; color: #909399; }
.item-title { font-size: 16px; margin-bottom: 6px; padding-right: 60px; }
.item-category { font-size: 12px; color: var(--color-primary); background: #ecf5ff; padding: 2px 8px; border-radius: 10px; }
.item-desc { font-size: 13px; color: var(--text-secondary); margin-top: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f2f3f5; }
.item-price { font-size: 22px; font-weight: 700; color: #f56c6c; }
.item-seller { font-size: 12px; color: var(--text-secondary); }
</style>
