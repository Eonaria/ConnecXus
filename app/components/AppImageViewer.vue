<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      :style="`
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
      `"
      @click="closeImage"
    >
      <!-- Close button (top right) -->
      <button
        @click.stop="closeImage"
        :style="`
          position: absolute;
          top: 20px; right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        `"
        @mouseenter="$event.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'"
        @mouseleave="$event.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <!-- The Image -->
      <img
        v-if="currentImageUrl"
        :src="currentImageUrl"
        alt="Full screen image"
        @click.stop
        :style="`
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          cursor: default;
        `"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isOpen, currentImageUrl, closeImage } = useImageViewer()

// Close on escape key
onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen.value) {
        closeImage()
      }
    })
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
