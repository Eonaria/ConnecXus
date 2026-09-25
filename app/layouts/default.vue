<template>
  <div class="connecxus-app-root" :style="{
    height: '100vh',
    overflow: 'hidden',
    background: theme === 'dark' ? 'radial-gradient(ellipse at top left, #2a1b4d 0%, #0a0a0c 50%, #051624 100%)' : 'radial-gradient(ellipse at top left, #f3e7ff 0%, #f9f9fb 50%, #e0f2fe 100%)',
    display: 'flex',
    justifyContent: 'center',
    transition: 'background-color 0.3s'
  }">
    <!-- Ambient glow (dark mode only) -->
    <div v-if="theme === 'dark'" style="position: fixed; top: -100px; left: -100px; width: 400px; height: 400px; background: rgba(123, 108, 246, 0.15); filter: blur(100px); border-radius: 50%; pointer-events: none; z-index: 0;"></div>
    <div v-if="theme === 'dark'" style="position: fixed; bottom: -100px; right: -100px; width: 500px; height: 500px; background: rgba(56, 189, 248, 0.1); filter: blur(120px); border-radius: 50%; pointer-events: none; z-index: 0;"></div>

    <div class="app-layout-inner" :style="{
      display: 'flex',
      width: '100%',
      maxWidth: isAdminPage ? '100%' : '1280px',
      height: '100vh',
      justifyContent: isAdminPage ? 'flex-start' : 'center',
      alignItems: 'flex-start',
      overflow: 'hidden',
      padding: isAdminPage ? '0 24px 0 0' : '0'
    }">
      <!-- Desktop Sidebar (Fixed) -->
      <div class="desktop-sidebar" style="height: 100vh; flex-shrink: 0; z-index: 90;">
        <AppSidebar />
      </div>

      <!-- Main Content Shell -->
      <main class="app-main-viewport" :style="{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column', overflowY: isFeedPage || isMessages ? 'hidden' : 'auto', overflowX: 'hidden' }">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <AppBottomNav />
  </div>
</template>

<script setup lang="ts">
const { theme } = useTheme()
const route = useRoute()
const isMessages = computed(() => route.path.startsWith('/messages'))
const isFeedPage = computed(() => route.path === '/')
const isAdminPage = computed(() => route.path.startsWith('/admin'))

watch(() => route.fullPath, () => {
  nextTick(() => {
    const el = document.querySelector('.app-main-viewport')
    if (el) el.scrollTop = 0
  })
})
</script>

<style scoped>
.app-main-viewport::-webkit-scrollbar {
  width: 6px;
}
.app-main-viewport::-webkit-scrollbar-track {
  background: transparent;
}
.app-main-viewport::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 99px;
}
.app-main-viewport::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.4);
}

@media (max-width: 768px) {
  .connecxus-app-root,
  .app-layout-inner,
  .app-main-viewport {
    height: 100vh !important;
  }
}
</style>

