<template>
  <div id="app-container">
    <AppHeader />

    <div class="main-layout">
      <AppSidebar />

      <main class="main-content">
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
  background: var(--bg-color);
  overflow-y: auto;
}
</style>
