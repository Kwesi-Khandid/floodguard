<script setup>
const authStore = useAuthStore()
onMounted(() => {
  authStore.fetchMe()
})
</script>

<template>
  <div class="app-shell">
    <Sidebar />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 992px) {
  .app-shell {
    flex-direction: column;
  }
}
</style>