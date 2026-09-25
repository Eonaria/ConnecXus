<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="nexus-modal-overlay"
        @click.self="cancel"
      >
        <div class="nexus-confirm-modal-card">
          <!-- Glow Header Icon -->
          <div class="confirm-icon-aura" :class="confirmColor && confirmColor.includes('amber') ? 'amber' : 'danger'">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>

          <h3 class="confirm-modal-title">
            {{ title }}
          </h3>
          <p class="confirm-modal-msg">
            {{ message }}
          </p>

          <div class="confirm-modal-actions">
            <button
              type="button"
              @click="cancel"
              class="btn-confirm-cancel"
            >
              {{ cancelText || 'ยกเลิก' }}
            </button>
            <button
              type="button"
              @click="confirm"
              class="btn-confirm-execute danger-btn"
              :style="confirmColor ? `background: ${confirmColor};` : ''"
            >
              {{ confirmText || 'ยืนยัน' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
}>()

const emit = defineEmits(['confirm', 'cancel'])

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.nexus-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeInOverlay 0.2s ease-out;
  padding: 16px;
}

.nexus-confirm-modal-card {
  background: rgba(18, 20, 30, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 26px;
  padding: 32px 28px 26px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  animation: modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.confirm-icon-aura {
  width: 68px;
  height: 68px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.confirm-icon-aura.danger {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(239, 68, 68, 0.08) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.35);
}

.confirm-icon-aura.amber {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0.08) 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.35);
}

.confirm-modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 10px;
  letter-spacing: -0.2px;
}

.confirm-modal-msg {
  font-size: 14.5px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 24px;
  max-width: 340px;
}

.confirm-modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.btn-confirm-cancel {
  flex: 1;
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-confirm-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
}

.btn-confirm-execute {
  flex: 1.2;
  padding: 12px 20px;
  border-radius: 14px;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-confirm-execute.danger-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.45);
}

.btn-confirm-execute.danger-btn:hover {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  box-shadow: 0 6px 26px rgba(239, 68, 68, 0.6);
  transform: translateY(-1px);
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalPopIn {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
