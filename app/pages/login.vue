<template>
  <div class="login-page-root">
    <!-- Ambient Background Lighting Orbs -->
    <div class="ambient-orbs-container">
      <div class="orb orb-purple-top" />
      <div class="orb orb-indigo-bottom" />
      <div class="orb orb-blue-center" />
      <div class="grid-overlay" />
    </div>

    <!-- ══════════════════════════════════════════
         LEFT — Hero Brand Panel
    ══════════════════════════════════════════ -->
    <div class="login-brand-panel">
      <!-- Logo Header -->
      <div class="brand-logo-row">
        <NuxtLink to="/" class="brand-logo-link">
          <div class="logo-icon-glass">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <span class="brand-name-text">
            Connec<span class="brand-x-highlight">X</span>us
          </span>
        </NuxtLink>
      </div>

      <!-- Network Graphic Visualizer -->
      <div class="brand-visualizer-container">
        <NetworkAnimation />
      </div>

      <!-- Bottom Tagline & Feature Badges -->
      <div class="brand-bottom-content">
        <div class="brand-badge-pill">
          <span class="badge-dot"></span>
          <span>Next-Gen Social Network</span>
        </div>

        <h2 class="brand-main-heading">
          ทุกการเชื่อมต่อ<br>
          <span class="gradient-text">ในที่เดียว</span>
        </h2>

        <p class="brand-subtext">
          รวมแชท ฟีดข่าว และคอมมูนิตี้ที่คุณสนใจไว้ในระบบเดียว ปลอดภัย รวดเร็ว และลื่นไหลที่สุด
        </p>

        <!-- Feature Chips -->
        <div class="brand-features-row">
          <div class="feature-chip">
            <span class="chip-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </span>
            <span>Real-time Sync</span>
          </div>
          <div class="feature-chip">
            <span class="chip-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span>End-to-End Security</span>
          </div>
          <div class="feature-chip">
            <span class="chip-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span>Direct & Group Chat</span>
          </div>
        </div>

        <div class="brand-tech-meta">
          <span>SECURE LOGIN · 2026 EDITION</span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         RIGHT — Login Form Glass Card Panel
    ══════════════════════════════════════════ -->
    <div class="login-form-panel">
      <div class="glass-form-card">
        
        <!-- Welcome Pill -->
        <div class="form-header-badge">
          <div class="badge-accent-bar" />
          <span class="badge-text">ยินดีต้อนรับกลับ</span>
        </div>

        <!-- Heading -->
        <h1 class="form-title">
          เข้าสู่ระบบ
        </h1>
        <p class="form-subtitle">
          เข้าใช้งาน ConnecXus เพื่อเชื่อมต่อกับเพื่อนและคอมมูนิตี้ของคุณ
        </p>

        <!-- Ban Notification Banner -->
        <div v-if="banData" class="alert-glass-box error ban-notification-box">
          <div class="alert-title-row">
            <div class="ban-icon-pill" :class="banData.type">
              <svg v-if="banData.type === 'suspended'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
            </div>
            <span class="ban-type-title">
              {{ banData.type === 'suspended' ? 'บัญชีของคุณถูกระงับชั่วคราว' : 'บัญชีของคุณถูกแบนถาวร' }}
            </span>
          </div>

          <!-- Reason -->
          <div v-if="banData.reason" class="ban-reason-row">
            <span class="reason-label">เหตุผล:</span>
            <span class="reason-val">{{ banData.reason }}</span>
          </div>

          <!-- Ban Timestamps Card -->
          <div class="ban-info-grid">
            <!-- 1. วันเวลาที่ถูกระงับ -->
            <div v-if="banData.banned_at" class="ban-info-item">
              <div class="ban-info-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>วันเวลาที่ถูกระงับ:</span>
              </div>
              <div class="ban-info-value">
                {{ formatThaiDate(banData.banned_at) }}
              </div>
            </div>

            <!-- 2. วันเวลาที่จะถูกปลดแบน (กรณีชั่วคราว) -->
            <div v-if="banData.type === 'suspended' && banData.until" class="ban-info-item">
              <div class="ban-info-label text-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>วันเวลาที่จะถูกปลดแบน:</span>
              </div>
              <div class="ban-info-value highlight-success">
                {{ formatThaiDate(banData.until) }}
              </div>
            </div>
          </div>

          <!-- 3. Real-time Live Countdown Ticker -->
          <div v-if="banData.type === 'suspended' && banData.until" class="live-countdown-container">
            <div class="countdown-header">
              <div class="live-pulse-dot" :class="{ 'is-expired': isBanExpired }"></div>
              <span>เวลานับถอยหลังปลดระงับ (เรียลไทม์):</span>
            </div>
            
            <div class="countdown-digits-box" :class="{ 'is-expired': isBanExpired }">
              <template v-if="!isBanExpired">
                <div v-if="countdownParts.days > 0" class="time-segment">
                  <span class="num">{{ countdownParts.days }}</span>
                  <span class="unit">วัน</span>
                </div>
                <div class="time-segment">
                  <span class="num">{{ String(countdownParts.hours).padStart(2, '0') }}</span>
                  <span class="unit">ชม.</span>
                </div>
                <span class="colon">:</span>
                <div class="time-segment">
                  <span class="num">{{ String(countdownParts.minutes).padStart(2, '0') }}</span>
                  <span class="unit">นาที</span>
                </div>
                <span class="colon">:</span>
                <div class="time-segment">
                  <span class="num highlight-sec">{{ String(countdownParts.seconds).padStart(2, '0') }}</span>
                  <span class="unit">วินาที</span>
                </div>
              </template>
              <template v-else>
                <div class="expired-banner">
                  ครบกำหนดเวลาการระงับแล้ว สามารถเข้าสู่ระบบได้ทันที!
                </div>
              </template>
            </div>
          </div>

          <!-- Permanent Ban Notice -->
          <div v-else-if="banData.type !== 'suspended'" class="permanent-ban-card">
            <div style="display: flex; align-items: flex-start; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0; margin-top:2px;">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>การระงับนี้มีผลถาวร หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ</span>
            </div>
          </div>
        </div>

        <!-- Success Notification Banner -->
        <div v-if="successMsg && !errorMsg && !banData" class="alert-glass-box success">
          <div class="alert-title-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{{ successMsg }}</span>
          </div>
        </div>

        <!-- Error Notification Banner -->
        <div v-if="errorMsg" class="alert-glass-box error animate-shake">
          <div class="alert-title-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMsg }}</span>
          </div>
        </div>

        <!-- Auth Method Selector Tabs -->
        <div class="auth-tabs-segmented">
          <button 
            v-if="savedAccounts.length > 0"
            type="button" 
            @click="authMode = 'saved'; selectedAccount = null" 
            class="auth-tab-btn" 
            :class="{ active: authMode === 'saved' }"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="tab-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>เลือกบัญชี</span>
            <span class="tab-count-pill">{{ savedAccounts.length }}</span>
          </button>

          <button 
            type="button" 
            @click="authMode = 'password'" 
            class="auth-tab-btn" 
            :class="{ active: authMode === 'password' }"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="tab-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>รหัสผ่าน</span>
          </button>

          <button 
            type="button" 
            @click="authMode = 'qr'" 
            class="auth-tab-btn" 
            :class="{ active: authMode === 'qr' }"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="tab-icon">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>สแกน QR</span>
          </button>
        </div>

        <!-- Mode 1: Saved Accounts Picker (Sign in as) -->
        <div v-if="authMode === 'saved'" class="saved-accounts-section">
          <div class="saved-accounts-top-bar">
            <div class="signin-as-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Sign in as</span>
            </div>
            <span class="saved-desc-hint">แตะบัญชีเพื่อเข้าสู่ระบบทันที</span>
          </div>

          <div class="saved-accounts-list">
            <div
              v-for="acc in savedAccounts"
              :key="acc.id"
              class="saved-account-card"
              @click="selectAccount(acc)"
            >
              <!-- Avatar -->
              <div class="saved-account-avatar">
                <img v-if="acc.avatar_url" :src="acc.avatar_url" :alt="acc.display_name" />
                <span v-else>{{ (acc.display_name || acc.username || '?').charAt(0).toUpperCase() }}</span>
                <div class="online-indicator"></div>
              </div>

              <!-- Details -->
              <div class="saved-account-info">
                <div class="saved-account-name-row">
                  <span class="saved-account-name">{{ acc.display_name || acc.username }}</span>
                  <span v-if="acc.role === 'admin'" class="badge-role admin">Admin</span>
                </div>
                <span class="saved-account-handle">@{{ acc.username }}</span>
              </div>

              <!-- Quick Arrow / Action -->
              <div class="saved-account-action">
                <button 
                  type="button" 
                  @click.stop="removeAccount(acc.id)" 
                  class="btn-remove-saved"
                  title="นำบัญชีนี้ออกจากเครื่องนี้"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <div class="arrow-select-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Secondary Actions in Saved Mode -->
          <div class="saved-accounts-actions-stack">
            <button
              type="button"
              @click="chooseAnotherAccount"
              class="btn-use-another-account"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <span>เข้าสู่ระบบด้วยบัญชีอื่น</span>
            </button>
          </div>
        </div>

        <!-- Mode 2: QR Code Login -->
        <div v-else-if="authMode === 'qr'" class="qr-mode-wrapper">
          <QrLoginCard />
        </div>

        <!-- Mode 3: Traditional Password Login Form -->
        <form v-else @submit.prevent="handleLogin" method="post" class="form-fields-stack" novalidate>

          <!-- Selected Account Header Capsule (if chosen from saved accounts) -->
          <div v-if="selectedAccount" class="selected-account-banner">
            <div class="selected-account-left">
              <div class="selected-account-avatar">
                <img v-if="selectedAccount.avatar_url" :src="selectedAccount.avatar_url" :alt="selectedAccount.display_name" />
                <span v-else>{{ (selectedAccount.display_name || selectedAccount.username).charAt(0).toUpperCase() }}</span>
              </div>
              <div class="selected-account-text">
                <span class="name">{{ selectedAccount.display_name || selectedAccount.username }}</span>
                <span class="handle">@{{ selectedAccount.username }}</span>
              </div>
            </div>

            <button
              type="button"
              @click="switchBackToSaved"
              class="btn-switch-account-link"
            >
              สลับบัญชี
            </button>
          </div>

          <!-- Identifier (Username or Email) — Only show if not pre-selected -->
          <div v-if="!selectedAccount" class="form-group">
            <label class="form-label" for="username">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <div class="input-relative-wrap">
              <div class="input-lead-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input
                v-model="form.identifier"
                type="text"
                name="username"
                id="username"
                placeholder="ชื่อผู้ใช้, อีเมลหลัก หรือ อีเมลสำรอง"
                autocomplete="off"
                data-lpignore="true"
                class="glass-input with-icon"
                :class="{ 'has-error': errors.identifier }"
                @input="errors.identifier = ''; if (errorMsg) errorMsg = ''"
              />
            </div>
            <p v-if="errors.identifier" class="field-error-text">
              {{ errors.identifier }}
            </p>
          </div>

          <!-- Password -->
          <div class="form-group">
            <div class="label-row-between">
              <label class="form-label" for="password">
                รหัสผ่าน
              </label>
            </div>
            <div class="input-relative-wrap">
              <div class="input-lead-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                id="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="glass-input with-icon with-trail"
                :class="{ 'has-error': errors.password }"
                @input="errors.password = ''; if (errorMsg) errorMsg = ''"
              />
              <!-- Toggle Password Visibility -->
              <button
                type="button"
                @click.stop.prevent="togglePassword"
                class="btn-toggle-eye"
                :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                tabindex="-1"
              >
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="field-error-text">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit-glow"
            :disabled="loading"
            id="login-submit"
          >
            <span v-if="!loading" class="btn-content">
              <span>เข้าสู่ระบบ</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <span v-else class="btn-loading-content">
              <div class="spinner-dot-ring"></div>
              <span>กำลังเข้าสู่ระบบ...</span>
            </span>
          </button>

        </form>

        <!-- Switch to Register Link -->
        <div class="form-footer-switch">
          <span>ยังไม่มีบัญชีใช่ไหม?</span>
          <NuxtLink to="/register" class="link-switch-auth">
            สมัครสมาชิกฟรี
          </NuxtLink>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: [],
})

useHead({
  title: 'เข้าสู่ระบบ — ConnecXus',
  meta: [{ name: 'description', content: 'เข้าใช้งาน ConnecXus ด้วยบัญชีของคุณ' }],
})

const { login } = useAuth()
const toast = useToast()
const { savedAccounts, loadSavedAccounts, removeAccount } = useSavedAccounts()
import QrLoginCard from '~/components/auth/QrLoginCard.vue'
import SignInAsModal from '~/components/auth/SignInAsModal.vue'
import type { SavedAccount } from '~/composables/useSavedAccounts'

const route = useRoute()
const authMode = ref<'saved' | 'password' | 'qr'>('password')
const selectedAccount = ref<SavedAccount | null>(null)
const showSignInAsModal = ref(false)

const form = reactive({
  identifier: '',
  password: '',
})

const errors = reactive({
  identifier: '',
  password: '',
})

const errorMsg = ref('')
const successMsg = ref('')
const banData = ref<any>(null)
const loading = ref(false)
const showPassword = ref(false)

function selectAccount(acc: SavedAccount) {
  selectedAccount.value = acc
  form.identifier = acc.username
  form.password = ''
  errors.identifier = ''
  errors.password = ''
  authMode.value = 'password'
  nextTick(() => {
    document.getElementById('password')?.focus()
  })
}

function chooseAnotherAccount() {
  selectedAccount.value = null
  form.identifier = ''
  form.password = ''
  errors.identifier = ''
  errors.password = ''
  authMode.value = 'password'
  nextTick(() => {
    document.getElementById('username')?.focus()
  })
}

function switchBackToSaved() {
  selectedAccount.value = null
  form.identifier = ''
  form.password = ''
  errors.identifier = ''
  errors.password = ''
  authMode.value = 'saved'
}

function togglePassword() {
  const el = document.getElementById('password') as HTMLInputElement | null
  if (el && el.value && (!form.password || form.password !== el.value)) {
    form.password = el.value
  }
  showPassword.value = !showPassword.value
  nextTick(() => {
    if (el) {
      el.focus()
      const len = el.value.length
      el.setSelectionRange(len, len)
    }
  })
}

const currentTime = ref(Date.now())
let countdownTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  const loaded = loadSavedAccounts()

  if (route.query.mode === 'qr') {
    authMode.value = 'qr'
  } else if (route.query.registered || route.query.banned || route.query.u) {
    authMode.value = 'password'
  } else if (loaded.length > 0) {
    authMode.value = 'saved'
  } else {
    authMode.value = 'password'
  }

  if (route.query.banned) {
    errorMsg.value = 'บัญชีของคุณถูกระงับและคุณถูกออกจากระบบอัตโนมัติ'
  }
  if (route.query.registered) {
    successMsg.value = 'สร้างบัญชีสำเร็จเรียบร้อย! กรุณาเข้าสู่ระบบด้วยรหัสผ่านของคุณ'
    authMode.value = 'password'
    nextTick(() => {
      document.getElementById('password')?.focus()
    })
  }
  if (route.query.u && typeof route.query.u === 'string') {
    form.identifier = route.query.u
  }
  // Start 1-second live countdown ticker
  countdownTimer = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

const countdownParts = computed(() => {
  if (!banData.value?.until) return { days: 0, hours: 0, minutes: 0, seconds: 0, diff: 0 }
  const target = new Date(banData.value.until).getTime()
  const diff = Math.max(0, target - currentTime.value)
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds, diff }
})

const isBanExpired = computed(() => {
  if (!banData.value?.until) return false
  return new Date(banData.value.until).getTime() <= currentTime.value
})

function formatThaiDate(dateStr: string | null | undefined) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok'
  })
}

function validate() {
  errors.identifier = ''
  errors.password = ''
  let valid = true

  if (!form.identifier.trim()) {
    errors.identifier = 'กรุณากรอกชื่อผู้ใช้หรืออีเมล'
    valid = false
  }

  if (!form.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน'
    valid = false
  }

  return valid
}

async function handleLogin() {
  errorMsg.value = ''
  successMsg.value = ''
  banData.value = null
  if (!validate()) {
    if (errors.identifier || errors.password) {
      errorMsg.value = errors.identifier || errors.password
    }
    return
  }

  loading.value = true
  try {
    await login(form.identifier.trim(), form.password)

    // ── Store credentials so browser offers "Save Password?" if not yet saved ──
    if (typeof window !== 'undefined' && 'credentials' in navigator) {
      try {
        // @ts-ignore
        if (typeof PasswordCredential !== 'undefined') {
          // @ts-ignore
          const cred = new PasswordCredential({
            id: form.identifier.trim(),
            password: form.password,
          })
          await navigator.credentials.store(cred)
        }
      } catch (_e) {
        // Silently ignore
      }
    }

    if (route.query.returnTo === 'qr-auth' && route.query.token) {
      await navigateTo(`/qr-auth?token=${route.query.token}`)
    } else {
      await navigateTo('/')
    }
  } catch (err: any) {
    successMsg.value = ''
    const banObj = err?.data?.data?.ban || err?.data?.data
    if (banObj && (banObj.type === 'banned' || banObj.type === 'permanent' || banObj.type === 'suspended')) {
      banData.value = banObj
      errorMsg.value = ''
    } else {
      banData.value = null
      const msg = err?.data?.message || err?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
      errorMsg.value = msg
      errors.password = 'รหัสผ่านไม่ถูกต้อง'
      try {
        toast.add({
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          description: msg,
          icon: 'i-heroicons-exclamation-circle-solid',
          color: 'red'
        })
      } catch {}
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animate-shake {
  animation: loginShake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes loginShake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(3px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
  40%, 60% { transform: translate3d(5px, 0, 0); }
}

/* ══════════════════════════════════════════
   ROOT CONTAINER & ATMOSPHERE
══════════════════════════════════════════ */
.login-page-root {
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
  font-family: inherit;
}

/* Ambient Lighting Orbs */
.ambient-orbs-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.orb-purple-top {
  top: -160px;
  right: -100px;
  width: 650px;
  height: 650px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, transparent 70%);
}

.orb-indigo-bottom {
  bottom: -200px;
  left: -150px;
  width: 750px;
  height: 750px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, transparent 70%);
}

.orb-blue-center {
  top: 40%;
  left: 45%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--border-primary) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-primary) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.4;
}

/* ══════════════════════════════════════════
   LEFT BRAND HERO PANEL (DESKTOP)
══════════════════════════════════════════ */
.login-brand-panel {
  width: 44%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 48px 36px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-primary);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.brand-logo-row {
  position: relative;
  z-index: 2;
}

.brand-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon-glass {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--brand-light);
  border: 1px solid var(--brand);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  transition: transform 0.2s;
}

.brand-logo-link:hover .logo-icon-glass {
  transform: scale(1.08) rotate(-4deg);
}

.brand-name-text {
  font-size: 26px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  font-family: 'Inter', sans-serif;
}

.brand-x-highlight {
  color: #818cf8;
  background: linear-gradient(135deg, #818cf8, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-visualizer-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  position: relative;
  z-index: 2;
}

.brand-bottom-content {
  position: relative;
  z-index: 2;
}

.brand-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.brand-main-heading {
  font-size: 38px;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0 0 12px;
  letter-spacing: -1px;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtext {
  font-size: 14.5px;
  color: var(--text-secondary);
  margin: 0 0 24px;
  line-height: 1.6;
  max-width: 480px;
}

.brand-features-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.feature-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.chip-icon {
  font-size: 13px;
}

.brand-tech-meta {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 2px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

/* ══════════════════════════════════════════
   RIGHT FORM PANEL (AUTH CARD)
══════════════════════════════════════════ */
.login-form-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 20px;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-primary) transparent;
}

.login-form-panel::-webkit-scrollbar {
  width: 6px;
}

.login-form-panel::-webkit-scrollbar-track {
  background: transparent;
}

.login-form-panel::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 99px;
}

.glass-form-card {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 24px 24px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  box-sizing: border-box;
  margin: auto 0;
}

.form-header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.badge-accent-bar {
  width: 20px;
  height: 3px;
  border-radius: 99px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
}

.badge-text {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.form-title {
  font-size: 26px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 3px;
  letter-spacing: -0.5px;
  line-height: 1.15;
}

.form-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 14px;
  line-height: 1.4;
}

/* Alert Boxes */
.alert-glass-box {
  border-radius: 14px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 12.5px;
  line-height: 1.45;
}

.alert-glass-box.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
}

.alert-glass-box.error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #f87171;
}

.ban-notification-box {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.05) 100%) !important;
  border: 1px solid rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.12);
}

.alert-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 14.5px;
  margin-bottom: 8px;
}

.ban-icon-pill {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.18);
  color: #ef4444;
  flex-shrink: 0;
}

.ban-icon-pill.suspended {
  background: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
}

.ban-type-title {
  color: var(--text-primary);
  font-weight: 800;
  font-size: 15px;
}

.ban-reason-row {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 6px 10px;
  border-radius: 9px;
  margin-bottom: 8px;
  font-size: 12px;
  display: flex;
  gap: 6px;
}

.reason-label {
  font-weight: 700;
  color: #ef4444;
}

.reason-val {
  color: var(--text-primary);
  word-break: break-word;
}

/* Ban Timestamp Information Grid */
.ban-info-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.ban-info-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ban-info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-muted);
}

.ban-info-label.text-success {
  color: #10b981;
}

.ban-info-value {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
  padding-left: 18px;
}

.ban-info-value.highlight-success {
  color: #34d399;
}

/* Real-time Live Countdown Container */
.live-countdown-container {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 8px 10px;
}

.countdown-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #60a5fa;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
  animation: pulse-dot 1.5s infinite;
}

.live-pulse-dot.is-expired {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: none;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.countdown-digits-box {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px 10px;
  font-family: 'Inter', system-ui, monospace;
}

.countdown-digits-box.is-expired {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.time-segment {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.time-segment .num {
  font-size: 16px;
  font-weight: 800;
  color: #f8fafc;
}

.time-segment .num.highlight-sec {
  color: #38bdf8;
}

.time-segment .unit {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}

.colon {
  font-size: 14px;
  font-weight: 800;
  color: #64748b;
  margin: 0 1px;
}

.expired-banner {
  color: #10b981;
  font-size: 12.5px;
  font-weight: 700;
  text-align: center;
}

.permanent-ban-card {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.alert-body-text {
  color: var(--text-primary);
  margin-bottom: 2px;
}

.alert-footer-text {
  color: var(--text-secondary);
  font-size: 11.5px;
}

/* Auth Mode Segmented Tabs */
.auth-tabs-segmented {
  display: flex;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  padding: 3px;
  margin-bottom: 14px;
  gap: 3px;
}

.auth-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-count-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  line-height: 1.2;
}

.auth-tab-btn:not(.active) .tab-count-pill {
  background: var(--brand-light);
  color: var(--brand);
}

.auth-tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.auth-tab-btn.active {
  background: var(--brand-gradient);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.badge-hot {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 100px;
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  color: #fff;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qr-mode-wrapper {
  width: 100%;
}

/* ══════════════════════════════════════════
   SAVED ACCOUNTS PICKER (SIGN IN AS)
══════════════════════════════════════════ */
.saved-accounts-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.saved-accounts-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.signin-as-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--brand-light);
  border: 1px solid var(--brand);
  color: var(--brand);
  font-size: 11.5px;
  font-weight: 800;
}

.saved-desc-hint {
  font-size: 11.5px;
  color: var(--text-muted);
}

.saved-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.saved-account-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: 1.5px solid var(--border-primary);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  user-select: none;
}

.saved-account-card:hover {
  background: var(--bg-hover);
  border-color: var(--brand);
  transform: translateX(3px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
}

.saved-account-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
}

.saved-account-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--border-primary);
}

.saved-account-avatar span {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--brand-gradient);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.saved-account-avatar .online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10b981;
  border: 1.5px solid var(--bg-card);
}

.saved-account-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.saved-account-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.saved-account-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-role.admin {
  font-size: 9.5px;
  font-weight: 800;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 1px 5px;
  border-radius: 99px;
  text-transform: uppercase;
}

.saved-account-handle {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-account-action {
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow-select-icon {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.saved-account-card:hover .arrow-select-icon {
  color: var(--brand);
  transform: translateX(2px);
}

.btn-remove-saved {
  background: none;
  border: none;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  opacity: 0.6;
}

.btn-remove-saved:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: scale(1.1);
}

.saved-accounts-actions-stack {
  margin-top: 4px;
}

.btn-use-another-account {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  background: transparent;
  border: 1.5px dashed var(--border-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-use-another-account:hover {
  background: var(--bg-hover);
  border-color: var(--brand);
  color: var(--brand);
}

/* Selected Account Banner in Password Mode */
.selected-account-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  margin-bottom: 8px;
}

.selected-account-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.selected-account-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--brand-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.selected-account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selected-account-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.selected-account-text .name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-account-text .handle {
  font-size: 11.5px;
  color: var(--text-muted);
}

.btn-switch-account-link {
  background: none;
  border: none;
  color: var(--brand);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-switch-account-link:hover {
  background: var(--brand-light);
  text-decoration: underline;
}

/* Form Fields */
.form-fields-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.label-row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.input-relative-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.input-lead-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14.5px;
  outline: none;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.glass-input.with-icon {
  padding-left: 44px;
}

.glass-input.with-trail {
  padding-right: 44px;
}

.glass-input:focus {
  background: var(--bg-card);
  border-color: var(--brand);
  box-shadow: 0 0 0 3.5px var(--brand-light);
}

.glass-input.has-error {
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.btn-toggle-eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 20;
  pointer-events: auto;
  transition: color 0.15s, background 0.15s;
}

.btn-toggle-eye:hover {
  color: var(--brand);
  background: var(--bg-hover);
}

input::-ms-reveal,
input::-ms-clear {
  display: none !important;
}

.field-error-text {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #f87171;
}

/* Submit Button */
.btn-submit-glow {
  width: 100%;
  padding: 13px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 6px;
}

.btn-submit-glow:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.6);
  filter: brightness(1.1);
}

.btn-submit-glow:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
}

.btn-submit-glow:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-content,
.btn-loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner-dot-ring {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Form Footer */
.form-footer-switch {
  margin-top: 26px;
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.link-switch-auth {
  color: var(--brand);
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s;
}

.link-switch-auth:hover {
  color: var(--brand);
  text-decoration: underline;
}

/* ══════════════════════════════════════════
   RESPONSIVE DESIGN
══════════════════════════════════════════ */
@media (max-width: 960px) {
  .login-page-root {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .login-brand-panel {
    display: none !important;
  }

  .login-form-panel {
    width: 100%;
    padding: 32px 20px 60px;
    align-items: center;
  }

  .glass-form-card {
    padding: 32px 24px;
    border-radius: 22px;
  }

  .form-title {
    font-size: 28px;
  }
}
</style>