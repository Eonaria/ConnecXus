<template>
  <div class="notifications-page-root">
    <div class="notifications-container">

      <!-- ══════════════════════════════════════════
           LEFT / CENTER — Notifications Stream
      ══════════════════════════════════════════ -->
      <main class="notifications-main-col">
        
        <!-- Glassmorphic Header Card -->
        <header class="notifications-header-card">
          <div class="header-top-row">
            <div class="header-title-group">
              <div class="header-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div>
                <h1 class="header-title">การแจ้งเตือน</h1>
                <p class="header-subtitle">
                  ติดตามความเคลื่อนไหว กิจกรรม และผู้คนที่ตอบรับคุณ
                </p>
              </div>
            </div>

            <!-- Mark All As Read Button -->
            <button 
              v-if="notifications.length > 0 && hasUnread"
              @click="markAllAsRead"
              class="btn-mark-read"
              title="ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>อ่านทั้งหมด</span>
            </button>
          </div>

          <!-- Filter Segment Tabs -->
          <div class="filter-tabs-scroller">
            <div class="filter-tabs-row">
              <button 
                @click="activeFilter = 'all'" 
                class="filter-tab-pill"
                :class="{ 'active': activeFilter === 'all' }"
              >
                ทั้งหมด ({{ notifications.length }})
              </button>

              <button 
                @click="activeFilter = 'like'" 
                class="filter-tab-pill"
                :class="{ 'active': activeFilter === 'like' }"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>ถูกใจ ({{ likeCount }})</span>
              </button>

              <button 
                @click="activeFilter = 'comment'" 
                class="filter-tab-pill"
                :class="{ 'active': activeFilter === 'comment' }"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#38bdf8" stroke="#38bdf8" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>ความคิดเห็น ({{ commentCount }})</span>
              </button>

              <button 
                @click="activeFilter = 'follow'" 
                class="filter-tab-pill"
                :class="{ 'active': activeFilter === 'follow' }"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                <span>ผู้ติดตาม ({{ followCount }})</span>
              </button>

              <button 
                @click="activeFilter = 'community'" 
                class="filter-tab-pill"
                :class="{ 'active': activeFilter === 'community' }"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>ชุมชน ({{ communityCount }})</span>
              </button>

              <button 
                @click="activeFilter = 'new_post'" 
                class="filter-tab-pill"
                :class="{ 'active': activeFilter === 'new_post' }"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                <span>โพสต์ใหม่ ({{ newPostCount }})</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="pending" class="notifications-state-card">
          <div class="spinner"></div>
          <p>กำลังโหลดการแจ้งเตือน...</p>
        </div>

        <!-- Empty State (No Notifications At All) -->
        <div v-else-if="!notifications || notifications.length === 0" class="notifications-state-card empty-card">
          <div class="empty-state-glow-ring">
            <div class="state-icon-circle glowing">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
          </div>
          <h2>ยังไม่มีการแจ้งเตือน</h2>
          <p>เมื่อมีคนกดถูกใจ แสดงความคิดเห็น เริ่มติดตามคุณ หรือส่งคำขอในกลุ่ม ข้อมูลจะปรากฏที่นี่แบบเรียลไทม์</p>
          <div class="empty-actions-row">
            <NuxtLink to="/" class="action-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>สำรวจฟีดหน้าแรก</span>
            </NuxtLink>
            <NuxtLink to="/community" class="action-btn-glass">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>สำรวจชุมชน</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Filter Empty State -->
        <div v-else-if="filteredNotifications.length === 0" class="notifications-state-card">
          <div class="state-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <h2>ไม่มีรายการในหมวดนี้</h2>
          <p>ยังไม่มีการแจ้งเตือนประเภทที่คุณเลือกในขณะนี้</p>
          <button @click="activeFilter = 'all'" class="action-btn-outline">
            ดูการแจ้งเตือนทั้งหมด
          </button>
        </div>

        <!-- Notification List -->
        <div v-else class="notifications-stream-card">
          <div
            v-for="notif in filteredNotifications"
            :key="notif.id"
            class="notif-card-item"
            :class="{ 'is-unread': !notif.is_read }"
            @click="handleNotificationClick(notif)"
          >
            <!-- Left: Type Icon Badge -->
            <div class="notif-type-col">
              <!-- Like -->
              <div v-if="notif.type === 'like'" class="type-icon-box box-like">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>

              <!-- Comment -->
              <div v-else-if="notif.type === 'comment'" class="type-icon-box box-comment">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>

              <!-- Follow -->
              <div v-else-if="notif.type === 'follow'" class="type-icon-box box-follow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>

              <!-- Repost -->
              <div v-else-if="notif.type === 'repost'" class="type-icon-box box-repost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                  <path d="M17 1l4 4-4 4"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <path d="M7 23l-4-4 4-4"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </div>

              <!-- Community Request / Join -->
              <div v-else-if="notif.type === 'community_request' || notif.type === 'community_join' || notif.type === 'community'" class="type-icon-box box-community">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>

              <!-- New Post -->
              <div v-else class="type-icon-box box-post">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
            </div>

            <!-- Center: Details & Context -->
            <div class="notif-body-col">
              
              <!-- Sender Info Row -->
              <div class="sender-row">
                <div 
                  class="notif-avatar-wrap"
                  @click.stop="notif.sender_username && navigateTo(`/profile/${notif.sender_username}`)"
                >
                  <img v-if="notif.sender_avatar_url" :src="notif.sender_avatar_url" alt="avatar" @error="notif.sender_avatar_url = null" />
                  <div v-else class="notif-avatar-fallback">
                    {{ (notif.sender_display_name || notif.sender_username || 'U').slice(0, 1).toUpperCase() }}
                  </div>
                </div>

                <div class="notif-text-wrap">
                  <div class="notif-headline">
                    <span 
                      class="notif-author-name"
                      @click.stop="notif.sender_username && navigateTo(`/profile/${notif.sender_username}`)"
                    >
                      {{ notif.sender_display_name || notif.sender_username || 'ผู้ใช้' }}
                    </span>
                    
                    <span class="notif-action-text" v-if="notif.type === 'like'">
                      ถูกใจโพสต์ของคุณ
                    </span>
                    <span class="notif-action-text" v-else-if="notif.type === 'comment'">
                      แสดงความคิดเห็นในโพสต์ของคุณ
                    </span>
                    <span class="notif-action-text" v-else-if="notif.type === 'follow'">
                      เริ่มติดตามคุณ
                    </span>
                    <span class="notif-action-text" v-else-if="notif.type === 'repost'">
                      ได้รีโพสต์ของคุณ
                    </span>
                    <span class="notif-action-text" v-else-if="notif.type === 'community_request'">
                      ส่งคำขอเข้าร่วมชุมชน <strong>{{ notif.community_name || 'ของคุณ' }}</strong>
                    </span>
                    <span class="notif-action-text" v-else-if="notif.type === 'community_join'">
                      เข้าร่วมชุมชน <strong>{{ notif.community_name || 'ของคุณ' }}</strong>
                    </span>
                    <span class="notif-action-text" v-else-if="notif.type === 'new_post'">
                      ได้แชร์โพสต์ใหม่
                    </span>
                    <span class="notif-action-text" v-else>
                      {{ notif.content || 'มีความเคลื่อนไหวใหม่' }}
                    </span>
                  </div>

                  <span v-if="notif.created_at" class="notif-time-badge">
                    {{ timeAgo(notif.created_at) }}
                  </span>
                </div>
              </div>

              <!-- Quoted Post Preview -->
              <div v-if="notif.post_content" class="notif-quote-bubble">
                <span class="quote-text">{{ notif.post_content }}</span>
              </div>

            </div>

            <!-- Right: Action Arrow / Pill -->
            <div class="notif-arrow-col">
              <span class="view-pill-btn">
                {{ notif.type === 'follow' ? 'ดูโปรไฟล์' : (notif.type.startsWith('community') ? 'ดูคำขอ' : 'ดูโพสต์') }}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>

            <!-- Unread Indicator Dot -->
            <span v-if="!notif.is_read" class="unread-dot-badge" title="ยังไม่ได้อ่าน"></span>

          </div>
        </div>

      </main>

      <!-- ══════════════════════════════════════════
           RIGHT — Side Widgets
      ══════════════════════════════════════════ -->
      <aside class="notifications-side-col">
        
        <!-- Widget 1: Overview & Stats -->
        <div class="side-card">
          <div class="card-header">
            <div class="card-header-icon-box purple">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <h3>สรุปการแจ้งเตือน</h3>
          </div>

          <div class="stats-grid">
            <div class="stat-cell">
              <span class="cell-val color-like">{{ likeCount }}</span>
              <span class="cell-lbl">ยอดถูกใจ</span>
            </div>
            <div class="stat-cell">
              <span class="cell-val color-comment">{{ commentCount }}</span>
              <span class="cell-lbl">ความคิดเห็น</span>
            </div>
            <div class="stat-cell">
              <span class="cell-val color-follow">{{ followCount }}</span>
              <span class="cell-lbl">ผู้ติดตามใหม่</span>
            </div>
            <div class="stat-cell">
              <span class="cell-val color-post">{{ newPostCount }}</span>
              <span class="cell-lbl">โพสต์ใหม่</span>
            </div>
          </div>
        </div>

        <!-- Widget 2: Helpful Shortcuts -->
        <div class="side-card">
          <div class="card-header">
            <div class="card-header-icon-box blue">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <h3>ทางลัดแนะนำ</h3>
          </div>

          <div class="quick-links-list">
            <NuxtLink to="/" class="quick-link-item">
              <div class="link-icon-box blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">หน้าแรก (Home Feed)</span>
                <span class="link-desc">สำรวจโพสต์ล่าสุดในระบบ</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/community" class="quick-link-item">
              <div class="link-icon-box emerald">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">ชุมชน (Communities)</span>
                <span class="link-desc">เข้าร่วมและค้นพบกลุ่มใหม่</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/bookmarks" class="quick-link-item">
              <div class="link-icon-box purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">บุ๊กมาร์ก (Bookmarks)</span>
                <span class="link-desc">ดูโพสต์ที่คุณบันทึกไว้</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/messages" class="quick-link-item">
              <div class="link-icon-box cyan">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">กล่องข้อความ (Messages)</span>
                <span class="link-desc">แชทพูดคุยส่วนตัว</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Widget 3: Live Realtime Status Info -->
        <div class="side-card status-mini-card">
          <div class="realtime-status-row">
            <span class="status-pulse-dot"></span>
            <span class="status-text">ระบบแจ้งเตือนเรียลไทม์ทำงานอยู่</span>
          </div>
          <p class="status-hint">
            คุณจะได้รับการแจ้งเตือนอัตโนมัติสดๆ ทันทีที่มีความเคลื่อนไหว
          </p>
        </div>

      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({
  title: 'การแจ้งเตือน — ConnecXus',
})

const { data, pending, refresh } = await useFetch<any>('/api/notifications')
const notifications = computed(() => data.value?.notifications || [])

const activeFilter = ref<'all' | 'like' | 'comment' | 'follow' | 'community' | 'new_post'>('all')

const hasUnread = computed(() => notifications.value.some((n: any) => !n.is_read))

const likeCount = computed(() => notifications.value.filter((n: any) => n.type === 'like').length)
const commentCount = computed(() => notifications.value.filter((n: any) => n.type === 'comment').length)
const followCount = computed(() => notifications.value.filter((n: any) => n.type === 'follow').length)
const communityCount = computed(() => notifications.value.filter((n: any) => n.type?.startsWith('community')).length)
const newPostCount = computed(() => notifications.value.filter((n: any) => n.type === 'new_post').length)

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') return notifications.value
  if (activeFilter.value === 'community') {
    return notifications.value.filter((n: any) => n.type?.startsWith('community'))
  }
  return notifications.value.filter((n: any) => n.type === activeFilter.value)
})

const { clearUnread } = useUnreadNotifications()
const { subscribe, joinRoom, leaveRoom } = useRealtime()

let unsubscribeRealtime: (() => void) | null = null

onMounted(() => {
  clearUnread()
  refresh()
  
  // Mark all as read in the database in the background
  $fetch('/api/notifications/read-all', { method: 'PUT' }).catch(() => {})

  joinRoom('global')

  unsubscribeRealtime = subscribe((event) => {
    if ([
      'notification_update', 
      'notification_received', 
      'like_post', 
      'new_comment', 
      'repost', 
      'new_follower', 
      'new_post',
      'community_member_request',
      'community_member_joined'
    ].includes(event.type)) {
      refresh()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeRealtime) unsubscribeRealtime()
  leaveRoom('global')
})

async function markAllAsRead() {
  try {
    await $fetch('/api/notifications/read-all', { method: 'PUT' })
    notifications.value.forEach((n: any) => {
      n.is_read = true
    })
    clearUnread()
  } catch {}
}

async function handleNotificationClick(notif: any) {
  notif.is_read = true
  
  if (notif.type === 'community_request' && notif.community_slug) {
    navigateTo(`/community/${notif.community_slug}/settings?tab=requests`)
  } else if (notif.type === 'follow' && notif.sender_username) {
    navigateTo(`/profile/${notif.sender_username}`)
  } else if (notif.post_id) {
    navigateTo(`/post/${notif.post_id}`)
  } else if (notif.community_slug) {
    navigateTo(`/community/${notif.community_slug}`)
  }
}

// Helper for time formatting
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'เมื่อสักครู่'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  const hours = Math.floor(seconds / 60)
  if (hours < 24) return `${hours} ชม. ที่แล้ว`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} วันที่แล้ว`
  
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
/* ── Root & Fluid Container ── */
.notifications-page-root {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.notifications-container {
  display: flex;
  width: 100%;
  max-width: 1160px;
  min-width: 0;
  gap: 20px;
  padding: 20px 20px 96px;
  align-items: flex-start;
  box-sizing: border-box;
}

/* ── Left Main Column ── */
.notifications-main-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Header Card ── */
.notifications-header-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
}

.header-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(135deg, rgba(123, 108, 246, 0.2), rgba(6, 182, 212, 0.2));
  border: 1px solid rgba(123, 108, 246, 0.35);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(123, 108, 246, 0.2);
}

.header-title {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.btn-mark-read {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 100px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-mark-read:hover {
  background: var(--brand);
  color: #fff;
}

/* ── Filter Tabs ── */
.filter-tabs-scroller {
  width: 100%;
  box-sizing: border-box;
}

.filter-tabs-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.filter-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-tab-pill:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.filter-tab-pill.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  font-weight: 700;
}

/* ── States (Loading / Empty) ── */
.notifications-state-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--card-shadow);
}

.empty-state-glow-ring {
  position: relative;
  margin-bottom: 8px;
}

.empty-state-glow-ring::after {
  content: "";
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
}

.state-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.state-icon-circle.glowing {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.25);
  color: var(--brand);
}

.notifications-state-card h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 12px 0 6px;
}

.notifications-state-card p {
  font-size: 13.5px;
  color: var(--text-muted);
  max-width: 380px;
  line-height: 1.5;
  margin: 0;
}

.empty-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
}

.action-btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.action-btn-glass {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-btn-glass:hover {
  background: var(--bg-hover);
}

.action-btn-outline {
  margin-top: 14px;
  padding: 8px 18px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.action-btn-outline:hover {
  background: var(--bg-hover);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Notifications Stream List ── */
.notifications-stream-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
}

.notif-card-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background 0.18s ease;
}

.notif-card-item:last-child {
  border-bottom: none;
}

.notif-card-item:hover {
  background: var(--bg-hover);
}

.notif-card-item.is-unread {
  background: rgba(99, 102, 241, 0.05);
}

.notif-type-col {
  flex-shrink: 0;
}

.type-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.box-like {
  background: rgba(244, 63, 94, 0.12);
  color: #f43f5e;
}

.box-comment {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.box-follow {
  background: rgba(167, 139, 250, 0.12);
  color: #a78bfa;
}

.box-community {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.box-post {
  background: rgba(52, 211, 153, 0.12);
  color: #34d399;
}

.box-repost {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.notif-body-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sender-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notif-avatar-wrap {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notif-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.notif-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.notif-headline {
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--text-primary);
  word-break: break-word;
}

.notif-author-name {
  font-weight: 700;
  color: var(--text-primary);
  margin-right: 4px;
}

.notif-author-name:hover {
  text-decoration: underline;
  color: var(--brand);
}

.notif-action-text {
  color: var(--text-muted);
}

.notif-time-badge {
  font-size: 11.5px;
  color: var(--text-muted);
}

.notif-quote-bubble {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 12.5px;
  color: var(--text-muted);
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-arrow-col {
  flex-shrink: 0;
}

.view-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s;
  white-space: nowrap;
}

.notif-card-item:hover .view-pill-btn {
  background: var(--brand-light);
  color: var(--brand);
  border-color: rgba(99, 102, 241, 0.3);
}

.unread-dot-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 8px var(--brand);
  flex-shrink: 0;
}

/* ── Right Side Column ── */
.notifications-side-col {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 16px;
}

.side-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: var(--card-shadow);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.card-header-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-header-icon-box.purple {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}

.card-header-icon-box.blue {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.card-header h3 {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-cell {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: transform 0.2s ease;
}

.stat-cell:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.3);
}

.cell-val {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.cell-val.color-like { color: #f43f5e; }
.cell-val.color-comment { color: #38bdf8; }
.cell-val.color-follow { color: #a78bfa; }
.cell-val.color-post { color: #34d399; }

.cell-lbl {
  font-size: 11px;
  color: var(--text-muted);
}

/* Quick Links List */
.quick-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.quick-link-item:hover {
  background: var(--bg-hover);
}

.link-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-icon-box.blue {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.link-icon-box.emerald {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.link-icon-box.purple {
  background: rgba(168, 85, 247, 0.12);
  color: #8b5cf6;
}

.link-icon-box.cyan {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
}

.link-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.link-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.link-desc {
  font-size: 11px;
  color: var(--text-muted);
}

/* Status Mini Card */
.status-mini-card {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.realtime-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulseGreen 2s infinite;
}

@keyframes pulseGreen {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-text {
  font-size: 12px;
  font-weight: 700;
  color: #10b981;
}

.status-hint {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

/* ── Responsive Behavior on Resize (ขยายไปมา) ── */
@media (max-width: 920px) {
  .notifications-container {
    flex-direction: column;
    padding: 14px 12px 80px;
    gap: 16px;
  }
  
  .notifications-side-col {
    width: 100%;
    position: static;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .notifications-header-card {
    padding: 14px 16px;
    border-radius: 16px;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .header-icon-badge {
    width: 38px;
    height: 38px;
  }
  
  .notif-card-item {
    padding: 12px 14px;
    gap: 10px;
  }
  
  .notif-arrow-col {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
