<template>
  <div class="invite-page-root">
    <!-- Ambient Background Blobs -->
    <div class="invite-blob blob-1"></div>
    <div class="invite-blob blob-2"></div>

    <div class="invite-container">
      
      <!-- Loading State -->
      <div v-if="loading" class="invite-card loading-card">
        <div class="spinner"></div>
        <p class="loading-text">กำลังตรวจสอบลิงก์เชิญ...</p>
      </div>

      <!-- Invalid / Expired / Maxed State -->
      <div v-else-if="!inviteData?.valid" class="invite-card error-card">
        <div class="status-icon-circle red-glow">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h1 class="invite-status-title">ไม่สามารถเข้าร่วมได้</h1>
        <p class="invite-status-desc">{{ inviteData?.message || 'ลิงก์เชิญนี้หมดอายุ หรือไม่สามารถใช้งานได้แล้ว' }}</p>

        <div class="invite-action-buttons">
          <NuxtLink to="/community" class="btn-invite-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>กลับสู่หน้าชุมชน</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Already Joined State -->
      <div v-else-if="inviteData?.is_joined" class="invite-card success-card">
        <!-- Community Banner Banner -->
        <div 
          class="invite-card-banner"
          :style="inviteData.community.banner_url ? { backgroundImage: `url(${inviteData.community.banner_url})` } : { background: `linear-gradient(135deg, ${inviteData.community.bg_color || '#6366f1'}, #0f172a)` }"
        ></div>

        <div class="invite-card-body">
          <div 
            class="invite-community-avatar"
            :style="!inviteData.community.avatar_url ? { background: inviteData.community.bg_color || '#6366f1' } : {}"
          >
            <img v-if="inviteData.community.avatar_url" :src="inviteData.community.avatar_url" alt="avatar" />
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>

          <div class="invite-joined-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>คุณเป็นสมาชิกของกลุ่มนี้อยู่แล้ว</span>
          </div>

          <h1 class="invite-community-name">{{ inviteData.community.name }}</h1>
          <p class="invite-community-desc">{{ inviteData.community.description || 'ไม่มีคำอธิบายชุมชน' }}</p>

          <div class="invite-meta-strip">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {{ (inviteData.community.member_count || 0).toLocaleString() }} สมาชิก
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              สร้างโดย {{ inviteData.community.owner_name }}
            </span>
          </div>

          <div class="invite-action-buttons">
            <NuxtLink :to="`/community/${inviteData.community.slug}`" class="btn-invite-primary">
              <span>เข้าสู่หน้าชุมชน</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Valid Invite Confirmation Card -->
      <div v-else class="invite-card">
        <!-- Community Banner Banner -->
        <div 
          class="invite-card-banner"
          :style="inviteData.community.banner_url ? { backgroundImage: `url(${inviteData.community.banner_url})` } : { background: `linear-gradient(135deg, ${inviteData.community.bg_color || '#6366f1'}, #0f172a)` }"
        >
          <div class="banner-glass-overlay"></div>
        </div>

        <div class="invite-card-body">
          <div 
            class="invite-community-avatar"
            :style="!inviteData.community.avatar_url ? { background: inviteData.community.bg_color || '#6366f1' } : {}"
          >
            <img v-if="inviteData.community.avatar_url" :src="inviteData.community.avatar_url" alt="avatar" />
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>

          <div class="invite-tag-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <span>คำเชิญเข้าร่วมชุมชน</span>
          </div>

          <h1 class="invite-community-name">{{ inviteData.community.name }}</h1>
          <p class="invite-community-desc">{{ inviteData.community.description || 'ไม่มีคำอธิบายชุมชน' }}</p>

          <!-- Community Meta Details -->
          <div class="invite-meta-strip">
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {{ (inviteData.community.member_count || 0).toLocaleString() }} สมาชิก
            </span>
            <span class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ผู้สร้าง: {{ inviteData.community.owner_name }}
            </span>
          </div>

          <!-- Feature Pill Badges -->
          <div class="invite-feature-pills">
            <span v-if="inviteData.community.is_private" class="feature-pill private">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ชุมชนส่วนตัว
            </span>
            <span v-if="inviteData.community.is_hidden" class="feature-pill hidden">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ชุมชนลับ (Hidden)
            </span>
            <span v-if="inviteData.invite.expires_at" class="feature-pill expires">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              หมดอายุ: {{ formatExpires(inviteData.invite.expires_at) }}
            </span>
          </div>

          <div class="invite-prompt-box">
            <p class="invite-prompt-text">คุณต้องการเข้าร่วมชุมชนนี้หรือไม่?</p>
          </div>

          <!-- Action Buttons -->
          <div class="invite-action-buttons">
            <template v-if="user">
              <button 
                @click="joinViaInvite" 
                class="btn-invite-primary"
                :disabled="joining"
              >
                <span>{{ joining ? 'กำลังเข้าร่วม...' : 'เข้าร่วมชุมชน' }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              
              <NuxtLink to="/community" class="btn-invite-secondary">
                <span>ไม่เข้าร่วม</span>
              </NuxtLink>
            </template>

            <template v-else>
              <button @click="handleLoginToJoin" class="btn-invite-primary">
                <span>เข้าสู่ระบบเพื่อเข้าร่วม</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </button>

              <NuxtLink to="/community" class="btn-invite-secondary">
                <span>กลับหน้าแรก</span>
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const code = route.params.code as string

const { user } = useAuth()
const { openLoginModal } = useLoginModal()
const toast = useToast()

const loading = ref(true)
const joining = ref(false)
const inviteData = ref<any>(null)

useHead({
  title: computed(() => inviteData.value?.community?.name 
    ? `คำเชิญเข้าร่วม ${inviteData.value.community.name} — ConnecXus` 
    : 'คำเชิญเข้าร่วมชุมชน — ConnecXus')
})

function formatExpires(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch {
    return dateStr
  }
}

async function loadInvite() {
  loading.value = true
  try {
    const res: any = await $fetch(`/api/invites/${code}`)
    inviteData.value = res
  } catch (err: any) {
    inviteData.value = {
      valid: false,
      message: err.data?.message || 'ไม่สามารถโหลดข้อมูลลิงก์เชิญได้'
    }
  } finally {
    loading.value = false
  }
}

async function joinViaInvite() {
  if (!user.value) {
    openLoginModal()
    return
  }

  joining.value = true
  try {
    const res: any = await $fetch(`/api/invites/${code}/join`, {
      method: 'POST'
    })
    toast.add({
      title: 'เข้าร่วมชุมชนสำเร็จ!',
      description: res.message || `ยินดีต้อนรับสู่ ${inviteData.value?.community?.name}`,
      color: 'primary'
    })
    navigateTo(`/community/${res.slug || inviteData.value.community.slug}`)
  } catch (err: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err.data?.message || 'ไม่สามารถเข้าร่วมชุมชนได้',
      color: 'red'
    })
  } finally {
    joining.value = false
  }
}

function handleLoginToJoin() {
  openLoginModal()
}

onMounted(() => {
  loadInvite()
})
</script>

<style scoped>
.invite-page-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 16px 80px;
  position: relative;
  background: var(--bg-primary);
  overflow: hidden;
}

/* Ambient glow blobs */
.invite-blob {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.18;
}

.blob-1 {
  top: 10%;
  left: 15%;
  background: #6366f1;
}

.blob-2 {
  bottom: 10%;
  right: 15%;
  background: #ec4899;
}

.invite-container {
  width: 100%;
  max-width: 460px;
  position: relative;
  z-index: 2;
}

.invite-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.loading-card, .error-card {
  padding: 48px 28px;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--brand-light);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
}

.status-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.invite-status-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.invite-status-desc {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Card Banner */
.invite-card-banner {
  height: 140px;
  width: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: var(--bg-tertiary);
}

.banner-glass-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.4) 100%);
}

.invite-card-body {
  padding: 0 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.invite-community-avatar {
  width: 76px;
  height: 76px;
  border-radius: 20px;
  border: 4px solid var(--bg-card);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  margin-top: -38px;
  margin-bottom: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  position: relative;
  z-index: 3;
}

.invite-community-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.invite-tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  background: var(--brand-light);
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.invite-joined-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.invite-community-name {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px;
  line-height: 1.25;
}

.invite-community-desc {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 0 0 16px;
  line-height: 1.55;
  max-width: 360px;
}

.invite-meta-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-secondary);
  font-weight: 600;
}

.invite-feature-pills {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.feature-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
}

.feature-pill.private {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.feature-pill.hidden {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
}

.feature-pill.expires {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.invite-prompt-box {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 10px 18px;
  margin-bottom: 20px;
  width: 100%;
}

.invite-prompt-text {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.invite-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.btn-invite-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 24px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-invite-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
}

.btn-invite-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-invite-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 11px 20px;
  border-radius: 14px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-primary);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-invite-secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
