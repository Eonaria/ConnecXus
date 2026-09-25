<template>
  <ClientOnly>
    <nav class="bottom-nav">
      <NuxtLink to="/" :class="{ active: isActive('/') }" @click="handleHomeClick">
        <svg width="24" height="24" viewBox="0 0 24 24" :fill="isActive('/') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>หน้าแรก</span>
      </NuxtLink>
      <NuxtLink to="/explore" :class="{ active: isActive('/explore') }">
        <svg width="24" height="24" viewBox="0 0 24 24" :fill="isActive('/explore') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>ค้นหา</span>
      </NuxtLink>
      <NuxtLink to="/community" :class="{ active: isActive('/community') }">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>ชุมชน</span>
      </NuxtLink>
      <NuxtLink to="/messages" :class="{ active: isActive('/messages') }">
        <div style="position:relative;display:inline-flex;">
          <svg width="24" height="24" viewBox="0 0 24 24" :fill="isActive('/messages') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span v-if="totalUnread > 0" class="nav-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
        </div>
        <span>ข้อความ</span>
      </NuxtLink>
      <NuxtLink to="/notifications" :class="{ active: isActive('/notifications') }">
        <div style="position:relative;display:inline-flex;">
          <svg width="24" height="24" viewBox="0 0 24 24" :fill="isActive('/notifications') ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span v-if="totalUnreadNotifications > 0" class="nav-badge">{{ totalUnreadNotifications > 99 ? '99+' : totalUnreadNotifications }}</span>
        </div>
        <span>แจ้งเตือน</span>
      </NuxtLink>
      <NuxtLink v-if="user" :to="profileLink" :class="{ active: isActive('/profile') }">
        <div :style="avatarStyle">{{ user.avatar_url ? '' : userInitial }}</div>
        <span>โปรไฟล์</span>
      </NuxtLink>
      <NuxtLink v-else to="/login" :class="{ active: isActive('/login') }">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        <span>เข้าสู่ระบบ</span>
      </NuxtLink>
    </nav>
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()
const { totalUnread } = useUnreadMessages()
const { totalUnreadNotifications } = useUnreadNotifications()

const userInitial = computed(() => user.value?.display_name?.trim().slice(0, 1) || 'ผ')
const profileLink = computed(() => user.value ? '/profile/' + user.value.username : '/login')
const avatarStyle = computed(() => {
  const isAct = isActive('/profile')
  const border = isAct ? 'var(--brand)' : 'var(--border-primary)'
  const bg = user.value?.avatar_url
    ? 'url(' + user.value.avatar_url + ') center/cover no-repeat'
    : 'linear-gradient(135deg, #5b46e0, #7b6cf6)'
  return 'width:24px;height:24px;border-radius:50%;border:2px solid ' + border + ';overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;background:' + bg
})

function isActive(prefix: string): boolean {
  const path = route?.path ?? ''
  if (prefix === '/') return path === '/'
  return path.startsWith(prefix)
}

function handleHomeClick() {
  if (route.path === '/') {
    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0
    if (currentScroll > 40) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.nav-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  border-radius: 9999px;
  padding: 1px 5px;
  min-width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  border: 1.5px solid var(--bg-card);
  line-height: 1;
  animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
  user-select: none;
}

@keyframes badgePop {
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
</style>