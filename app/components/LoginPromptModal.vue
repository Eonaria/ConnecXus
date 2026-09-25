<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="login-modal-overlay"
        @click.self="closeLoginModal"
      >
        <div class="login-modal-content">
          <div class="login-modal-header">
            <div class="login-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </div>
            <h2>เข้าสู่ระบบเพื่อดำเนินการต่อ</h2>
            <p>{{ modalMessage }}</p>
          </div>
          
          <div class="login-modal-actions">
            <button class="btn-login" @click="goToLogin('password')">เข้าสู่ระบบ / สมัครสมาชิก</button>
            <button class="btn-qr-scan" @click="goToLogin('qr')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>สแกน QR Code เข้าสู่ระบบ</span>
            </button>
            <button class="btn-cancel" @click="closeLoginModal">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useLoginModal } from '~/composables/useLoginModal'
import { useRouter } from 'vue-router'

const { isOpen, modalMessage, closeLoginModal } = useLoginModal()
const router = useRouter()

function goToLogin(mode: string = 'password') {
  closeLoginModal()
  router.push(`/login${mode === 'qr' ? '?mode=qr' : ''}`)
}
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 24px;
}

.login-modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  padding: 32px 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.login-modal-header {
  margin-bottom: 32px;
}

.login-icon {
  width: 64px;
  height: 64px;
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.login-modal-header h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.login-modal-header p {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.login-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #8b5cf6;
  color: #ffffff;
  border: none;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-login:hover {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-qr-scan {
  width: 100%;
  padding: 13px;
  background: rgba(139, 92, 246, 0.12);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-qr-scan:hover {
  background: rgba(139, 92, 246, 0.22);
  color: #fff;
  border-color: rgba(167, 139, 250, 0.5);
  transform: translateY(-1px);
}

.btn-cancel {
  width: 100%;
  padding: 14px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .login-modal-content {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-leave-active .login-modal-content {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from .login-modal-content {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
.modal-fade-leave-to .login-modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
