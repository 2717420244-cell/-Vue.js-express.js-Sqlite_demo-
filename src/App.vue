<template>
  <div id="app-container">
    <!-- 顶部导航栏 -->
    <AppHeader />

    <div class="main-layout">
      <!-- 侧边栏 -->
      <AppSidebar />

      <!-- 主内容区域：路由视图 -->
      <main class="main-content">
        <!--
          router-view 是 Vue Router 的核心组件：
          - 根据当前 URL 渲染匹配的组件
          - 支持嵌套路由（子路由组件会渲染到子级 router-view）
          - 可配合 <transition> 实现页面切换动画
        -->
        <router-view v-slot="{ Component, route }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>
