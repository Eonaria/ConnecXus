<template>
  <div class="register-page-root">
    <!-- Ambient Background Lighting Orbs -->
    <div class="ambient-orbs-container">
      <div class="orb orb-purple-left" />
      <div class="orb orb-indigo-right" />
      <div class="orb orb-blue-center" />
      <div class="grid-overlay" />
    </div>

    <!-- ══════════════════════════════════════════
         LEFT — Register Form Glass Card Panel
    ══════════════════════════════════════════ -->
    <div class="register-form-panel">
      <div class="glass-form-card">

        <!-- Welcome Pill -->
        <div class="form-header-badge">
          <div class="badge-accent-bar" />
          <span class="badge-text">เริ่มต้นใช้งาน</span>
        </div>

        <!-- Heading -->
        <h1 class="form-title">
          สร้างบัญชีใหม่
        </h1>
        <p class="form-subtitle">
          ใช้เวลาไม่ถึง 1 นาที แล้วเริ่มต้นเชื่อมต่อกับคอมมูนิตี้ได้ทันที
        </p>

        <!-- Error Notification Banner -->
        <div v-if="errorMsg" class="alert-glass-box error">
          <div class="alert-title-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ errorMsg }}</span>
          </div>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleRegister" method="post" class="form-fields-stack" novalidate>

          <!-- Display name -->
          <div class="form-group">
            <label class="form-label" for="name">
              ชื่อ-นามสกุล / ชื่อที่แสดง
            </label>
            <div class="input-relative-wrap">
              <div class="input-lead-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <input
                v-model="form.display_name"
                type="text"
                name="name"
                id="name"
                placeholder="เช่น สมชาย ใจดี"
                autocomplete="name"
                class="glass-input with-icon"
                :class="{ 'has-error': errors.display_name }"
              />
            </div>
            <p v-if="errors.display_name" class="field-error-text">
              {{ errors.display_name }}
            </p>
          </div>

          <!-- Username -->
          <div class="form-group">
            <label class="form-label" for="reg-username">
              ชื่อผู้ใช้ (Username)
            </label>
            <div class="input-relative-wrap">
              <div class="input-lead-icon">
                <span class="at-symbol">@</span>
              </div>
              <input
                v-model="form.username"
                type="text"
                name="username"
                id="reg-username"
                placeholder="username (A-Z, a-z, 0-9, _)"
                autocomplete="username"
                class="glass-input with-icon"
                :class="{ 'has-error': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="field-error-text">
              {{ errors.username }}
            </p>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="email">
              อีเมล
            </label>
            <div class="input-relative-wrap">
              <div class="input-lead-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <input
                v-model="form.email"
                type="email"
                name="email"
                id="email"
                placeholder="yourname@example.com"
                autocomplete="email"
                class="glass-input with-icon"
                :class="{ 'has-error': errors.email }"
                @input="onEmailInput"
              />
            </div>
            <p v-if="errors.email" class="field-error-text">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password + Confirm — side by side -->
          <div class="grid-two-cols">

            <!-- Password -->
            <div class="form-group">
              <label class="form-label" for="reg-password">
                รหัสผ่าน
              </label>
              <div class="input-relative-wrap">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  id="reg-password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="glass-input with-trail"
                  :class="{ 'has-error': errors.password }"
                />
                <button
                  type="button"
                  @click.stop.prevent="togglePassword1"
                  class="btn-toggle-eye"
                  :aria-label="showPassword ? 'ซ่อน' : 'แสดง'"
                  tabindex="-1"
                >
                  <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm password -->
            <div class="form-group">
              <label class="form-label" for="reg-confirm-password">
                ยืนยันรหัสผ่าน
              </label>
              <div class="input-relative-wrap">
                <input
                  v-model="form.confirm_password"
                  :type="showPassword2 ? 'text' : 'password'"
                  name="confirm_password"
                  id="reg-confirm-password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="glass-input with-trail"
                  :class="{ 'has-error': errors.confirm_password }"
                />
                <button
                  type="button"
                  @click.stop.prevent="togglePassword2"
                  class="btn-toggle-eye"
                  :aria-label="showPassword2 ? 'ซ่อน' : 'แสดง'"
                  tabindex="-1"
                >
                  <svg v-if="!showPassword2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>

          <!-- Password hint + error -->
          <p v-if="errors.password || errors.confirm_password" class="field-error-text" style="margin-top: -6px;">
            {{ errors.password || errors.confirm_password }}
          </p>
          <p v-else class="password-hint-text">
            ความยาวอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข
          </p>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit-glow"
            :disabled="loading"
            id="reg-submit"
          >
            <span v-if="!loading" class="btn-content">
              <span>สร้างบัญชีผู้ใช้</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
            <span v-else class="btn-loading-content">
              <div class="spinner-dot-ring"></div>
              <span>กำลังสร้างบัญชี...</span>
            </span>
          </button>

        </form>

        <!-- Switch to Login Link -->
        <div class="form-footer-switch">
          <span>มีบัญชีอยู่แล้วใช่ไหม?</span>
          <NuxtLink to="/login" class="link-switch-auth">
            เข้าสู่ระบบที่นี่
          </NuxtLink>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════
         RIGHT — Dark Branded Hero Panel
    ══════════════════════════════════════════ -->
    <div class="register-brand-panel">
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

      <!-- Network Animation Graphic -->
      <div class="brand-visualizer-container">
        <NetworkAnimation />
      </div>

      <!-- Bottom Tagline & Features -->
      <div class="brand-bottom-content">
        <div class="brand-badge-pill">
          <span class="badge-dot"></span>
          <span>Community Driven Platform</span>
        </div>

        <h2 class="brand-main-heading">
          บัญชีเดียว<br>
          <span class="gradient-text">เข้าถึงทุกชุมชน</span>
        </h2>

        <p class="brand-subtext">
          ค้นหาและเข้าร่วมกลุ่มที่คุณสนใจ แลกเปลี่ยนความคิดเห็น และสร้างมิตรภาพใหม่ได้ทันที
        </p>

        <!-- Feature Chips -->
        <div class="brand-features-row">
          <div class="feature-chip">
            <span class="chip-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </span>
            <span>Free to Join</span>
          </div>
          <div class="feature-chip">
            <span class="chip-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </span>
            <span>Discover Communities</span>
          </div>
          <div class="feature-chip">
            <span class="chip-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <span>Privacy Focused</span>
          </div>
        </div>

        <div class="brand-tech-meta">
          <span>JOIN OVER 10,000+ CREATORS · 2026</span>
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
  title: 'สมัครสมาชิก — ConnecXus',
  meta: [{ name: 'description', content: 'สร้างบัญชี ConnecXus และเริ่มต้นเชื่อมต่อกับชุมชนที่คุณสนใจ' }],
})

const { register, user } = useAuth()

const form = reactive({
  display_name: '',
  username: '',
  email: '',
  password: '',
  confirm_password: '',
})

const errors = reactive({
  display_name: '',
  username: '',
  email: '',
  password: '',
  confirm_password: '',
})

const errorMsg = ref('')
const loading = ref(false)
const showPassword = ref(false)
const showPassword2 = ref(false)

function togglePassword1() {
  const el = document.getElementById('reg-password') as HTMLInputElement | null
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

function togglePassword2() {
  const el = document.getElementById('reg-confirm-password') as HTMLInputElement | null
  if (el && el.value && (!form.confirm_password || form.confirm_password !== el.value)) {
    form.confirm_password = el.value
  }
  showPassword2.value = !showPassword2.value
  nextTick(() => {
    if (el) {
      el.focus()
      const len = el.value.length
      el.setSelectionRange(len, len)
    }
  })
}

function onEmailInput() {
  if (/[\u0E00-\u0E7F]/.test(form.email) || /[^\x00-\x7F]/.test(form.email)) {
    errors.email = 'อีเมลต้องเป็นภาษาอังกฤษและตัวเลขเท่านั้น (ห้ามใช้ภาษาไทย)'
  } else if (errors.email && errors.email.includes('ภาษาไทย')) {
    errors.email = ''
  }
}

function validate() {
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''))
  let valid = true

  if (!form.display_name.trim()) {
    errors.display_name = 'กรุณากรอกชื่อ-นามสกุล'
    valid = false
  }

  if (!form.username.trim()) {
    errors.username = 'กรุณากรอกชื่อผู้ใช้'
    valid = false
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username.trim())) {
    errors.username = 'ชื่อผู้ใช้ต้องเป็นตัวอักษร A-Z, a-z, 0-9, _ (3-30 ตัว)'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'กรุณากรอกอีเมล'
    valid = false
  } else if (/[\u0E00-\u0E7F]/.test(form.email) || /[^\x00-\x7F]/.test(form.email)) {
    errors.email = 'อีเมลต้องเป็นภาษาอังกฤษและตัวเลขเท่านั้น (ห้ามใช้ภาษาไทย)'
    valid = false
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง (เช่น yourname@example.com)'
    valid = false
  }

  if (!form.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน'
    valid = false
  } else if (form.password.length < 8) {
    errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    valid = false
  } else if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(form.password)) {
    errors.password = 'รหัสผ่านต้องมีทั้งตัวเลขและตัวอักษร'
    valid = false
  }

  if (form.password !== form.confirm_password) {
    errors.confirm_password = 'รหัสผ่านยืนยันไม่ตรงกัน'
    valid = false
  }

  return valid
}

async function handleRegister() {
  errorMsg.value = ''
  if (!validate()) return

  loading.value = true
  try {
    const result = await register({
      display_name: form.display_name.trim(),
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })

    const savedUsername = result?.user?.username || form.username.trim()
    const savedPassword = form.password

    // ── Credential Management API (Store credentials in browser) ──
    if (typeof window !== 'undefined' && 'credentials' in navigator) {
      try {
        // @ts-ignore
        if (typeof PasswordCredential !== 'undefined') {
          // @ts-ignore
          const cred = new PasswordCredential({
            id: savedUsername,
            password: savedPassword,
            name: form.display_name.trim(),
          })
          await navigator.credentials.store(cred)
        }
      } catch (_e) { /* ignore */ }
    }

    // Redirect to login page so user enters their password to log in
    await navigateTo({
      path: '/login',
      query: {
        registered: '1',
        u: savedUsername,
      },
    })
  } catch (err: any) {
    errorMsg.value = err?.data?.message || err?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    loading.value = false
  }
}
</script>

<style scoped>
/* ══════════════════════════════════════════
   ROOT CONTAINER & ATMOSPHERE
══════════════════════════════════════════ */
.register-page-root {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: var(--bg-primary);
  position: relative;
  overflow-x: hidden;
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

.orb-purple-left {
  top: -160px;
  left: -100px;
  width: 650px;
  height: 650px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, transparent 70%);
}

.orb-indigo-right {
  bottom: -200px;
  right: -150px;
  width: 750px;
  height: 750px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, transparent 70%);
}

.orb-blue-center {
  top: 40%;
  right: 45%;
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
   LEFT FORM PANEL (AUTH CARD)
══════════════════════════════════════════ */
.register-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 36px;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
}

.glass-form-card {
  width: 100%;
  max-width: 480px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 28px;
  padding: 40px 38px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  box-sizing: border-box;
}

.form-header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.badge-accent-bar {
  width: 24px;
  height: 3px;
  border-radius: 99px;
  background: linear-gradient(90deg, #6366f1, #a855f7);
}

.badge-text {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.form-title {
  font-size: 34px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 6px;
  letter-spacing: -1px;
  line-height: 1.15;
}

.form-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 26px;
  line-height: 1.5;
}

/* Alert Boxes */
.alert-glass-box {
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.5;
}

.alert-glass-box.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: #f87171;
}

.alert-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13.5px;
}

/* Form Fields */
.form-fields-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.grid-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
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

.at-symbol {
  font-size: 15px;
  font-weight: 700;
  color: var(--brand);
}

.glass-input {
  width: 100%;
  padding: 11px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.glass-input.with-icon {
  padding-left: 42px;
}

.glass-input.with-trail {
  padding-right: 38px;
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
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #f87171;
}

.password-hint-text {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
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
  margin-top: 22px;
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
   RIGHT BRAND HERO PANEL (DESKTOP)
══════════════════════════════════════════ */
.register-brand-panel {
  width: 48%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 64px 44px;
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
   RESPONSIVE DESIGN
══════════════════════════════════════════ */
@media (max-width: 960px) {
  .register-page-root {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .register-brand-panel {
    display: none !important;
  }

  .register-form-panel {
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

  .grid-two-cols {
    grid-template-columns: 1fr;
  }
}
</style>