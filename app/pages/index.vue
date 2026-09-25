<template>
  <div class="index-page-root">
    <!-- Centered Feed Container -->
    <div class="feed-layout-container">
      
      <!-- ══════════════════════════════════════════
           CENTER — Main Feed Column (Isolated Scroll)
      ══════════════════════════════════════════ -->
      <main class="feed-center-col" ref="feedCenterColRef">
        <!-- Sticky Glass Tab Bar -->
        <header class="feed-sticky-header">
          <!-- Mobile Top App Bar (Visible on mobile screens) -->
          <div class="mobile-app-header-bar">
            <div class="mobile-brand-group">
              <img src="/logo.jpg" alt="ConnecXus" class="mobile-logo-img" />
              <span class="mobile-logo-text">ConnecXus</span>
            </div>

            <div class="mobile-header-tools">
              <NuxtLink to="/explore" class="mobile-search-capsule" title="ค้นหาและเทรนด์">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span>ค้นหา & เทรนด์...</span>
              </NuxtLink>

              <button @click="toggleTheme" class="btn-mobile-tool-icon" :title="theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'">
                <svg v-if="theme === 'dark'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="feed-tabs-row">
            <button
              @click="handleTabClick('foryou')"
              class="feed-tab-btn"
              :class="{ 'is-active': activeTab === 'foryou' }"
              :title="activeTab === 'foryou' ? 'กดเพื่อเลื่อนขึ้นบนสุด / กดซ้ำเพื่อรีเฟรช' : 'สำหรับคุณ'"
            >
              <div class="tab-label-wrap">
                <span class="tab-label">สำหรับคุณ</span>
                <span v-if="isRefreshing && activeTab === 'foryou'" class="tab-refresh-spinner" />
              </div>
              <div v-if="activeTab === 'foryou'" class="active-tab-glow-indicator" />
            </button>

            <button
              @click="handleTabClick('following')"
              class="feed-tab-btn"
              :class="{ 'is-active': activeTab === 'following' }"
              :title="activeTab === 'following' ? 'กดเพื่อเลื่อนขึ้นบนสุด / กดซ้ำเพื่อรีเฟรช' : 'กำลังติดตาม'"
            >
              <div class="tab-label-wrap">
                <span class="tab-label">กำลังติดตาม</span>
                <span v-if="isRefreshing && activeTab === 'following'" class="tab-refresh-spinner" />
              </div>
              <div v-if="activeTab === 'following'" class="active-tab-glow-indicator" />
            </button>
          </div>

          <!-- Mobile Trending Chips Horizontal Strip (Under tabs) -->
          <div v-if="trendingTopics.length > 0" class="mobile-trending-chips-bar">
            <div class="trending-fire-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <span>มาแรง:</span>
            </div>
            <div class="trending-scroll-track">
              <button
                v-for="(trend, i) in trendingTopics.slice(0, 5)"
                :key="i"
                class="trend-chip-pill"
                :class="{ 'is-active': searchQuery === trend.title }"
                @click="setHashtagFilter(trend.title)"
              >
                <span class="chip-rank-num">#{{ i + 1 }}</span>
                <span class="chip-tag-text">{{ trend.title }}</span>
              </button>
              <NuxtLink to="/explore" class="trend-chip-more">
                ดูทั้งหมด →
              </NuxtLink>
            </div>
          </div>
        </header>

        <!-- Guest Welcome Banner (when not logged in) -->
        <div v-if="!user" class="guest-feed-banner">
          <div class="guest-feed-banner-content">
            <div class="guest-welcome-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
            </div>
            <div class="guest-welcome-text">
              <h3>ยินดีต้อนรับสู่ ConnecXus!</h3>
              <p>เข้าสู่ระบบหรือสมัครสมาชิกเพื่อแชร์ความคิดเห็น โพสต์รูป และติดตามเพื่อนๆ</p>
            </div>
          </div>
          <div class="guest-feed-actions">
            <NuxtLink to="/login" class="btn-feed-guest-login">เข้าสู่ระบบ</NuxtLink>
            <NuxtLink to="/register" class="btn-feed-guest-register">สมัครสมาชิก</NuxtLink>
          </div>
        </div>

        <!-- Post Composer Dock (when logged in) -->
        <PostComposer v-else @posted="handleNewPost" />

        <!-- Active Search / Hashtag Filter Banner -->
        <div v-if="searchQuery.trim()" class="active-filter-banner">
          <div class="filter-badge-content">
            <span class="filter-icon">
              <svg v-if="searchQuery.startsWith('#')" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <span class="filter-text">
              ผลการค้นหา: <strong>{{ searchQuery }}</strong>
              <span class="filter-count">({{ postsList.length }} โพสต์)</span>
            </span>
          </div>
          <button @click="clearSearch" class="btn-clear-filter" title="ล้างการค้นหา">
            <span>ล้างตัวกรอง</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- New Posts Floating Toast Banner -->
        <div v-if="newPostsCount > 0" class="new-posts-banner-wrap">
          <button @click="loadNewPosts" class="btn-new-posts-floating">
            <span class="sparkle-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
            </span>
            <span>มีโพสต์ใหม่ {{ newPostsCount }} รายการ</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="feed-loading-state">
          <div class="feed-spinner-ring"></div>
          <p>กำลังโหลดฟีดข้อความ...</p>
        </div>

        <!-- Empty Feed State -->
        <div v-else-if="postsList.length === 0" class="feed-empty-state">
          <div class="empty-feed-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <h3>{{ searchQuery.trim() ? 'ไม่พบโพสต์ที่ตรงกับคำค้นหา' : 'ยังไม่มีโพสต์ในหน้านี้' }}</h3>
          <p>{{ searchQuery.trim() ? `ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองเพื่อกลับสู่หน้าฟีดหลัก` : 'เป็นคนแรกที่แชร์เรื่องราวดีๆ ให้เพื่อนๆ ในคอมมูนิตี้กันเลย!' }}</p>
          <button @click="loadPosts" class="btn-retry-feed" style="margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 99px; background: rgba(99, 102, 241, 0.15); color: var(--brand); border: 1px solid rgba(99, 102, 241, 0.3); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>รีเฟรชฟีด</span>
          </button>
        </div>

        <!-- Posts Stream List with Mobile Suggested Users Carousel -->
        <div v-else class="feed-posts-stream">
          <template v-for="(post, index) in postsList" :key="post.id">
            <PostCard
              :post="post"
              @deleted="handleDeleted"
            />

            <!-- In-feed Mobile Suggested Users Strip (after 2nd post on mobile) -->
            <div v-if="index === 1 && suggestedUsers.length > 0" class="mobile-infeed-suggested-card">
              <div class="infeed-suggested-header">
                <div class="infeed-title">
                  <span>แนะนำให้ติดตาม</span>
                </div>
                <NuxtLink to="/explore" class="infeed-more-link">ดูทั้งหมด →</NuxtLink>
              </div>
              <div class="infeed-users-scroll">
                <div
                  v-for="suggested in suggestedUsers.slice(0, 5)"
                  :key="suggested.username"
                  class="infeed-user-item"
                  @click="navigateTo(`/profile/${suggested.username}`)"
                >
                  <div class="infeed-avatar-wrap">
                    <img v-if="suggested.avatar_url" :src="suggested.avatar_url" alt="avatar" />
                    <div v-else class="infeed-avatar-fallback" :style="`background: ${suggested.color || '#6366f1'};`">
                      {{ suggested.avatar_url ? '' : suggested.initials }}
                    </div>
                  </div>
                  <span class="infeed-name">{{ suggested.display_name }}</span>
                  <span class="infeed-handle">@{{ suggested.username }}</span>
                  <button
                    @click.stop="toggleFollow(suggested)"
                    class="btn-infeed-follow"
                    :class="{ 'is-following': suggested.is_following }"
                  >
                    {{ suggested.is_following ? 'กำลังติดตาม' : 'ติดตาม' }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </main>

      <!-- ══════════════════════════════════════════
           RIGHT — Sidebar Widgets
      ══════════════════════════════════════════ -->
      <aside class="right-sidebar feed-right-col">
        
        <!-- Search Capsule Bar -->
        <div class="search-widget-wrapper">
          <div class="search-input-pill">
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              class="search-lens-icon"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหา เช่น #วาดรูป, ผู้คน..."
              class="search-native-input"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="btn-clear-search"
              title="ล้างข้อความ"
            >✕</button>
          </div>

          <!-- User Search Auto-dropdown -->
          <div 
            v-if="searchQuery.trim() && searchedUsers.length > 0"
            class="searched-users-popover"
          >
            <div class="searched-header">
              <span>ผู้ใช้ที่ค้นพบ</span>
            </div>
            <NuxtLink
              v-for="u in searchedUsers"
              :key="u.id"
              :to="'/profile/' + u.username"
              class="searched-user-card"
            >
              <div class="searched-avatar-circle">
                <img v-if="u.avatar_url" :src="u.avatar_url" alt="avatar" />
                <div v-else class="avatar-letter-fallback">
                  {{ (u.display_name || u.username).charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="searched-user-info">
                <div class="searched-name">{{ u.display_name || u.username }}</div>
                <div class="searched-handle">@{{ u.username }}</div>
              </div>
              <div class="searched-arrow-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Trending Topics Card (มีอะไรเกิดขึ้นบ้าง) -->
        <div class="sidebar-glass-card">
          <div class="card-header-bar">
            <h3 class="card-title-heading">
              <span class="card-svg-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              </span>
              <span>มีอะไรเกิดขึ้นบ้าง</span>
            </h3>
          </div>

          <div class="trends-items-list">
            <div
              v-for="(trend, i) in displayedTrends"
              :key="i"
              class="trend-item-row"
              @click="setHashtagFilter(trend.title)"
            >
              <div class="trend-meta-header">
                <span class="trend-rank-badge">#{{ i + 1 }}</span>
                <span class="trend-category-tag">{{ trend.category }}</span>
              </div>
              <div class="trend-title-text">
                {{ trend.title }}
              </div>
              <div v-if="trend.posts" class="trend-posts-count">
                {{ trend.posts }}
              </div>
            </div>
          </div>
        </div>

        <!-- Suggested Users Card (ติดตามใครดี) -->
        <div class="sidebar-glass-card">
          <div class="card-header-bar">
            <h3 class="card-title-heading">
              <span class="card-svg-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </span>
              <span>ติดตามใครดี</span>
            </h3>
          </div>

          <div class="suggested-users-list">
            <div
              v-for="suggested in suggestedUsers"
              :key="suggested.username"
              class="suggested-user-row"
              @click="navigateTo(`/profile/${suggested.username}`)"
            >
              <!-- Avatar -->
              <div class="suggested-avatar-box">
                <img v-if="suggested.avatar_url" :src="suggested.avatar_url" alt="avatar" />
                <div v-else class="suggested-fallback" :style="`background: ${suggested.color || '#6366f1'};`">
                  {{ suggested.avatar_url ? '' : suggested.initials }}
                </div>
              </div>

              <!-- Info -->
              <div class="suggested-info-box">
                <div class="suggested-display-name">
                  {{ suggested.display_name }}
                </div>
                <div class="suggested-handle">
                  @{{ suggested.username }}
                </div>
              </div>

              <!-- Follow Button -->
              <button
                @click.stop="toggleFollow(suggested)"
                class="btn-suggested-follow"
                :class="{ 'is-following': suggested.is_following }"
              >
                {{ suggested.is_following ? 'กำลังติดตาม' : 'ติดตาม' }}
              </button>
            </div>
          </div>

          <button class="btn-card-more" @click="fetchSuggestedUsers">
            <span>แสดงเพิ่มเติม</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Footer Meta -->
        <footer class="sidebar-footer-links">
          <div class="footer-links-row">
            <a href="#">ข้อกำหนดการใช้งาน</a>
            <a href="#">นโยบายความเป็นส่วนตัว</a>
            <a href="#">ความปลอดภัย</a>
          </div>
          <div class="footer-copyright">
            © 2026 ConnecXus, Inc.
          </div>
        </footer>

      </aside>

    </div>

    <!-- Confirm Unfollow Modal -->
    <AppConfirmModal
      :isOpen="isConfirmUnfollowOpen"
      title="เลิกติดตาม"
      :message="`คุณต้องการเลิกติดตาม @${userToUnfollow?.username} ใช่หรือไม่?`"
      confirmText="เลิกติดตาม"
      @confirm="() => { executeToggleFollow(userToUnfollow); isConfirmUnfollowOpen = false }"
      @cancel="isConfirmUnfollowOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'ฟีดข่าว — ConnecXus',
  meta: [{ name: 'description', content: 'ฟีดข่าวและอัปเดตจากชุมชนของคุณ' }],
})

const route = useRoute()
const router = useRouter()

const activeTab = ref<'foryou' | 'following'>('foryou')
const searchQuery = ref('')
const { user } = useAuth()
const { openLoginModal } = useLoginModal()
const { theme, toggleTheme } = useTheme()
const toast = useToast()
const { subscribe, publish } = useRealtime()

let unsubscribeRealtime: (() => void) | null = null
const newPostsCount = ref(0)
const pending = ref(false)
const isRefreshing = ref(false)

const postsList = ref<any[]>([])
const feedCenterColRef = ref<HTMLElement | null>(null)

function scrollToTop() {
  if (feedCenterColRef.value) {
    feedCenterColRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
    document.body.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function getScrollTop(): number {
  if (feedCenterColRef.value && feedCenterColRef.value.scrollTop > 0) {
    return feedCenterColRef.value.scrollTop
  }
  if (typeof window === 'undefined') return 0
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

async function handleTabClick(tab: 'foryou' | 'following') {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    if (searchQuery.value) {
      searchQuery.value = ''
      router.push({ query: {} })
    }
    scrollToTop()
    await loadPosts()
    return
  }

  // Same tab clicked
  const currentScroll = getScrollTop()

  if (currentScroll > 15) {
    // 1. If currently scrolled down, scroll smoothly to top
    scrollToTop()
  } else {
    // 2. If already at top, refresh the posts feed!
    isRefreshing.value = true
    try {
      if (searchQuery.value) {
        searchQuery.value = ''
        router.push({ query: {} })
      }
      scrollToTop()
      await loadPosts()
      fetchTrendingTopics()
      toast.add({
        title: 'อัปเดตฟีดแล้ว',
        description: 'โหลดโพสต์ล่าสุดเรียบร้อย',
      })
    } finally {
      setTimeout(() => {
        isRefreshing.value = false
      }, 500)
    }
  }
}

function setHashtagFilter(tag: string) {
  searchQuery.value = tag
  router.push({ query: { q: tag } })
  loadPosts()
}

function clearSearch() {
  searchQuery.value = ''
  router.push({ query: {} })
  loadPosts()
}

async function loadPosts() {
  pending.value = true
  try {
    if (searchQuery.value.trim()) {
      const res = await $fetch<any>('/api/posts/search', {
        query: { q: searchQuery.value.trim() }
      })
      if (res?.posts) {
        postsList.value = [...res.posts]
      }
    } else {
      const res = await $fetch<any>('/api/posts', {
        query: { tab: activeTab.value }
      })
      if (res?.posts) {
        postsList.value = [...res.posts]
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    pending.value = false
  }
}

const searchedUsers = ref<any[]>([])

let searchTimeout: any = null
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    loadPosts()
    if (val.trim()) {
      try {
        const res = await $fetch<any>('/api/users/search', {
          query: { q: val.trim() }
        })
        searchedUsers.value = res?.users || []
      } catch (e) {
        searchedUsers.value = []
      }
    } else {
      searchedUsers.value = []
    }
  }, 400) // debounce
})

watch(activeTab, () => {
  if (!searchQuery.value.trim()) {
    loadPosts()
  }
})

// Sync route query
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = String(route.query.q)
    loadPosts()
  } else {
    loadPosts()
  }
})

watch(() => route.query.q, (newQ) => {
  if (newQ !== undefined) {
    const qStr = String(newQ || '')
    if (qStr !== searchQuery.value) {
      searchQuery.value = qStr
      loadPosts()
    }
  } else if (searchQuery.value) {
    searchQuery.value = ''
    loadPosts()
  }
})

// Trending Topics (Dynamic from Database)
const trendingTopics = ref<any[]>([])

const displayedTrends = computed(() => {
  return trendingTopics.value.slice(0, 5)
})

async function fetchTrendingTopics() {
  try {
    const res = await $fetch<any>('/api/trends')
    if (res?.trends) {
      trendingTopics.value = res.trends
    }
  } catch (err) {
    console.error('Error fetching trending topics:', err)
  }
}

// Suggested Users
const suggestedUsers = ref<any[]>([])

async function fetchSuggestedUsers() {
  try {
    const res = await $fetch<any>('/api/users/suggested')
    if (res?.users) {
      suggestedUsers.value = res.users
    }
  } catch {
    suggestedUsers.value = [
      { display_name: 'Admin', username: 'admin', initials: 'Ad', color: '#6366f1', avatar_url: null },
    ]
  }
}

const isConfirmUnfollowOpen = ref(false)
const userToUnfollow = ref<any>(null)

async function toggleFollow(userToFollowRef: any) {
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อติดตามผู้ใช้นี้')
    return
  }
  if (userToFollowRef.is_following) {
    userToUnfollow.value = userToFollowRef
    isConfirmUnfollowOpen.value = true
  } else {
    executeToggleFollow(userToFollowRef)
  }
}

async function executeToggleFollow(u: any) {
  try {
    const res = await $fetch<any>(`/api/users/follow`, { 
      method: 'POST',
      body: { username: u.username }
    })
    u.is_following = res.following
    if (!res.following) {
      toast.add({
        title: 'เลิกติดตามแล้ว',
        description: `คุณได้เลิกติดตาม @${u.username} เรียบร้อยแล้ว`,
        icon: 'i-heroicons-user-minus',
        color: 'gray'
      })
    }
  } catch (err: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err.data?.message || 'ไม่สามารถดำเนินการได้',
      icon: 'i-heroicons-exclamation-circle',
      color: 'red'
    })
    console.error('Failed to toggle follow', err)
  }
}

const pendingNewPosts = ref<any[]>([])

onMounted(() => {
  fetchSuggestedUsers()
  fetchTrendingTopics()

  // Realtime subscription
  unsubscribeRealtime = subscribe((event) => {
    // New Post
    if ((event.type === 'new_post' || event.type === 'NEW_POST') && event.payload) {
      if (event.payload.source_username !== user.value?.username) {
        if (event.payload.is_community_only) return
        newPostsCount.value++
        if (event.payload.post) {
          pendingNewPosts.value.push(event.payload.post)
        }
      }
    }
    
    // Live Like
    if (event.type === 'like_post' && event.payload?.post_id) {
      const post = postsList.value.find(p => p.id === event.payload.post_id)
      if (post) {
        if (event.payload.like_count !== undefined) {
          post.like_count = event.payload.like_count
        } else {
          post.like_count = (post.like_count || 0) + (event.payload.action === 'like' ? 1 : -1)
        }
      }
    }

    // Live Comment Count
    if (event.type === 'new_comment' && event.payload?.post_id) {
      const post = postsList.value.find(p => p.id === event.payload.post_id)
      if (post) {
        if (event.payload.comment_count !== undefined) {
          post.comment_count = event.payload.comment_count
        } else {
          post.comment_count = (post.comment_count || 0) + 1
        }
      }
    }
    if (event.type === 'comment_deleted' && event.payload?.post_id) {
      const post = postsList.value.find(p => p.id === event.payload.post_id)
      if (post) {
        if (event.payload.comment_count !== undefined) {
          post.comment_count = event.payload.comment_count
        } else {
          post.comment_count = Math.max(0, (post.comment_count || 0) - 1)
        }
      }
    }

    // Live Repost Count
    if (event.type === 'repost' && event.payload?.post_id) {
      const post = postsList.value.find(p => p.id === event.payload.post_id)
      if (post) {
        if (event.payload.repost_count !== undefined) {
          post.repost_count = event.payload.repost_count
        } else if (Number(event.payload?.user_id) !== Number(user.value?.id)) {
          post.repost_count = (post.repost_count || 0) + 1
        }
        if (Number(event.payload?.user_id) === Number(user.value?.id)) {
          post.isReposted = true
        }
      }
    }
    if (event.type === 'unrepost' && event.payload?.post_id) {
      const post = postsList.value.find(p => p.id === event.payload.post_id)
      if (post) {
        if (event.payload.repost_count !== undefined) {
          post.repost_count = event.payload.repost_count
        } else if (Number(event.payload?.user_id) !== Number(user.value?.id)) {
          post.repost_count = Math.max(0, (post.repost_count || 0) - 1)
        }
        if (Number(event.payload?.user_id) === Number(user.value?.id)) {
          post.isReposted = false
        }
      }
    }

    // Live Post Delete/Edit
    if (event.type === 'post_deleted' && event.payload?.post_id) {
      postsList.value = postsList.value.filter(p => p.id !== event.payload.post_id)
      fetchTrendingTopics()
    }
    if (event.type === 'post_updated' && event.payload?.post_id) {
      const post = postsList.value.find(p => p.id === event.payload.post_id)
      if (post && event.payload.content) post.content = event.payload.content
      fetchTrendingTopics()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeRealtime) unsubscribeRealtime()
})

async function loadNewPosts() {
  if (pendingNewPosts.value.length > 0) {
    postsList.value.unshift(...pendingNewPosts.value.reverse())
    pendingNewPosts.value = []
    newPostsCount.value = 0
  } else {
    newPostsCount.value = 0
    await loadPosts()
  }
}

async function handleNewPost(payload: string | { content: string; image_url?: string | null; visibility?: string; is_community_only?: boolean }) {
  const content = typeof payload === 'string' ? payload : payload.content
  const imageUrl = typeof payload === 'string' ? null : payload.image_url
  const visibility = typeof payload === 'object' && payload.visibility ? payload.visibility : 'public'
  const isCommunityOnly = typeof payload === 'object' ? payload.is_community_only : false

  try {
    const res = await $fetch<{ success: boolean; id: number }>('/api/posts', {
      method: 'POST',
      body: { content, image_url: imageUrl, visibility, is_community_only: isCommunityOnly },
    })

    const postId = Number(res?.id) || Date.now()
    const newPost = {
      id: postId,
      author_id: user.value?.id,
      author_display_name: user.value?.display_name || 'ผู้ใช้',
      author_username: user.value?.username || 'user',
      authorInitials: user.value?.display_name ? user.value.display_name.trim().slice(0, 2) : 'ผ',
      author_avatar_url: user.value?.avatar_url || null,
      avatarBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      time_ago: 'เมื่อสักครู่',
      community_name: null,
      community_slug: null,
      community_id: null,
      content,
      image_url: imageUrl || null,
      visibility,
      is_community_only: isCommunityOnly,
      like_count: 0,
      comment_count: 0,
      isLiked: false,
      isBookmarked: false,
    }

    if (!postsList.value.some((p) => Number(p.id) === postId)) {
      postsList.value.unshift(newPost)
    }

    fetchTrendingTopics()
  } catch (err) {
    console.error(err)
  }
}

function handleDeleted(postId: number | string) {
  postsList.value = postsList.value.filter((p) => p.id !== postId)
}
</script>

<style scoped>
/* ══════════════════════════════════════════
   GLOBAL FEED PAGE & ROOT WRAPPER
══════════════════════════════════════════ */
.index-page-root {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-primary);
  font-family: inherit;
}

.feed-layout-container {
  display: flex;
  width: 100%;
  max-width: 1160px;
  height: 100vh;
  overflow: hidden;
  align-items: flex-start;
  margin: 0 auto;
  justify-content: center;
}

/* ══════════════════════════════════════════
   MAIN CENTER FEED COLUMN (ONLY THIS SCROLLS!)
══════════════════════════════════════════ */
.feed-center-col {
  flex: 1 1 0;
  min-width: 0;
  max-width: 680px;
  border-right: 1px solid var(--border-primary);
  border-left: 1px solid var(--border-primary);
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
}

/* Custom Sleek Scrollbars */
.feed-center-col::-webkit-scrollbar {
  width: 6px;
}
.feed-center-col::-webkit-scrollbar-track {
  background: transparent;
}
.feed-center-col::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 99px;
}
.feed-center-col::-webkit-scrollbar-thumb:hover {
  background: var(--brand);
}

/* Sticky Header Tab Bar */
.feed-sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--glass-bg);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-bottom: 1px solid var(--border-primary);
}

.feed-tabs-row {
  display: flex;
}

.feed-tab-btn {
  flex: 1;
  padding: 16px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 600;
  color: var(--text-muted);
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.feed-tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.feed-tab-btn.is-active {
  color: var(--text-primary);
  font-weight: 800;
}

.tab-label-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tab-refresh-spinner {
  width: 13px;
  height: 13px;
  border: 2px solid var(--border-secondary);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.active-tab-glow-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 4px;
  border-radius: 99px;
  background: var(--brand-gradient);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
}

/* Floating New Posts Banner */
.new-posts-banner-wrap {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(99, 102, 241, 0.06);
}

/* Active Search / Hashtag Filter Banner */
.active-filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(99, 102, 241, 0.25);
  backdrop-filter: blur(12px);
  animation: fadeInDown 0.2s ease-out;
}

.filter-badge-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
}

.filter-icon {
  font-size: 16px;
}

.filter-text strong {
  color: #a5b4fc;
}

.filter-count {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-left: 4px;
}

.btn-clear-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-clear-filter:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.btn-new-posts-floating {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: 8px 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
  animation: bounceIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-new-posts-floating:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.6);
}

.sparkle-icon {
  font-size: 14px;
}

/* Loading & Empty Feed */
.feed-loading-state,
.feed-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  color: var(--text-muted);
}

.feed-spinner-ring {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 14px;
}

.empty-feed-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  margin-bottom: 16px;
}

.feed-empty-state h3 {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.feed-empty-state p {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 320px;
  margin: 0;
  line-height: 1.5;
}

/* ══════════════════════════════════════════
   RIGHT SIDEBAR WIDGETS (FIXED COLUMN)
══════════════════════════════════════════ */
.feed-right-col {
  width: 340px;
  flex-shrink: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.feed-right-col::-webkit-scrollbar {
  width: 5px;
}
.feed-right-col::-webkit-scrollbar-track {
  background: transparent;
}
.feed-right-col::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 99px;
}
.feed-right-col::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.3);
}

/* Search Bar Pill */
.search-widget-wrapper {
  position: relative;
  z-index: 50;
}

.search-input-pill {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-lens-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-native-input {
  width: 100%;
  padding: 11px 40px 11px 42px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 9999px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14.5px;
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.search-native-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.btn-clear-search {
  position: absolute;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.btn-clear-search:hover {
  background: var(--border-secondary);
  color: var(--text-primary);
}

/* Searched Users Popover */
.searched-users-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: var(--popover-bg);
  border: 1px solid var(--border-primary);
  border-radius: 18px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(24px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeInDown 0.18s ease-out;
}

.searched-header {
  padding: 12px 16px 6px;
  font-size: 12px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.searched-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}

.searched-user-card:hover {
  background: var(--bg-hover);
}

.searched-avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-tertiary);
  flex-shrink: 0;
  border: 1px solid var(--border-primary);
}

.searched-avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  background: var(--brand-gradient);
}

.searched-user-info {
  flex: 1;
  min-width: 0;
}

.searched-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.searched-handle {
  font-size: 12.5px;
  color: var(--text-muted);
}

.searched-arrow-icon {
  color: var(--text-muted);
}

/* Sidebar Glass Card */
.sidebar-glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.card-header-bar {
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--border-primary);
}

.card-title-heading {
  margin: 0;
  font-size: 17.5px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.3px;
}

.card-emoji-icon {
  font-size: 18px;
}

/* Trends Items */
.trends-items-list {
  display: flex;
  flex-direction: column;
}

.trend-item-row {
  padding: 13px 18px;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.trend-item-row:last-child {
  border-bottom: none;
}

.trend-item-row:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
}

.trend-meta-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.trend-rank-badge {
  font-weight: 800;
  font-size: 12.5px;
  color: var(--brand);
}

.trend-category-tag {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.trend-title-text {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 3px 0 2px;
  letter-spacing: -0.2px;
  word-break: break-word;
}

.trend-posts-count {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 1px;
}

/* Suggested Users */
.suggested-users-list {
  display: flex;
  flex-direction: column;
}

.suggested-user-row {
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border-primary);
}

.suggested-user-row:last-child {
  border-bottom: none;
}

.suggested-user-row:hover {
  background: var(--bg-hover);
}

.suggested-avatar-box {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1.5px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.suggested-avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.suggested-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #fff;
}

.suggested-info-box {
  flex: 1;
  min-width: 0;
}

.suggested-display-name {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggested-handle {
  font-size: 12.5px;
  color: var(--text-muted);
}

.btn-suggested-follow {
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid var(--border-primary);
  background: var(--text-primary);
  color: var(--bg-primary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.btn-suggested-follow:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.btn-suggested-follow.is-following {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

.btn-suggested-follow.is-following:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Card More Button */
.btn-card-more {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 13px 18px;
  color: var(--brand);
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  border: none;
  border-top: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-card-more:hover {
  background: var(--bg-hover);
}

/* Sidebar Footer */
.sidebar-footer-links {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-links-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-links-row a {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-links-row a:hover {
  color: var(--text-primary);
}

.footer-copyright {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.7;
}

/* ══════════════════════════════════════════
   MOBILE APP HEADER BAR
══════════════════════════════════════════ */
.mobile-app-header-bar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 6px;
  gap: 12px;
}

.mobile-brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mobile-logo-img {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
}

.mobile-logo-text {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #a78bfa, #7b6cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-header-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
}

.mobile-search-capsule {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 99px;
  padding: 6px 12px;
  font-size: 12.5px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.2s;
  max-width: 180px;
  flex: 1;
}

.mobile-search-capsule:hover {
  border-color: var(--brand);
  color: var(--text-primary);
}

.mobile-search-capsule span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-mobile-tool-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  transition: transform 0.15s;
}

.btn-mobile-tool-icon:hover {
  transform: scale(1.08);
}

/* ══════════════════════════════════════════
   MOBILE TRENDING CHIPS STRIP
══════════════════════════════════════════ */
.mobile-trending-chips-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 10px;
  border-top: 1px solid var(--border-secondary);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.mobile-trending-chips-bar::-webkit-scrollbar {
  display: none;
}

.trending-fire-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--brand);
  white-space: nowrap;
  flex-shrink: 0;
}

.trending-scroll-track {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.trend-chip-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.trend-chip-pill:hover,
.trend-chip-pill.is-active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
}

.chip-rank-num {
  font-size: 10px;
  color: var(--brand);
  font-weight: 800;
  opacity: 0.8;
}

.chip-tag-text {
  font-weight: 600;
}

.trend-chip-more {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 99px;
  background: transparent;
  white-space: nowrap;
}

/* ══════════════════════════════════════════
   GUEST WELCOME BANNER ON FEED
══════════════════════════════════════════ */
.guest-feed-banner {
  margin: 14px 16px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(123, 108, 246, 0.12), rgba(56, 189, 248, 0.08));
  border: 1px solid rgba(123, 108, 246, 0.25);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guest-feed-banner-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.guest-welcome-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand), #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(123, 108, 246, 0.3);
}

.guest-welcome-text h3 {
  margin: 0 0 2px;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.guest-welcome-text p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.guest-feed-actions {
  display: flex;
  gap: 10px;
}

.btn-feed-guest-login {
  flex: 1;
  padding: 9px 16px;
  border-radius: 12px;
  background: var(--brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn-feed-guest-login:hover {
  opacity: 0.9;
}

.btn-feed-guest-register {
  flex: 1;
  padding: 9px 16px;
  border-radius: 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-feed-guest-register:hover {
  background: var(--border-secondary);
}

/* ══════════════════════════════════════════
   IN-FEED MOBILE SUGGESTED USERS CARD
══════════════════════════════════════════ */
.mobile-infeed-suggested-card {
  margin: 8px 0 16px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 18px;
  box-shadow: var(--card-shadow);
}

.infeed-suggested-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.infeed-title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--text-primary);
}

.infeed-more-link {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--brand);
  text-decoration: none;
}

.infeed-users-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.infeed-user-item {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.15s;
}

.infeed-user-item:hover {
  transform: translateY(-2px);
}

.infeed-avatar-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 6px;
}

.infeed-avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.infeed-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
}

.infeed-name {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.infeed-handle {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.btn-infeed-follow {
  width: 100%;
  padding: 4px 8px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid var(--border-primary);
  background: var(--text-primary);
  color: var(--bg-primary);
  transition: all 0.2s;
}

.btn-infeed-follow.is-following {
  background: var(--bg-tertiary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

/* Keyframe Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bounceIn {
  0% { transform: scale(0.85); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 880px) {
  .right-sidebar {
    display: none !important;
  }
  .feed-center-col {
    max-width: 100% !important;
    border-left: none !important;
    border-right: none !important;
    padding-bottom: 72px;
  }
  .mobile-app-header-bar {
    display: flex;
  }
}
</style>

