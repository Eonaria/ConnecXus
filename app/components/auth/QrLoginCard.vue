<template>
  <div class="qr-login-container">
    
    <!-- QR Code Scanner Stage Card -->
    <div class="qr-stage-card">
      
      <!-- Top Status & Network Badge -->
      <div class="qr-network-header">
        <div class="network-pulse-pill" :class="{ ready: qrData?.network_url, error: errorState }">
          <span class="status-dot"></span>
          <span class="network-label">
            {{ qrData?.best_ip ? `เครือข่าย: ${qrData.best_ip}` : 'กำลังเชื่อมต่อเครือข่าย...' }}
          </span>
        </div>

        <button 
          @click="generateQR" 
          class="btn-refresh-qr" 
          :disabled="loading"
          title="รีเฟรช QR Code"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{ 'spin-anim': loading }">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>รีเฟรช</span>
        </button>
      </div>

      <!-- Top QR Type Switcher (2 Modes) -->
      <div class="qr-type-switch-row">
        <button
          @click="changeQrType('mobile_instant')"
          class="btn-qr-type"
          :class="{ active: qrType === 'mobile_instant' }"
          title="สแกนเพื่อเข้าสู่ระบบบนมือถือทันที"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <span>เข้ามือถือด่วน</span>
        </button>

        <button
          @click="changeQrType('sync')"
          class="btn-qr-type"
          :class="{ active: qrType === 'sync' }"
          title="สแกนด้วยมือถือเพื่อเข้าสู่ระบบบน PC"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>เข้า PC ด่วน</span>
        </button>
      </div>

      <!-- Account Selector for Mobile Instant Login -->
      <div v-if="qrType === 'mobile_instant' && savedAccounts.length > 0" class="mobile-target-user-box">
        <span class="target-label">เลือกบัญชีที่จะส่งเข้ามือถือ:</span>
        <div class="target-accounts-chips">
          <button
            v-for="acc in savedAccounts"
            :key="acc.id"
            @click="selectTargetAccount(acc)"
            class="target-acc-chip"
            :class="{ active: targetAccount?.id === acc.id }"
          >
            <div class="chip-avatar">
              <img v-if="acc.avatar_url" :src="acc.avatar_url" :alt="acc.username" />
              <span v-else>{{ (acc.display_name || acc.username).charAt(0).toUpperCase() }}</span>
            </div>
            <span class="chip-name">{{ acc.display_name || acc.username }}</span>
          </button>
        </div>
      </div>

      <!-- Center QR Frame with Cyberpunk Laser & Corners -->
      <div class="qr-frame-wrapper">
        <!-- 4 Corner Brackets -->
        <div class="corner-bracket top-left"></div>
        <div class="corner-bracket top-right"></div>
        <div class="corner-bracket bottom-left"></div>
        <div class="corner-bracket bottom-right"></div>

        <!-- Laser Scanline -->
        <div v-if="!loading && !confirmed && !expired" class="laser-scan-line"></div>

        <!-- QR Canvas / Image Stage -->
        <div class="qr-canvas-box">
          <!-- Loading Spinner -->
          <div v-if="loading" class="qr-state-placeholder">
            <div class="spinner-neon"></div>
            <span>กำลังสร้าง QR Code...</span>
          </div>

          <!-- Expired State -->
          <div v-else-if="expired" class="qr-state-placeholder expired" @click="generateQR">
            <div class="expired-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/>
              </svg>
            </div>
            <span class="expired-title">QR Code หมดอายุ</span>
            <span class="expired-btn-text">คลิกเพื่อโหลดใหม่</span>
          </div>

          <!-- Error / Disconnected State -->
          <div v-else-if="errorState" class="qr-state-placeholder expired" @click="generateQR">
            <div class="expired-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <span class="expired-title" style="color: #ef4444;">ไม่สามารถโหลด QR Code</span>
            <span class="expired-btn-text">แตะเพื่อลองใหม่</span>
          </div>

          <!-- Confirmed Success State for Mobile Instant Mode -->
          <div v-else-if="confirmed && qrType === 'mobile_instant'" class="qr-state-placeholder success">
            <div class="success-icon-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span class="success-title">เข้ามือถือสำเร็จ!</span>
            <span class="success-subtitle">มือถือของคุณเข้าสู่ระบบในชื่อ @{{ targetAccount?.username || 'คุณ' }} เรียบร้อยแล้ว</span>
            <button @click="generateQR" class="btn-new-qr-mini">
              สร้าง QR สแกนใหม่
            </button>
          </div>

          <!-- Confirmed Success State for PC Sync Mode -->
          <div v-else-if="confirmed" class="qr-state-placeholder success">
            <div class="success-icon-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span class="success-title">เข้าสู่ระบบสำเร็จ!</span>
            <span class="success-subtitle">กำลังพาท่านเข้าสู่ระบบ...</span>
          </div>

          <!-- Active QR Image Display -->
          <template v-else-if="qrImage">
            <div class="qr-white-card">
              <img :src="qrImage" alt="QR Code Login" class="qr-image-render" />
            </div>
          </template>
        </div>
      </div>

      <!-- Target Account Badge Info in Mobile Instant Mode -->
      <div v-if="qrType === 'mobile_instant' && targetAccount" class="instant-account-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>สแกนเพื่อเข้าสู่ระบบในชื่อ <strong>@{{ targetAccount.username }}</strong></span>
      </div>

      <!-- Network URL Direct Access Pill & Copy -->
      <div v-if="currentQrUrl" class="qr-link-copy-box">
        <div class="url-display-text" :title="currentQrUrl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <span class="url-str">{{ currentQrUrl }}</span>
        </div>
        <button @click="copyUrl" class="btn-copy-url" :class="{ copied }">
          <template v-if="copied">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>คัดลอกแล้ว!</span>
          </template>
          <template v-else>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>คัดลอกลิงก์</span>
          </template>
        </button>
      </div>

      <!-- Alternative Network IP Selection -->
      <div v-if="qrData?.all_ips && qrData.all_ips.length > 1" class="multi-ip-row">
        <span class="ip-select-label">เลือก IP Wi-Fi/LAN (ให้ตรงกับ Wi-Fi ที่มือถือเชื่อมต่อ):</span>
        <div class="ip-chips-wrap">
          <button
            v-for="net in qrData.all_ips"
            :key="net.ip"
            @click="selectIp(net.ip)"
            class="ip-chip-btn"
            :class="{ active: currentIp === net.ip }"
          >
            {{ net.ip }} ({{ net.name }})
          </button>
        </div>
      </div>

      <!-- Instructions List (Dynamic based on Mode) -->
      <div class="qr-steps-list">
        <template v-if="qrType === 'mobile_instant'">
          <div class="qr-step-item">
            <div class="step-num">1</div>
            <div class="step-text">ต่อ <strong>Wi-Fi เดียวกัน</strong> กับเครื่องคอมพิวเตอร์</div>
          </div>
          <div class="qr-step-item">
            <div class="step-num">2</div>
            <div class="step-text">เปิด <strong>กล้องมือถือ</strong> หรือ Google Lens / LINE เพื่อสแกน QR Code</div>
          </div>
          <div class="qr-step-item">
            <div class="step-num">3</div>
            <div class="step-text">แตะลิงก์เพื่อ <strong>เข้าสู่ระบบบนมือถือทันที</strong> (เข้ามือถือเท่านั้น ไม่กระทบ PC)</div>
          </div>
        </template>
        <template v-else>
          <div class="qr-step-item">
            <div class="step-num">1</div>
            <div class="step-text">ต่อ <strong>Wi-Fi เดียวกัน</strong> กับเครื่องคอมพิวเตอร์</div>
          </div>
          <div class="qr-step-item">
            <div class="step-num">2</div>
            <div class="step-text">ใช้ <strong>มือถือที่ล็อกอินอยู่</strong> เปิดกล้องสแกน QR Code</div>
          </div>
          <div class="qr-step-item">
            <div class="step-num">3</div>
            <div class="step-text">กดยืนยันบนมือถือ เพื่อให้ <strong>คอมพิวเตอร์เครื่องนี้เข้าสู่ระบบ</strong></div>
          </div>
        </template>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import type { SavedAccount } from '~/composables/useSavedAccounts'

const emit = defineEmits(['logged-in'])
const { user, fetchUser } = useAuth()
const { savedAccounts, loadSavedAccounts } = useSavedAccounts()
const router = useRouter()

const loading = ref(true)
const expired = ref(false)
const confirmed = ref(false)
const copied = ref(false)
const errorState = ref(false)
const qrImage = ref('')
const qrData = ref<any>(null)
const currentIp = ref('')
const qrType = ref<'mobile_instant' | 'sync'>(user.value ? 'mobile_instant' : 'sync')
const targetAccount = ref<SavedAccount | any>(null)

const currentQrUrl = computed(() => {
  if (!qrData.value) return ''
  const port = qrData.value.port || 3000
  const ip = currentIp.value || qrData.value.best_ip || 'localhost'
  const baseUrl = `http://${ip}:${port}`

  if (qrType.value === 'mobile_instant') {
    return `${baseUrl}/api/auth/qr/mobile-login?token=${qrData.value.token}`
  }
  return `${baseUrl}/qr-auth?token=${qrData.value.token}`
})

let pollTimer: any = null
let expireTimer: any = null

function changeQrType(type: 'mobile_instant' | 'sync') {
  qrType.value = type
  generateQR()
}

function selectTargetAccount(acc: SavedAccount) {
  targetAccount.value = acc
  generateQR()
}

async function generateQR() {
  loading.value = true
  expired.value = false
  confirmed.value = false
  clearInterval(pollTimer)
  clearTimeout(expireTimer)

  try {
    let res: any = null
    if (qrType.value === 'mobile_instant') {
      const selectedId = targetAccount.value?.id || user.value?.id || savedAccounts.value[0]?.id
      const selectedUname = targetAccount.value?.username || user.value?.username || savedAccounts.value[0]?.username
      res = await $fetch('/api/auth/qr/mobile-instant-generate', {
        method: 'POST',
        body: { userId: selectedId, username: selectedUname }
      })
      if (res.target_user) {
        targetAccount.value = res.target_user
      }
    } else {
      res = await $fetch('/api/auth/qr/generate')
    }

    qrData.value = res
    currentIp.value = res.best_ip
    errorState.value = false

    await renderQRCode(currentQrUrl.value)

    // Set 5 minute expiration
    const timeLeft = res.expires_at - Date.now()
    expireTimer = setTimeout(() => {
      expired.value = true
      clearInterval(pollTimer)
    }, Math.max(timeLeft, 10000))

    // Start polling status every 1.5 seconds
    if (qrType.value !== 'mobile_direct') {
      startPolling(res.token)
    }
  } catch (err) {
    console.error('Failed to generate QR:', err)
    errorState.value = true
  } finally {
    loading.value = false
  }
}

async function renderQRCode(targetUrl: string) {
  try {
    // High-contrast Standard Dark-on-White for 100% Mobile Camera Compatibility
    const url = await QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#09090b',  // Pure deep black modules
        light: '#ffffff'  // Pure crisp white background
      },
      errorCorrectionLevel: 'M'
    })
    qrImage.value = url
  } catch (err) {
    console.error('QRCode render error:', err)
  }
}

function selectIp(ip: string) {
  if (!qrData.value) return
  currentIp.value = ip
  renderQRCode(currentQrUrl.value)
}

function startPolling(token: string) {
  pollTimer = setInterval(async () => {
    if (confirmed.value || expired.value) return

    try {
      const res: any = await $fetch(`/api/auth/qr/status?token=${token}`)
      if (res.status === 'confirmed') {
        confirmed.value = true
        clearInterval(pollTimer)

        if (res.type === 'mobile_instant') {
          // Mobile only — do not log in PC or redirect
          return
        }

        // PC Sync Auth Mode
        if (res.user && import.meta.client) {
          const { saveAccount } = useSavedAccounts()
          saveAccount(res.user)
        }
        
        // Refresh auth state in client
        if (typeof fetchUser === 'function') {
          await fetchUser()
        }
        emit('logged-in', res.user)

        setTimeout(() => {
          router.push('/')
        }, 1200)
      } else if (res.status === 'expired') {
        expired.value = true
        clearInterval(pollTimer)
      }
    } catch (err) {
      // Continue polling
    }
  }, 1500)
}

async function copyUrl() {
  if (!currentQrUrl.value) return
  await copyToClipboard(currentQrUrl.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2500)
}

onMounted(() => {
  generateQR()
})

onUnmounted(() => {
  clearInterval(pollTimer)
  clearTimeout(expireTimer)
})
</script>

<style scoped>
.qr-login-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-stage-card {
  width: 100%;
  background: rgba(19, 17, 39, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 20px;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
}

/* Network Header */
.qr-network-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.network-pulse-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11.5px;
  color: var(--text-secondary, #cbd5e1);
  font-weight: 600;
}

.network-pulse-pill .status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.3s ease;
}

.network-pulse-pill.ready .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulseGreen 2s infinite;
}

.network-pulse-pill.error .status-dot {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes pulseGreen {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.btn-refresh-qr {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c4b5fd;
  border-radius: 100px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-refresh-qr:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.28);
  color: #fff;
  border-color: rgba(167, 139, 250, 0.6);
  transform: translateY(-1px);
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}

/* QR Type Switcher */
.qr-type-switch-row {
  display: flex;
  width: 100%;
  background: var(--bg-tertiary, rgba(0, 0, 0, 0.3));
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.08));
  border-radius: 10px;
  padding: 2px;
  margin-bottom: 12px;
  gap: 3px;
}

.btn-qr-type {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-qr-type:hover {
  color: var(--text-primary, #fff);
  background: var(--bg-hover, rgba(255, 255, 255, 0.05));
}

.btn-qr-type.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.45));
  border: 1px solid rgba(167, 139, 250, 0.5);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* Mobile Target User Chips */
.mobile-target-user-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
}

.target-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.target-accounts-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.target-acc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  border-radius: 100px;
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
}

.target-acc-chip:hover {
  background: var(--bg-hover);
  border-color: var(--brand);
}

.target-acc-chip.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.chip-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--brand-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.chip-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instant-account-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 100px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  font-size: 11.5px;
  margin-bottom: 10px;
  text-align: center;
}

.instant-account-indicator strong {
  color: #34d399;
}

.btn-new-qr-mini {
  margin-top: 8px;
  padding: 5px 14px;
  border-radius: 100px;
  background: var(--brand-gradient);
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-new-qr-mini:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* Center QR Frame with Cyberpunk Accents */
.qr-frame-wrapper {
  position: relative;
  width: 175px;
  height: 175px;
  padding: 5px;
  border-radius: 16px;
  background: #ffffff;
  border: 2.5px solid rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.3), 0 8px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 10px;
}

/* 4 Corner Brackets */
.corner-bracket {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #8b5cf6;
  border-style: solid;
  pointer-events: none;
  z-index: 5;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
}

.corner-bracket.top-left {
  top: -2px;
  left: -2px;
  border-width: 3px 0 0 3px;
  border-top-left-radius: 8px;
}

.corner-bracket.top-right {
  top: -2px;
  right: -2px;
  border-width: 3px 3px 0 0;
  border-top-right-radius: 8px;
}

.corner-bracket.bottom-left {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 3px 3px;
  border-bottom-left-radius: 8px;
}

.corner-bracket.bottom-right {
  bottom: -2px;
  right: -2px;
  border-width: 0 3px 3px 0;
  border-bottom-right-radius: 8px;
}

/* Laser Scan Line */
.laser-scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2.5px;
  background: linear-gradient(90deg, transparent 0%, #8b5cf6 20%, #d946ef 50%, #8b5cf6 80%, transparent 100%);
  box-shadow: 0 0 12px #d946ef, 0 0 20px #8b5cf6;
  z-index: 6;
  pointer-events: none;
  animation: laserScan 2.4s ease-in-out infinite alternate;
}

@keyframes laserScan {
  0% { top: 6px; opacity: 0.8; }
  50% { opacity: 1; }
  100% { top: calc(100% - 9px); opacity: 0.8; }
}

.qr-canvas-box {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 12px;
}

.qr-white-card {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 12px;
}

.qr-image-render {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
  display: block;
}

.qr-state-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 600;
  padding: 12px;
}

.qr-state-placeholder.expired {
  cursor: pointer;
  color: #f87171;
}

.expired-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
}

.expired-title {
  font-weight: 700;
  font-size: 13px;
}

.expired-btn-text {
  font-size: 11.5px;
  color: #94a3b8;
  text-decoration: underline;
}

.qr-state-placeholder.success {
  color: #10b981;
}

.success-icon-circle {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.3);
}

.success-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #fff;
}

.success-subtitle {
  font-size: 11.5px;
  color: #a7f3d0;
}

.spinner-neon {
  width: 28px;
  height: 28px;
  border: 2.5px solid rgba(139, 92, 246, 0.2);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Link Copy Box */
.qr-link-copy-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 6px 10px;
  margin-bottom: 10px;
}

.url-display-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e2e8f0;
  font-size: 11.5px;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.url-str {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-copy-url {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-copy-url:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-copy-url.copied {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

/* Multi-IP Selection */
.multi-ip-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.ip-select-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
}

.ip-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ip-chip-btn {
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: monospace;
}

.ip-chip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.ip-chip-btn.active {
  background: rgba(139, 92, 246, 0.25);
  border-color: #8b5cf6;
  color: #c4b5fd;
  font-weight: 700;
}

/* Steps List */
.qr-steps-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
}

.qr-step-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
  font-size: 10.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-text {
  font-size: 11.5px;
  color: var(--text-secondary, #cbd5e1);
  line-height: 1.35;
  text-align: left;
}

.step-text strong {
  color: #fff;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
