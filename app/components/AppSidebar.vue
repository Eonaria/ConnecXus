<template>
  <aside class="app-sidebar">
    <!-- ══════ TOP SECTION ══════ -->
    <div class="sidebar-nav-group">

      <!-- Brand Logo + Name -->
      <NuxtLink to="/" class="sidebar-brand" title="ConnecXus Home" @click="handleHomeClick">
        <img
          src="/logo.jpg"
          alt="ConnecXus"
          class="sidebar-brand-logo"
        />
        <span class="sidebar-brand-name">ConnecXus</span>
      </NuxtLink>

      <!-- Home / Feed -->
      <NuxtLink
        to="/"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive('/') }"
        title="หน้าแรก (Home Feed)"
        @click="handleHomeClick"
      >
        <div class="sidebar-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" :fill="isActive('/') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="sidebar-nav-label">หน้าแรก</span>
      </NuxtLink>

      <!-- Explore / Search & Trends -->
      <NuxtLink
        to="/explore"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive('/explore') }"
        title="สำรวจ & เทรนด์"
      >
        <div class="sidebar-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" :fill="isActive('/explore') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <span class="sidebar-nav-label">สำรวจ & เทรนด์</span>
      </NuxtLink>

      <!-- Messages / Chat -->
      <NuxtLink
        to="/messages"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive('/messages') }"
        title="ข้อความ (Messages)"
      >
        <div class="sidebar-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" :fill="isActive('/messages') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <ClientOnly>
            <div v-if="totalUnread > 0" class="sidebar-badge-pill">
              {{ totalUnread > 99 ? '99+' : totalUnread }}
            </div>
          </ClientOnly>
        </div>
        <span class="sidebar-nav-label">ข้อความ</span>
      </NuxtLink>

      <!-- Communities -->
      <NuxtLink
        to="/community"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive('/community') }"
        title="ชุมชน (Communities)"
      >
        <div class="sidebar-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span class="sidebar-nav-label">ชุมชน</span>
      </NuxtLink>

      <!-- Notifications -->
      <NuxtLink
        to="/notifications"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive('/notifications') }"
        title="การแจ้งเตือน (Notifications)"
      >
        <div class="sidebar-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" :fill="isActive('/notifications') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <ClientOnly>
            <div v-if="totalUnreadNotifications > 0" class="sidebar-badge-pill">
              {{ totalUnreadNotifications > 99 ? '99+' : totalUnreadNotifications }}
            </div>
          </ClientOnly>
        </div>
        <span class="sidebar-nav-label">การแจ้งเตือน</span>
      </NuxtLink>

      <!-- Bookmarks -->
      <NuxtLink
        to="/bookmarks"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive('/bookmarks') }"
        title="บุ๊กมาร์ก (Bookmarks)"
      >
        <div class="sidebar-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" :fill="isActive('/bookmarks') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span class="sidebar-nav-label">บุ๊กมาร์ก</span>
      </NuxtLink>

      <!-- Profile -->
      <ClientOnly>
        <NuxtLink
          v-if="user"
          :to="'/profile/' + user.username"
          class="sidebar-nav-item"
          :class="{ 'is-active': isActive('/profile') }"
          title="โปรไฟล์ (Profile)"
        >
          <div class="sidebar-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="sidebar-nav-label">โปรไฟล์</span>
        </NuxtLink>
      </ClientOnly>

      <!-- Admin Only -->
      <ClientOnly>
        <NuxtLink
          v-if="user?.role === 'admin'"
          to="/admin"
          class="sidebar-nav-item admin-item"
          :class="{ 'is-active': isActive('/admin') }"
          title="ระบบแอดมิน (Admin Panel)"
        >
          <div class="sidebar-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>

            <!-- Yellow for Reports, Red for Banned accounts -->
            <template v-if="!isActive('/admin')">
              <div v-if="adminBannedUsers > 0 && adminUnresolvedReports > 0" class="admin-badge-split-container">
                <span class="sidebar-badge-pill pill-yellow" title="รายงานที่รอตรวจสอบ">{{ adminUnresolvedReports > 99 ? '99+' : adminUnresolvedReports }}</span>
                <span class="sidebar-badge-pill pill-red" title="บัญชีที่ถูกระงับ">{{ adminBannedUsers > 99 ? '99+' : adminBannedUsers }}</span>
              </div>
              <div v-else-if="adminUnresolvedReports > 0" class="sidebar-badge-pill pill-yellow" title="รายงานที่รอตรวจสอบ">
                {{ adminUnresolvedReports > 99 ? '99+' : adminUnresolvedReports }}
              </div>
              <div v-else-if="adminBannedUsers > 0" class="sidebar-badge-pill pill-red" title="บัญชีที่ถูกระงับ">
                {{ adminBannedUsers > 99 ? '99+' : adminBannedUsers }}
              </div>
            </template>
          </div>
          <span class="sidebar-nav-label">ระบบแอดมิน</span>
          <div 
            v-if="!isActive('/admin') && (adminUnresolvedReports > 0 || adminBannedUsers > 0)" 
            class="admin-inline-pill-wrap"
          >
            <span v-if="adminUnresolvedReports > 0" class="admin-inline-pill pill-yellow" title="รายงานที่รอตรวจสอบ">
              {{ adminUnresolvedReports > 99 ? '99+' : adminUnresolvedReports }}
            </span>
            <span v-if="adminBannedUsers > 0" class="admin-inline-pill pill-red" title="บัญชีที่ถูกระงับ">
              {{ adminBannedUsers > 99 ? '99+' : adminBannedUsers }}
            </span>
          </div>
        </NuxtLink>
      </ClientOnly>

    </div>

    <!-- ══════ BOTTOM SECTION ══════ -->
    <div class="sidebar-bottom-group">

      <!-- User card — wrapped in ClientOnly to prevent SSR/CSR mismatch -->
      <ClientOnly>
        <!-- Logged in: show avatar + name link to profile -->
        <NuxtLink
          v-if="user"
          :to="'/profile/' + user.username"
          class="sidebar-profile-card"
          :title="user.display_name || user.username"
        >
          <!-- Avatar Frame -->
          <div class="sidebar-profile-avatar-wrap">
            <div
              class="sidebar-profile-avatar"
              :style="userAvatarUrl
                ? 'background-image: url(' + userAvatarUrl + ');'
                : 'background: linear-gradient(135deg, #6366f1, #8b5cf6);'
              "
            >
              <span v-if="!userAvatarUrl" class="sidebar-avatar-initial">{{ userInitial }}</span>
            </div>
            <!-- Online Pulse Dot -->
            <span class="sidebar-profile-status-dot"></span>
          </div>

          <!-- User Info -->
          <div class="sidebar-profile-info">
            <div class="sidebar-profile-name-row">
              <span class="sidebar-profile-name">{{ user.display_name || user.username }}</span>
              <span v-if="user.role === 'admin'" class="sidebar-profile-badge admin">Admin</span>
              <span v-else-if="user.role === 'moderator'" class="sidebar-profile-badge mod">Mod</span>
            </div>
            <div class="sidebar-profile-handle">@{{ user.username }}</div>
          </div>

          <!-- Right Chevron Icon -->
          <div class="sidebar-profile-chevron">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </NuxtLink>

        <!-- Not logged in: show login link -->
        <NuxtLink
          v-else
          to="/login"
          class="sidebar-login-card"
          title="เข้าสู่ระบบ"
        >
          <div class="sidebar-login-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div class="sidebar-login-info">
            <div class="sidebar-login-title">เข้าสู่ระบบ</div>
            <div class="sidebar-login-sub">เชื่อมต่อบัญชีของคุณ</div>
          </div>
        </NuxtLink>

        <!-- Placeholder during SSR -->
        <template #fallback>
          <div style="height: 52px;" />
        </template>
      </ClientOnly>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useUnreadMessages } from '~/composables/useUnreadMessages'
import { useAdminBadge } from '~/composables/useAdminBadge'

const route = useRoute()
const { user, logout } = useAuth()
const { totalUnread, fetchInitialUnread } = useUnreadMessages()
const { totalUnreadNotifications, fetchInitialUnreadNotifications } = useUnreadNotifications()
const { adminUnresolvedReports, adminBannedUsers, fetchAdminBadge } = useAdminBadge()

const userAvatarUrl = computed(() => user.value?.avatar_url || null)

const userInitial = computed(() => {
  if (!user.value?.display_name && !user.value?.username) return 'U'
  const name = user.value.display_name || user.value.username
  return name.trim().slice(0, 1).toUpperCase()
})

onMounted(() => {
  if (user.value) {
    fetchInitialUnread()
    fetchInitialUnreadNotifications()
    if (user.value.role === 'admin') {
      fetchAdminBadge()
    }
  }
})

watch(() => route.path, () => {
  if (user.value) {
    fetchInitialUnread()
    fetchInitialUnreadNotifications()
    if (user.value.role === 'admin') {
      fetchAdminBadge()
    }
  }
})

function handleHomeClick() {
  if (route.path === '/') {
    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0
    if (currentScroll > 40) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

/**
 * Returns true if the current path matches the given prefix.
 * Safe during SSR — falls back to false if route is not ready.
 */
function isActive(prefix: string): boolean {
  const path = route?.path ?? ''
  if (prefix === '/') return path === '/'
  return path.startsWith(prefix)
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════
   App Sidebar Base (Desktop Expanded)
══════════════════════════════════════════════════════ */
.app-sidebar {
  width: 240px;
  background: var(--theme-sidebar-bg, var(--bg-card));
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  margin: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 14px;
  flex-shrink: 0;
  position: sticky;
  top: 16px;
  height: calc(100vh - 32px);
  z-index: 90;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease, margin 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: var(--card-shadow);
  scrollbar-width: none;
}

.app-sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar-nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.sidebar-bottom-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
  width: 100%;
}

/* ══════════════════════════════════════════════════════
   Brand Logo & Name
══════════════════════════════════════════════════════ */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  margin-bottom: 14px;
  text-decoration: none;
  border-radius: 14px;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.sidebar-brand:hover {
  transform: scale(1.02);
}

.sidebar-brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(123, 108, 246, 0.3);
}

.sidebar-brand-name {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #a78bfa, #7b6cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* ══════════════════════════════════════════════════════
   Nav Items
══════════════════════════════════════════════════════ */
.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--nav-text, #94a3b8);
  background: transparent;
  transition: all 0.18s ease;
  user-select: none;
}

.sidebar-nav-item:hover {
  background: var(--bg-hover, rgba(255, 255, 255, 0.06));
  color: var(--text-primary, #ffffff);
  transform: translateX(2px);
}

.sidebar-nav-item.is-active {
  background: var(--brand-light, rgba(123, 108, 246, 0.15));
  color: var(--brand, #8b5cf6);
  font-weight: 700;
}

.sidebar-nav-item.admin-item.is-active {
  background: rgba(239, 68, 68, 0.15);
  color: var(--error, #ef4444);
}

.sidebar-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.sidebar-nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14.5px;
}

/* ══════════════════════════════════════════════════════
   Badge Pills
══════════════════════════════════════════════════════ */
.sidebar-badge-pill {
  position: absolute;
  top: -6px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  color: #ffffff !important;
  font-size: 10px;
  font-weight: 800;
  border-radius: 9999px;
  padding: 1px 5px;
  min-width: 17px;
  height: 17px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--theme-sidebar-bg, var(--bg-card));
  line-height: 1;
  animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
  user-select: none;
}

.sidebar-badge-pill.pill-yellow {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-badge-pill.pill-red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.admin-badge-split-container {
  position: absolute;
  top: -6px;
  right: -12px;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 10;
}

.admin-badge-split-container .sidebar-badge-pill {
  position: static;
  top: auto;
  right: auto;
}

.admin-inline-pill-wrap {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.admin-inline-pill {
  font-size: 10px;
  font-weight: 800;
  border-radius: 9999px;
  padding: 1px 6px;
  min-width: 17px;
  height: 17px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: #ffffff !important;
  user-select: none;
}

.admin-inline-pill.pill-yellow {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
}

.admin-inline-pill.pill-red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

@keyframes badgePop {
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* ══════════════════════════════════════════════════════
   Profile Card (Bottom Section)
══════════════════════════════════════════════════════ */
.sidebar-profile-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 8px 10px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 50%, rgba(15, 23, 42, 0.4) 100%);
  border: 1px solid rgba(139, 92, 246, 0.24);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  margin-top: 4px;
}

.sidebar-profile-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.18), transparent 70%);
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.25s ease;
}

.sidebar-profile-card:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(15, 23, 42, 0.5) 100%);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 8px 24px -4px rgba(124, 58, 237, 0.3), inset 0 1px 2px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.sidebar-profile-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.sidebar-profile-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1.5px solid rgba(139, 92, 246, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #ffffff !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.sidebar-avatar-initial {
  display: flex !important;
  color: #ffffff !important;
  font-weight: 800;
}

.sidebar-profile-card:hover .sidebar-profile-avatar {
  transform: scale(1.04);
  border-color: #8b5cf6;
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.55);
}

.sidebar-profile-status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid var(--bg-card, #0f172a);
  box-shadow: 0 0 8px #10b981;
  display: block !important;
}

.sidebar-profile-info {
  min-width: 0;
  flex: 1;
}

.sidebar-profile-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-profile-name {
  font-size: 13.5px;
  font-weight: 750;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.sidebar-profile-badge {
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.sidebar-profile-badge.admin {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.sidebar-profile-badge.mod {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.35);
}

.sidebar-profile-handle {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.sidebar-profile-chevron {
  color: var(--text-muted, #94a3b8);
  opacity: 0.5;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-profile-card:hover .sidebar-profile-chevron {
  opacity: 1;
  color: var(--brand, #8b5cf6);
  transform: translateX(2px);
}

/* Login Card */
.sidebar-login-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.06));
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px -2px rgba(0,0,0,0.2);
}

.sidebar-login-card:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15));
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 8px 25px -4px rgba(99, 102, 241, 0.35);
  transform: translateY(-2px);
}

.sidebar-login-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: rgba(99, 102, 241, 0.2);
  color: var(--brand, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(99, 102, 241, 0.35);
}

.sidebar-login-info {
  flex: 1;
  min-width: 0;
}

.sidebar-login-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-login-sub {
  font-size: 11.5px;
  color: var(--text-muted);
}

/* ══════════════════════════════════════════════════════
   Tablet & Narrow Viewport Collapsed Icon-Only Mode (769px - 1024px)
══════════════════════════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
  .app-sidebar {
    width: 68px !important;
    padding: 16px 8px !important;
    margin: 16px 8px !important;
    align-items: center;
  }

  .sidebar-brand {
    padding: 4px 0 !important;
    margin-bottom: 16px !important;
    justify-content: center !important;
    width: 100% !important;
  }

  .sidebar-brand-name {
    display: none !important;
  }

  .sidebar-nav-item {
    width: 48px !important;
    height: 48px !important;
    padding: 0 !important;
    margin: 2px auto !important;
    justify-content: center !important;
    align-items: center !important;
    border-radius: 14px !important;
    gap: 0 !important;
  }

  .sidebar-nav-item:hover {
    transform: scale(1.06) !important;
  }

  .sidebar-nav-label {
    display: none !important;
  }

  .admin-inline-pill-wrap {
    display: none !important;
  }

  .sidebar-icon-wrap {
    width: 24px;
    height: 24px;
  }

  /* Profile Card Collapsed */
  .sidebar-profile-card {
    width: 48px !important;
    height: 48px !important;
    padding: 0 !important;
    margin: 4px auto 0 auto !important;
    justify-content: center !important;
    align-items: center !important;
    border-radius: 14px !important;
    gap: 0 !important;
  }

  .sidebar-profile-card:hover {
    transform: scale(1.06) !important;
  }

  .sidebar-profile-info,
  .sidebar-profile-chevron {
    display: none !important;
  }

  .sidebar-profile-avatar {
    width: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
  }

  /* Login Card Collapsed */
  .sidebar-login-card {
    width: 48px !important;
    height: 48px !important;
    padding: 0 !important;
    margin: 4px auto 0 auto !important;
    justify-content: center !important;
    align-items: center !important;
    border-radius: 14px !important;
  }

  .sidebar-login-info {
    display: none !important;
  }
}
</style>
