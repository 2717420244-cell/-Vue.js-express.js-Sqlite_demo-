<template>
  <!--
    用户状态徽章 — 高复用性组件
    ==============================
    设计要点：
    1. 通过 props 接收 status 值，决定显示的颜色和文本
    2. 使用计算属性动态生成样式类和文本
    3. 可在用户列表、详情、表单等多处复用
  -->
  <span class="status-badge" :class="badgeClass">
    <span class="status-dot"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Props 定义 — 父组件向子组件传递数据
 *
 * status: 'active' | 'inactive' | 'pending'
 *         决定徽章的颜色和文字
 */
const props = defineProps({
  status: {
    type: String,
    required: true,
    // 参数校验：只允许这三种状态
    validator: (value) => ['active', 'inactive', 'pending'].includes(value)
  }
})

/**
 * 计算属性 — 根据 status 动态生成 CSS 类名
 * Vue 会自动缓存计算结果，依赖不变时不重新计算
 */
const badgeClass = computed(() => {
  return {
    'badge--active':   props.status === 'active',
    'badge--inactive': props.status === 'inactive',
    'badge--pending':  props.status === 'pending'
  }
})

/**
 * 计算属性 — 状态中文映射
 */
const label = computed(() => {
  const map = {
    active: '正常',
    inactive: '禁用',
    pending: '待审核'
  }
  return map[props.status] || '未知'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

/* 不同状态的颜色方案 */
.badge--active {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.badge--inactive {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.badge--pending {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
</style>
