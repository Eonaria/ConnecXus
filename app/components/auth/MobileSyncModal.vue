<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click="close">
        <div class="modal-dialog" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <div class="header-left">
              <div class="icon-bubble">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <div>
                <h3 class="modal-title">เข้าสู่ระบบด่วนบนมือถือ</h3>
                <p class="modal-desc">สแกน QR Code ด้วยกล้องมือถือ เพื่อเข้าใช้งานบนมือถือทันที</p>
              </div>
            </div>
            <button @click="close" class="btn-close-modal" aria-label="ปิด">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body with QR -->
          <div class="modal-body">
            <QrLoginCard />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import QrLoginCard from '~/components/auth/QrLoginCard.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-dialog {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card, #11131c);
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.12));
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-bubble {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--brand-light, rgba(99, 102, 241, 0.15));
  border: 1px solid var(--brand, #6366f1);
  color: var(--brand, #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary, #fff);
  margin: 0 0 2px;
}

.modal-desc {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  margin: 0;
}

.btn-close-modal {
  background: var(--bg-tertiary, rgba(255, 255, 255, 0.06));
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
  color: var(--text-muted, #94a3b8);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.btn-close-modal:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.modal-body {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
