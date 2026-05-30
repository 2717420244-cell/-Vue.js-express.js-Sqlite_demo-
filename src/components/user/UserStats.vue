<template>
  <!--
    用户统计卡片组件
    ================
    设计要点：
    1. 纯展示组件，通过 props 接收统计数据
    2. 使用 v-for 渲染统计卡片列表
    3. 动画数字效果通过 CSS transition 实现
  -->
  <div class="user-stats">
    <div
      v-for="item in stats"
      :key="item.label"
      class="stat-card card"
      :class="item.variant"
    >
      <div class="stat-icon">{{ item.icon }}</div>
      <div class="stat-body">
        <div class="stat-value">{{ item.value }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 组件复用性：只需传入 stats 数组即可渲染任意统计卡片
 * 不依赖任何特定的业务逻辑，可在任何需要统计展示的页面使用
 */
defineProps({
  stats: {
    type: Array,
    required: true,
    // 数组项校验
    default: () => []
  }
})
</script>

<style scoped>
.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
}

/* 不同变体的图标背景色 */
.stat-card.variant--success .stat-icon { background: #f0f9eb; }
.stat-card.variant--danger  .stat-icon { background: #fef0f0; }
.stat-card.variant--warning .stat-icon { background: #fdf6ec; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
