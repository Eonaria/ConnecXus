<template>
  <div class="qr-auth-root">
    <!-- Ambient Background -->
    <div class="ambient-glow orb-purple"></div>
    <div class="ambient-glow orb-indigo"></div>

    <div class="qr-auth-card">
      
      <!-- Brand Logo -->
      <div class="brand-badge-center">
        <div class="logo-icon-glass">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <span class="brand-text">Connec<span class="highlight">X</span>us</span>
      </div>

      <!-- State 1: Success Confirmed -->
      <div v-if="confirmed" class="auth-state-box success">
        <div class="state-icon-circle success-pulse">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 class="auth-title">เข้าสู่ระบบสำเร็จ!</h2>
        <p class="auth-subtitle">หน้าจอบนคอมพิวเตอร์ของคุณเข้าสู่ระบบเรียบร้อยแล้ว</p>
        <NuxtLink to="/" class="btn-primary-gradient">
          <span>ไปยังหน้าแรกบนมือถือ</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </NuxtLink>
      </div>

      <!-- State 2: Logged In -> Confirm Prompt -->
      <div v-else-if="user" class="auth-state-box">
        <div class="device-sync-visual">
          <div class="device-icon mobile">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>
          <div class="sync-beam-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <div class="device-icon desktop">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
        </div>

        <h2 class="auth-title">ยืนยันการเข้าสู่ระบบ</h2>
        <p class="auth-subtitle">คุณกำลังเข้าสู่ระบบ ConnecXus บนคอมพิวเตอร์ด้วยบัญชีนี้:</p>

        <!-- Current User Profile Pill -->
        <div class="user-confirm-card">
          <div class="user-avatar-circle">
            <img v-if="user.avatar_url" :src="user.avatar_url" alt="avatar" />
            <div v-else class="avatar-fallback">{{ (user.display_name || user.username).charAt(0).toUpperCase() }}</div>
          </div>
          <div class="user-meta-info">
            <span class="user-name">{{ user.display_name || user.username }}</span>
            <span class="user-handle">@{{ user.username }}</span>
          </div>
          <div v-if="user.role === 'admin'" class="user-role-tag">Admin</div>
        </div>

        <div v-if="errorMsg" class="error-pill-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMsg }}</span>
        </div>

        <div class="actions-stack">
          <button @click="confirmLogin" class="btn-primary-gradient" :disabled="submitting">
            <span v-if="!submitting">ยืนยันการเข้าสู่ระบบบน PC</span>
            <span v-else class="loading-wrap">
              <div class="spinner-small"></div>
              <span>กำลังยืนยัน...</span>
            </span>
          </button>

          <!-- Switch Account Option -->
          <NuxtLink :to="`/login?mode=password&returnTo=qr-auth&token=${token || ''}`" class="btn-secondary-glass">
            <span>เข้าสู่ระบบด้วยบัญชีอื่น</span>
          </NuxtLink>

          <NuxtLink to="/" class="btn-ghost-cancel">
            ยกเลิก
          </NuxtLink>
        </div>
      </div>

      <!-- State 3: Not Logged In on Mobile -->
      <div v-else class="auth-state-box">
        <div class="state-icon-circle brand-glow">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <h2 class="auth-title">เข้าสู่ระบบบนมือถือ</h2>
        <p class="auth-subtitle">เข้าสู่ระบบหรือเลือกบัญชีบนมือถือเพื่อส่งการอนุญาตเข้าสู่ระบบไปยังหน้าจอคอมพิวเตอร์</p>

        <div class="actions-stack">
          <NuxtLink :to="`/login?returnTo=qr-auth&token=${token || ''}`" class="btn-primary-gradient">
            <span>เข้าสู่ระบบ / เลือกบัญชี</span>
          </NuxtLink>
          <NuxtLink :to="`/register?returnTo=qr-auth&token=${token || ''}`" class="btn-secondary-glass">
            <span>สมัครสมาชิกใหม่</span>
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'ยืนยันการเข้าสู่ระบบด้วย QR Code — ConnecXus',
})

const route = useRoute()
const { user } = useAuth()
const { savedAccounts, loadSavedAccounts } = useSavedAccounts()
const token = computed(() => (route.query.token as string) || '')

const submitting = ref(false)
const confirmed = ref(false)
const errorMsg = ref('')

onMounted(() => {
  loadSavedAccounts()
})

async function confirmLogin() {
  if (!token.value) {
    errorMsg.value = 'ไม่พบรหัส Token ของ QR Code'
    return
  }

  submitting.value = true
  errorMsg.value = ''

  try {
    const res: any = await $fetch('/api/auth/qr/confirm', {
      method: 'POST',
      body: { token: token.value }
    })

    if (res.success) {
      confirmed.value = true
    } else {
      errorMsg.value = res.message || 'เกิดข้อผิดพลาดในการยืนยัน'
    }
  } catch (err: any) {
    errorMsg.value = err.data?.message || err.message || 'QR Code หมดอายุหรือไม่ถูกต้อง'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.qr-auth-root {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #09090b;
  color: #f4f4f5;
  padding: 24px;
  position: relative;
  overflow: hidden;
  font-family: inherit;
}

.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.4;
}

.orb-purple {
  width: 400px;
  height: 400px;
  background: #7c3aed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
}

.orb-indigo {
  width: 350px;
  height: 350px;
  background: #4f46e5;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
}

.qr-auth-card {
  width: 100%;
  max-width: 420px;
  background: rgba(24, 24, 27, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  padding: 36px 28px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-badge-center {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.logo-icon-glass {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2));
  border: 1px solid rgba(167, 139, 250, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
}

.brand-text {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.brand-text .highlight {
  color: #8b5cf6;
}

.auth-state-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.state-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.state-icon-circle.success-pulse {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.25);
}

.state-icon-circle.brand-glow {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.25);
}

.device-sync-visual {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 14px 20px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.device-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4d4d8;
}

.sync-beam-arrow {
  animation: pulseArrow 1.5s infinite ease-in-out;
}

@keyframes pulseArrow {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15) translateX(3px); opacity: 1; }
}

.auth-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: #a1a1aa;
  margin: 0 0 24px;
  line-height: 1.5;
}

.user-confirm-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
  text-align: left;
}

.user-avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.user-avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-handle {
  font-size: 13px;
  color: #a1a1aa;
}

.error-pill-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 100px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
  font-size: 13px;
  margin-bottom: 20px;
}

.actions-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary-gradient {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  border-radius: 100px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.btn-primary-gradient:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-secondary-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px 24px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.06);
  color: #e4e4e7;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.btn-secondary-glass:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.btn-ghost-cancel {
  padding: 10px;
  color: #71717a;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-ghost-cancel:hover {
  color: #d4d4d8;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
