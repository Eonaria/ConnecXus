<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ReportModal />
    <AppImageViewer />
    <LoginPromptModal />
  </UApp>
</template>

<script setup lang="ts">
// Apply theme from cookie immediately on app mount (SSR-safe)
// This ensures the data-theme attribute is set correctly on first paint
const { theme } = useTheme()
const { subscribe, identify } = useRealtime()
const toast = useToast()
const { user, logout } = useAuth()
const router = useRouter()
const { totalUnread, fetchInitialUnread, incrementUnreadMessages, clearUnreadMessages } = useUnreadMessages()
const { totalUnreadNotifications, fetchInitialUnreadNotifications, clearUnread, incrementUnread } = useUnreadNotifications()
const { fetchAdminBadge, incrementReports, decrementReports, incrementBanned, decrementBanned } = useAdminBadge()
const { initPresence } = usePresence()

// Bulletproof scroll-to-top on route change
router.afterEach(() => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
})

// Suppress external browser/extension soft-navigation tracing errors (e.g. reportAllChanges / startTime)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('startTime') || event.message.includes('reportAllChanges'))) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }, true)

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '')
    if (msg.includes('startTime') || msg.includes('reportAllChanges')) {
      event.preventDefault()
    }
  })
}

useHead({
  htmlAttrs: {
    'data-theme': theme,
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover' },
    { name: 'theme-color', content: '#7b6cf6' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
  ],
})

// Sync unread counts whenever user logs in or auth resolves
watch(user, (newUser) => {
  if (newUser) {
    identify(newUser)
    fetchInitialUnread()
    fetchInitialUnreadNotifications()
    if (newUser.role === 'admin') {
      fetchAdminBadge()
    }
    initPresence()
  } else {
    clearUnreadMessages()
    clearUnread()
  }
}, { immediate: true })

let pollTimer: ReturnType<typeof setInterval> | null = null
let unsubRealtime: (() => void) | null = null
let notifDebounceTimer: ReturnType<typeof setTimeout> | null = null
let msgDebounceTimer: ReturnType<typeof setTimeout> | null = null

function debouncedFetchNotifs() {
  if (notifDebounceTimer) clearTimeout(notifDebounceTimer)
  notifDebounceTimer = setTimeout(() => {
    if (user.value) fetchInitialUnreadNotifications()
  }, 200)
}

function debouncedFetchMessages() {
  if (msgDebounceTimer) clearTimeout(msgDebounceTimer)
  msgDebounceTimer = setTimeout(() => {
    if (user.value) fetchInitialUnread()
  }, 200)
}

onMounted(() => {
  const route = useRoute()
  if (route.query.mobile_login === '1') {
    toast.add({
      title: 'เข้าสู่ระบบบนมือถือสำเร็จ!',
      description: 'คุณได้เข้าใช้งาน ConnecXus บนอุปกรณ์นี้เรียบร้อยแล้ว',
      icon: 'i-heroicons-check-circle-solid',
      color: 'success'
    })
  }

  // Fallback Polling every 15s to ensure 100% badge accuracy
  pollTimer = setInterval(() => {
    if (user.value) {
      fetchInitialUnread()
      fetchInitialUnreadNotifications()
      if (user.value.role === 'admin') fetchAdminBadge()
    }
  }, 15000)

  unsubRealtime = subscribe((data) => {
    // Real-time Kick-out
    if ((data.type === 'user_banned' || data.type === 'force_logout') && user.value) {
      const targetId = data.payload?.user_id || data.payload?.target_id
      if (!targetId || Number(targetId) === Number(user.value.id)) {
        console.warn('[AUTH] User banned. Immediate kickout redirect.')
        logout().catch(() => {})
        user.value = null
        window.location.href = '/login?banned=true'
        return
      }
    }

    // ── Real-time Chat Messages ──
    if (data.type === 'chat') {
      const msg = data.payload?.message
      const senderId = msg?.sender_id || msg?.sender?.id
      if (senderId && user.value && Number(senderId) !== Number(user.value.id)) {
        if (!window.location.pathname.startsWith('/messages')) {
          incrementUnreadMessages()
        }
        debouncedFetchMessages()
      }
    }

    // ── Real-time Social & Community Notifications ──
    const targetUserId = data.payload?.target_user_id || data.payload?.target_id
    const targetUsername = data.payload?.target_username
    const sourceUserId = data.payload?.source_user_id || data.payload?.user_id || data.payload?.sender_id
    const sourceUsername = data.payload?.source_username || data.payload?.actor?.username

    const isForMe = Boolean(user.value && (
      (targetUsername && targetUsername === user.value.username) ||
      (targetUserId && Number(targetUserId) === Number(user.value.id))
    ))

    const isFromMe = Boolean(user.value && (
      (sourceUsername && sourceUsername === user.value.username) ||
      (sourceUserId && Number(sourceUserId) === Number(user.value.id))
    ))

    const isSelfAction = Boolean(
      isFromMe ||
      (targetUserId && sourceUserId && Number(targetUserId) === Number(sourceUserId)) ||
      (targetUsername && sourceUsername && targetUsername === sourceUsername)
    )

    if (isForMe && !isSelfAction) {
      if (!window.location.pathname.startsWith('/notifications')) {
        incrementUnread()
      }
      debouncedFetchNotifs()

      if (data.type === 'like_post') {
        toast.add({
          title: 'ถูกใจโพสต์',
          description: `@${sourceUsername || 'ผู้ใช้'} ถูกใจโพสต์ของคุณ`,
          icon: 'i-heroicons-heart-solid',
          color: 'red'
        })
      } else if (data.type === 'new_follower') {
        toast.add({
          title: 'ผู้ติดตามใหม่',
          description: `@${sourceUsername || 'ผู้ใช้'} เริ่มติดตามคุณแล้ว`,
          icon: 'i-heroicons-user-plus-solid',
          color: 'primary'
        })
      } else if (data.type === 'new_comment') {
        toast.add({
          title: 'ความคิดเห็นใหม่',
          description: `@${sourceUsername || 'ผู้ใช้'} แสดงความคิดเห็นบนโพสต์ของคุณ`,
          icon: 'i-heroicons-chat-bubble-left-solid',
          color: 'primary'
        })
      } else if (data.type === 'repost') {
        toast.add({
          title: 'รีโพสต์ใหม่',
          description: `@${sourceUsername || 'ผู้ใช้'} ได้รีโพสต์ของคุณ`,
          icon: 'i-heroicons-arrow-path-solid',
          color: 'primary'
        })
      } else if (data.type === 'new_post') {
        toast.add({
          title: 'โพสต์ใหม่',
          description: `@${sourceUsername || 'ผู้ใช้'} ได้เพิ่มโพสต์ใหม่`,
          icon: 'i-heroicons-document-text-solid',
          color: 'primary'
        })
      }
    } else if (data.type === 'notification_update') {
      const p = data.payload || {}
      const pSourceUser = p.source_username
      const pSourceId = p.source_user_id
      const pTargetId = p.target_user_id
      
      const isSelfUpdate = Boolean(
        (pSourceUser && user.value && pSourceUser === user.value.username) ||
        (pSourceId && user.value && Number(pSourceId) === Number(user.value.id)) ||
        (pTargetId && pSourceId && Number(pTargetId) === Number(pSourceId))
      )

      if (!isSelfUpdate && pSourceUser) {
        if (!window.location.pathname.startsWith('/notifications')) {
          incrementUnread()
        }
        debouncedFetchNotifs()

        if (p.action === 'new_like' || p.action === 'like_comment') {
          toast.add({
            title: 'ถูกใจใหม่',
            description: `@${pSourceUser} ถูกใจเนื้อหาของคุณ`,
            icon: 'i-heroicons-heart-solid',
            color: 'red'
          })
        } else if (p.action === 'new_comment') {
          toast.add({
            title: 'ความคิดเห็นใหม่',
            description: `@${pSourceUser} แสดงความคิดเห็นบนโพสต์ของคุณ`,
            icon: 'i-heroicons-chat-bubble-left-solid',
            color: 'primary'
          })
        } else if (p.action === 'new_follower') {
          toast.add({
            title: 'ผู้ติดตามใหม่',
            description: `@${pSourceUser} เริ่มติดตามคุณแล้ว`,
            icon: 'i-heroicons-user-plus-solid',
            color: 'primary'
          })
        } else if (p.action === 'new_repost') {
          toast.add({
            title: 'รีโพสต์ใหม่',
            description: `@${pSourceUser} ได้รีโพสต์ของคุณ`,
            icon: 'i-heroicons-arrow-path-solid',
            color: 'primary'
          })
        } else if (p.action === 'community_request') {
          toast.add({
            title: 'คำขอเข้าร่วมชุมชน',
            description: `@${pSourceUser} ส่งคำขอเข้าร่วมชุมชน ${p.community_name || ''}`,
            icon: 'i-heroicons-user-group-solid',
            color: 'warning'
          })
        } else if (p.action === 'community_join') {
          toast.add({
            title: 'สมาชิกใหม่ในชุมชน',
            description: `@${pSourceUser} เข้าร่วมชุมชน ${p.community_name || ''}`,
            icon: 'i-heroicons-user-group-solid',
            color: 'success'
          })
        }
      }
    } else if ([
      'notification_received', 
      'community_member_request', 
      'community_request', 
      'community_invite'
    ].includes(data.type)) {
      if (!window.location.pathname.startsWith('/notifications')) {
        incrementUnread()
      }
      debouncedFetchNotifs()
    }

    // ── Admin Reports & Badges ──
    if (data.type === 'new_report') {
      incrementReports()
    }
    if (data.type === 'report_resolved') {
      decrementReports()
    }
    if (data.type === 'user_banned') {
      incrementBanned()
    }
    if (data.type === 'user_unbanned') {
      decrementBanned()
    }
    if (['admin_stats_updated', 'admin_log_created', 'new_report', 'report_resolved', 'user_banned', 'user_unbanned'].includes(data.type) && user.value?.role === 'admin') {
      fetchAdminBadge()
    }
  })
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  if (unsubRealtime) {
    unsubRealtime()
    unsubRealtime = null
  }
  if (notifDebounceTimer) clearTimeout(notifDebounceTimer)
  if (msgDebounceTimer) clearTimeout(msgDebounceTimer)
})
</script>
