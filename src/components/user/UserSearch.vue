<template>
  <!--
    用户搜索栏组件
    ==============
    设计要点：
    1. v-model 双向绑定搜索关键词
    2. 通过 emit 向父组件发送事件（搜索、状态筛选变化）
    3. 完全由 props 控制状态，组件本身无内部状态
  -->
  <div class="user-search">
    <!-- 搜索输入框：v-model 双向绑定 -->
    <div class="search-input-wrap">
      <span class="search-icon">🔍</span>
      <input
        :value="modelValue"
        type="text"
        placeholder="搜索用户名、邮箱..."
        class="search-input"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="modelValue"
        class="clear-btn"
        @click="$emit('update:modelValue', '')"
      >
        ✕
      </button>
    </div>

    <!-- 状态筛选：通过 emit 通知父组件 -->
    <div class="filter-group">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="filter-btn"
        :class="{ 'filter-btn--active': statusFilter === opt.value }"
        @click="$emit('update:statusFilter', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * v-model 实现原理：
 *   v-model="keyword" 等价于
 *   :modelValue="keyword" + @update:modelValue="keyword = $event"
 *
 * 这里将输入框绑定为 :value + @input，实现 v-model 语义
 */

defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: 'all'
  }
})

defineEmits(['update:modelValue', 'update:statusFilter'])

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '正常', value: 'active' },
  { label: '禁用', value: 'inactive' },
  { label: '待审核', value: 'pending' }
]
</script>

<style scoped>
.user-search {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-placeholder);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
}

.filter-group {
  display: flex;
  gap: 6px;
}

.filter-btn {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-regular);
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
</style>
