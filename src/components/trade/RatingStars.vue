<template>
  <span class="rating-stars" :class="'stars--' + size">
    <span
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ filled: i <= modelValue, interactive: interactive }"
      @click="interactive && $emit('update:modelValue', i)"
    >{{ i <= modelValue ? '★' : '☆' }}</span>
    <span v-if="showCount && count" class="star-count">({{ count }})</span>
  </span>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false },
  size: { type: String, default: 'md' },    // sm | md | lg
  showCount: { type: Boolean, default: false },
  count: { type: Number, default: 0 }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.rating-stars { display: inline-flex; align-items: center; gap: 2px; }
.star { color: #ddd; transition: color 0.15s; }
.stars--sm .star { font-size: 14px; }
.stars--md .star { font-size: 18px; }
.stars--lg .star { font-size: 24px; }
.star.filled { color: #f7ba2a; }
.star.interactive { cursor: pointer; }
.star.interactive:hover { color: #f7ba2a; }
.star-count { font-size: 12px; color: var(--text-secondary); margin-left: 4px; }
</style>
