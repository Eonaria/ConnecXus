<template>
  <div class="explore-page-root">
    <div class="explore-layout-container">
      
      <!-- Main Content Column -->
      <main class="explore-main-col">
        
        <!-- Header & Search Bar -->
        <header class="explore-sticky-header">
          <div class="explore-header-top">
            <div class="explore-brand-badge">
              <span class="explore-brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              </span>
              <h1 class="explore-page-title">ค้นหา & เทรนด์ฮิต</h1>
            </div>
          </div>

          <!-- Search Input Box -->
          <div class="explore-search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาแฮชแท็ก, หัวข้อ, หรือชื่อผู้ใช้..."
              class="explore-search-input"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn" title="ล้างการค้นหา">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Sub Tabs Bar -->
          <div class="explore-tabs-bar">
            <button
              @click="activeTab = 'trends'"
              class="explore-tab-btn"
              :class="{ 'is-active': activeTab === 'trends' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <span>มีอะไรเกิดขึ้นบ้าง</span>
              <div v-if="activeTab === 'trends'" class="tab-glow-indicator" />
            </button>

            <button
              @click="activeTab = 'users'"
              class="explore-tab-btn"
              :class="{ 'is-active': activeTab === 'users' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <span>ติดตามใครดี</span>
              <div v-if="activeTab === 'users'" class="tab-glow-indicator" />
            </button>

            <button
              v-if="searchQuery.trim()"
              @click="activeTab = 'posts'"
              class="explore-tab-btn"
              :class="{ 'is-active': activeTab === 'posts' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span>โพสต์ ({{ searchedPosts.length }})</span>
              <div v-if="activeTab === 'posts'" class="tab-glow-indicator" />
            </button>
          </div>
        </header>

        <!-- Searched Users Dropdown / Preview (when typing) -->
        <div v-if="searchQuery.trim() && searchedUsers.length > 0 && activeTab !== 'users'" class="searched-users-card">
          <div class="card-section-title">
            <span>ผู้ใช้ที่ตรงกับคำค้นหา</span>
          </div>
          <div class="searched-users-grid">
            <NuxtLink
              v-for="u in searchedUsers.slice(0, 4)"
              :key="u.id"
              :to="'/profile/' + u.username"
              class="searched-user-item"
            >
              <div class="user-avatar-wrap">
                <img v-if="u.avatar_url" :src="u.avatar_url" alt="avatar" />
                <div v-else class="avatar-fallback">{{ (u.display_name || u.username).charAt(0).toUpperCase() }}</div>
              </div>
              <div class="user-names-wrap">
                <span class="user-display">{{ u.display_name || u.username }}</span>
                <span class="user-handle">@{{ u.username }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- TAB 1: TRENDING TOPICS (มีอะไรเกิดขึ้นบ้าง) -->
        <div v-if="activeTab === 'trends'" class="explore-tab-content">
          <div class="explore-glass-card">
            <div class="card-hero-header">
              <div class="hero-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              </div>
              <div>
                <h2>เทรนด์ยอดนิยม</h2>
                <p>เรื่องราวและแฮชแท็กที่ผู้คนกำลังพูดถึงมากที่สุด</p>
              </div>
            </div>

            <!-- Loading Trends -->
            <div v-if="trendsLoading" class="explore-loading-state">
              <div class="spinner-small"></div>
              <span>กำลังโหลดเทรนด์ฮิต...</span>
            </div>

            <!-- Trends List -->
            <div v-else-if="filteredTrends.length > 0" class="explore-trends-list">
              <div
                v-for="(trend, i) in filteredTrends"
                :key="i"
                class="explore-trend-card-row"
                @click="goToTrendPosts(trend.title)"
              >
                <div class="trend-rank-number">
                  <span class="rank-badge">#{{ i + 1 }}</span>
                </div>

                <div class="trend-body-info">
                  <div class="trend-category-lbl">
                    <span>{{ trend.category || 'กำลังมาแรง' }}</span>
                    <span class="trend-dot">•</span>
                    <span class="trend-time">อัปเดตเรียลไทม์</span>
                  </div>
                  <div class="trend-main-hashtag">
                    {{ trend.title }}
                  </div>
                  <div v-if="trend.posts" class="trend-posts-stat">
                    {{ trend.posts }}
                  </div>
                </div>

                <div class="trend-arrow-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            </div>

            <div v-else class="explore-empty-state">
              <p>{{ searchQuery.trim() ? 'ไม่พบแฮชแท็กที่ตรงกับการค้นหา' : 'ยังไม่มีเทรนด์ยอดนิยมในขณะนี้' }}</p>
            </div>
          </div>
        </div>

        <!-- TAB 2: SUGGESTED USERS (ติดตามใครดี) -->
        <div v-else-if="activeTab === 'users'" class="explore-tab-content">
          <div class="explore-glass-card">
            <div class="card-hero-header">
              <div class="hero-icon-box purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </div>
              <div>
                <h2>แนะนำให้ติดตาม</h2>
                <p>ค้นหาและทำความรู้จักกับเพื่อนใหม่ใน ConnecXus</p>
              </div>
            </div>

            <div class="suggested-users-full-list">
              <div
                v-for="suggested in displayedSuggestedUsers"
                :key="suggested.username"
                class="suggested-user-card-item"
                @click="navigateTo(`/profile/${suggested.username}`)"
              >
                <div class="suggested-avatar-box">
                  <img v-if="suggested.avatar_url" :src="suggested.avatar_url" alt="avatar" />
                  <div v-else class="suggested-fallback" :style="{ background: suggested.color || '#6366f1' }">
                    {{ suggested.avatar_url ? '' : suggested.initials }}
                  </div>
                </div>

                <div class="suggested-info-box">
                  <div class="suggested-display-name">
                    {{ suggested.display_name }}
                  </div>
                  <div class="suggested-handle">
                    @{{ suggested.username }}
                  </div>
                  <div v-if="suggested.bio" class="suggested-bio-snippet">
                    {{ suggested.bio }}
                  </div>
                </div>

                <button
                  @click.stop="toggleFollow(suggested)"
                  class="btn-suggested-follow"
                  :class="{ 'is-following': suggested.is_following }"
                >
                  {{ suggested.is_following ? 'กำลังติดตาม' : 'ติดตาม' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: SEARCHED POSTS -->
        <div v-else-if="activeTab === 'posts'" class="explore-tab-content">
          <div v-if="postsLoading" class="explore-loading-state">
            <div class="spinner-small"></div>
            <span>กำลังค้นหาโพสต์...</span>
          </div>

          <div v-else-if="searchedPosts.length === 0" class="explore-empty-state">
            <p>ไม่พบโพสต์ที่ตรงกับ "{{ searchQuery }}"</p>
          </div>

          <div v-else class="searched-posts-feed">
            <PostCard
              v-for="post in searchedPosts"
              :key="post.id"
              :post="post"
            />
          </div>
        </div>

      </main>

      <!-- Right Column (Desktop sidebar widgets) -->
      <aside class="right-sidebar explore-right-col">
        <!-- Quick Guidelines Card -->
        <div class="sidebar-glass-card">
          <div class="card-header-bar">
            <h3 class="card-title-heading">
              <span class="card-svg-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
                </svg>
              </span>
              <span>สำรวจอะไรดี</span>
            </h3>
          </div>
          <div class="explore-tip-body">
            <p>• ใช้ <strong>#แฮชแท็ก</strong> เพื่อค้นหาประเด็นที่กำลังฮิต</p>
            <p>• ใช้ <strong>@ชื่อผู้ใช้</strong> เพื่อค้นหาเพื่อนหรือครีเอเตอร์</p>
            <p>• กดติดตามผู้ใช้เพื่อดูโพสต์ของพวกเขาในแท็บ <strong>กำลังติดตาม</strong></p>
          </div>
        </div>

        <!-- Helpful Shortcuts Widget -->
        <div class="sidebar-glass-card">
          <div class="card-header-bar">
            <h3 class="card-title-heading">
              <span class="card-svg-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </span>
              <span>ทางลัดแนะนำ</span>
            </h3>
          </div>
          <div class="quick-links-list" style="padding: 10px 12px;">
            <NuxtLink to="/" class="quick-link-item">
              <div class="link-icon-box blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">หน้าแรก (Home Feed)</span>
                <span class="link-desc">สำรวจโพสต์ล่าสุด</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/community" class="quick-link-item">
              <div class="link-icon-box green">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">ชุมชน (Communities)</span>
                <span class="link-desc">ค้นหากลุ่มตามความสนใจ</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/bookmarks" class="quick-link-item">
              <div class="link-icon-box purple">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">บุ๊กมาร์ก (Bookmarks)</span>
                <span class="link-desc">โพสต์ที่บันทึกไว้</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Footer -->
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
import PostCard from '~/components/post/PostCard.vue'
import AppConfirmModal from '~/components/AppConfirmModal.vue'

useHead({
  title: 'ค้นหา & เทรนด์ฮิต — ConnecXus',
  meta: [{ name: 'description', content: 'สำรวจเทรนด์ แฮชแท็กยอดนิยม และผู้คนที่น่าติดตามบน ConnecXus' }]
})

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { openLoginModal } = useLoginModal()
const { theme, toggleTheme } = useTheme()
const toast = useToast()

const activeTab = ref<'trends' | 'users' | 'posts'>('trends')
const searchQuery = ref('')
const trendsLoading = ref(true)
const postsLoading = ref(false)

const trendingTopics = ref<any[]>([])
const suggestedUsers = ref<any[]>([])
const searchedUsers = ref<any[]>([])
const searchedPosts = ref<any[]>([])

const isConfirmUnfollowOpen = ref(false)
const userToUnfollow = ref<any>(null)

onMounted(async () => {
  if (route.query.q) {
    searchQuery.value = String(route.query.q)
    activeTab.value = 'posts'
  }
  await Promise.all([fetchTrendingTopics(), fetchSuggestedUsers()])
})

// Fetch Trends
async function fetchTrendingTopics() {
  trendsLoading.value = true
  try {
    const res = await $fetch<any>('/api/trends')
    if (res?.trends) {
      trendingTopics.value = res.trends
    }
  } catch (e) {
    console.error('Failed to load trends', e)
  } finally {
    trendsLoading.value = false
  }
}

// Fetch Suggested Users
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

const filteredTrends = computed(() => {
  if (!searchQuery.value.trim()) return trendingTopics.value
  const q = searchQuery.value.toLowerCase().trim()
  return trendingTopics.value.filter(t => t.title?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q))
})

const displayedSuggestedUsers = computed(() => {
  if (!searchQuery.value.trim()) return suggestedUsers.value
  const q = searchQuery.value.toLowerCase().trim()
  return suggestedUsers.value.filter(u => u.display_name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q))
})

function goToTrendPosts(tag: string) {
  router.push(`/?q=${encodeURIComponent(tag)}`)
}

// Search debounce
let searchTimer: any = null
watch(searchQuery, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (val.trim()) {
      postsLoading.value = true
      try {
        const [userRes, postRes] = await Promise.all([
          $fetch<any>('/api/users/search', { query: { q: val.trim() } }).catch(() => ({ users: [] })),
          $fetch<any>('/api/posts/search', { query: { q: val.trim() } }).catch(() => ({ posts: [] }))
        ])
        searchedUsers.value = userRes?.users || []
        searchedPosts.value = postRes?.posts || []
      } finally {
        postsLoading.value = false
      }
    } else {
      searchedUsers.value = []
      searchedPosts.value = []
      if (activeTab.value === 'posts') activeTab.value = 'trends'
    }
  }, 350)
})

async function toggleFollow(userToFollowRef: any) {
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อติดตามผู้ใช้นี้')
    return
  }

  if (userToFollowRef.is_following) {
    userToUnfollow.value = userToFollowRef
    isConfirmUnfollowOpen.value = true
  } else {
    await executeToggleFollow(userToFollowRef)
  }
}

async function executeToggleFollow(userToFollowRef: any) {
  if (!userToFollowRef) return
  const wasFollowing = userToFollowRef.is_following
  userToFollowRef.is_following = !wasFollowing

  try {
    const res = await $fetch<{ following: boolean }>('/api/users/follow', {
      method: 'POST',
      body: { username: userToFollowRef.username },
    })
    userToFollowRef.is_following = res.following
    toast.add({
      title: res.following ? 'กำลังติดตาม' : 'เลิกติดตามแล้ว',
      description: res.following
        ? `คุณเริ่มติดตาม @${userToFollowRef.username} แล้ว`
        : `คุณได้เลิกติดตาม @${userToFollowRef.username} เรียบร้อยแล้ว`,
      color: res.following ? 'primary' : 'gray',
    })
  } catch (err: any) {
    userToFollowRef.is_following = wasFollowing
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err?.data?.message || 'ไม่สามารถดำเนินการได้',
      color: 'red',
    })
  }
}
</script>

<style scoped>
.explore-page-root {
  min-height: 100vh;
  width: 100%;
}

.explore-layout-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 0 16px;
}

.explore-main-col {
  flex: 1 1 0;
  max-width: 680px;
  min-width: 0;
  border-left: 1px solid var(--border-primary);
  border-right: 1px solid var(--border-primary);
  min-height: 100vh;
  padding-bottom: 80px;
}

.explore-sticky-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--glass-bg);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-bottom: 1px solid var(--border-primary);
  padding: 14px 18px 0;
}

.explore-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.explore-brand-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.explore-brand-icon {
  font-size: 20px;
}

.explore-page-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.btn-theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.15s;
}

.btn-theme-toggle:hover {
  transform: scale(1.1);
}

.explore-search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 99px;
  padding: 8px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.search-icon {
  color: var(--text-muted);
  margin-right: 10px;
  flex-shrink: 0;
}

.explore-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14.5px;
  color: var(--text-primary);
  font-family: inherit;
}

.explore-search-input::placeholder {
  color: var(--text-muted);
}

.clear-search-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.explore-tabs-bar {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-secondary);
}

.explore-tab-btn {
  flex: 1;
  position: relative;
  padding: 12px 8px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.explore-tab-btn.is-active {
  color: var(--brand);
}

.tab-glow-indicator {
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  background: var(--brand);
  border-radius: 3px 3px 0 0;
  box-shadow: 0 0 10px var(--brand);
}

/* Searched Users Box */
.searched-users-card {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-hover);
}

.card-section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.searched-users-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.searched-user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  text-decoration: none;
  transition: transform 0.15s, background 0.15s;
}

.searched-user-item:hover {
  transform: translateY(-1px);
  background: var(--bg-hover);
}

.user-avatar-wrap {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--brand);
}

.user-avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
}

.user-names-wrap {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-display {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-handle {
  font-size: 11.5px;
  color: var(--text-muted);
}

/* Explore Tab Content */
.explore-tab-content {
  padding: 16px 18px;
}

.explore-glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.card-hero-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-hover);
}

.hero-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.hero-icon-box.purple {
  background: rgba(123, 108, 246, 0.12);
  color: var(--brand);
}

.card-hero-header h2 {
  margin: 0 0 2px 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.card-hero-header p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

/* Trend Card Rows */
.explore-trends-list {
  display: flex;
  flex-direction: column;
}

.explore-trend-card-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.explore-trend-card-row:last-child {
  border-bottom: none;
}

.explore-trend-card-row:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
}

.trend-rank-number {
  flex-shrink: 0;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--brand);
  background: var(--brand-light);
  padding: 4px 9px;
  border-radius: 9px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.trend-body-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.trend-category-lbl {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
  margin-bottom: 2px;
}

.trend-dot {
  font-size: 8px;
}

.trend-main-hashtag {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 3px 0 2px;
  letter-spacing: -0.2px;
  word-break: break-word;
}

.trend-posts-stat {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 1px;
}

.trend-arrow-btn {
  color: var(--text-muted);
  opacity: 0.5;
  transition: opacity 0.15s, transform 0.15s;
}

.explore-trend-card-row:hover .trend-arrow-btn {
  opacity: 1;
  transform: translateX(3px);
  color: var(--brand);
}

/* Suggested Users List */
.suggested-users-full-list {
  display: flex;
  flex-direction: column;
}

.suggested-user-card-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-secondary);
  cursor: pointer;
  transition: background 0.15s ease;
}

.suggested-user-card-item:last-child {
  border-bottom: none;
}

.suggested-user-card-item:hover {
  background: var(--bg-hover);
}

.suggested-avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--brand);
  border: 1.5px solid var(--border-primary);
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
  font-size: 16px;
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
}

.suggested-handle {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.suggested-bio-snippet {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-suggested-follow {
  padding: 6px 18px;
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

.explore-loading-state,
.explore-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.searched-posts-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Right Sidebar */
.explore-right-col {
  width: 330px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 16px;
  height: fit-content;
}

.sidebar-glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.card-header-bar {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-primary);
}

.card-title-heading {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.explore-tip-body {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.explore-tip-body p {
  margin: 0;
}

/* Quick Links List */
.quick-links-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  width: 32px;
  height: 32px;
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

.link-icon-box.green {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.link-icon-box.purple {
  background: rgba(168, 85, 247, 0.12);
  color: #8b5cf6;
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
}

.footer-copyright {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.7;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 880px) {
  .explore-right-col {
    display: none !important;
  }
  .explore-main-col {
    max-width: 100% !important;
    border-left: none !important;
    border-right: none !important;
  }
  .searched-users-grid {
    grid-template-columns: 1fr;
  }
}
</style>
