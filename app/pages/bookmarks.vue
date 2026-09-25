<template>
  <div class="bookmarks-page-root">
    <div class="bookmarks-container">

      <!-- ══════════════════════════════════════════
           LEFT / CENTER — Bookmarks Stream
      ══════════════════════════════════════════ -->
      <main class="bookmarks-main-col">
        
        <!-- Glassmorphic Header Card -->
        <header class="bookmarks-header-card">
          <div class="header-top-row">
            <div class="header-title-group">
              <div class="header-icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <h1 class="header-title">บุ๊กมาร์ก</h1>
                <p v-if="user" class="header-subtitle">
                  @{{ user.username }} • โพสต์ที่คุณบันทึกไว้
                </p>
              </div>
            </div>

            <!-- Counter Pill -->
            <div class="bookmark-count-pill" v-if="user && !pending">
              <span class="count-num">{{ filteredPosts.length }}</span>
              <span class="count-label">รายการ</span>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="controls-row" v-if="user && posts.length > 0">
            <!-- Search Bar -->
            <div class="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="ค้นหาข้อความ หรือผู้โพสต์..."
                class="search-input"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn" title="ล้างการค้นหา">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Filter Pills -->
            <div class="filter-pills-scroller">
              <div class="filter-pills-group">
                <button 
                  @click="filterTab = 'all'" 
                  class="filter-pill"
                  :class="{ 'active': filterTab === 'all' }"
                >
                  ทั้งหมด ({{ posts.length }})
                </button>
                <button 
                  @click="filterTab = 'media'" 
                  class="filter-pill"
                  :class="{ 'active': filterTab === 'media' }"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>รูปภาพ ({{ mediaCount }})</span>
                </button>
                <button 
                  @click="filterTab = 'text'" 
                  class="filter-pill"
                  :class="{ 'active': filterTab === 'text' }"
                >
                  <span>ข้อความ ({{ textCount }})</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Not Logged In State -->
        <div v-if="!user" class="bookmarks-state-card">
          <div class="state-icon-circle">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2>กรุณาเข้าสู่ระบบ</h2>
          <p>เข้าสู่ระบบเพื่อดูและจัดการโพสต์ที่คุณบุ๊กมาร์กไว้</p>
          <NuxtLink to="/login" class="action-btn-primary">
            เข้าสู่ระบบเลย
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-else-if="pending" class="bookmarks-state-card">
          <div class="spinner"></div>
          <p>กำลังโหลดบุ๊กมาร์กของคุณ...</p>
        </div>

        <!-- Empty State (No Bookmarks at all) -->
        <div v-else-if="posts.length === 0" class="bookmarks-state-card empty-card">
          <div class="empty-state-glow-ring">
            <div class="state-icon-circle glowing">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          </div>
          <h2>ยังไม่มีโพสต์ที่บันทึกไว้</h2>
          <p>
            คุณสามารถบันทึกโพสต์ที่น่าสนใจได้ง่ายๆ เพียงกดไอคอน 
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--brand, #7b6cf6)" style="display:inline; vertical-align:-2px; margin:0 2px;">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg> 
            ที่ใต้โพสต์ใดก็ได้ในฟีด
          </p>
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

        <!-- Empty Search / Filter Results -->
        <div v-else-if="filteredPosts.length === 0" class="bookmarks-state-card">
          <div class="state-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h2>ไม่พบผลลัพธ์</h2>
          <p>ไม่มีโพสต์ที่ตรงกับคำค้นหา "{{ searchQuery }}"</p>
          <button @click="searchQuery = ''; filterTab = 'all'" class="action-btn-outline">
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <!-- Posts List -->
        <div v-else class="bookmarks-posts-stream">
          <PostCard
            v-for="post in filteredPosts"
            :key="post.id"
            :post="post"
            @deleted="handleDeleted"
          />
        </div>

      </main>

      <!-- ══════════════════════════════════════════
           RIGHT — Side Widgets
      ══════════════════════════════════════════ -->
      <aside class="bookmarks-side-col">
        
        <!-- Widget 1: Overview & Stats -->
        <div class="side-card">
          <div class="card-header">
            <div class="card-header-icon-box purple">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>ข้อมูลบุ๊กมาร์ก</h3>
          </div>
          
          <div class="stats-overview-grid">
            <div class="stat-box">
              <span class="stat-val color-purple">{{ posts.length }}</span>
              <span class="stat-txt">โพสต์ทั้งหมด</span>
            </div>
            <div class="stat-box">
              <span class="stat-val color-emerald">{{ mediaCount }}</span>
              <span class="stat-txt">รูปภาพ / มีเดีย</span>
            </div>
          </div>

          <!-- Privacy Notice -->
          <div class="privacy-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="flex-shrink:0;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>
              <strong>ความเป็นส่วนตัว 100%:</strong> บุ๊กมาร์กของคุณเป็นพื้นที่ส่วนตัว มีเพียงคุณเท่านั้นที่มองเห็นรายการเหล่านี้
            </span>
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
                <span class="link-desc">ดูโพสต์ล่าสุดจากเพื่อนๆ</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/community" class="quick-link-item">
              <div class="link-icon-box green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">ชุมชน (Communities)</span>
                <span class="link-desc">ค้นหากลุ่มตามความสนใจ</span>
              </div>
            </NuxtLink>

            <NuxtLink :to="user ? `/profile/${user.username}` : '/login'" class="quick-link-item">
              <div class="link-icon-box purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="link-text-wrap">
                <span class="link-title">โปรไฟล์ของฉัน</span>
                <span class="link-desc">แก้ไขข้อมูลและโพสต์ส่วนตัว</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Widget 3: Quick Tip Card -->
        <div class="side-card tip-card">
          <div class="tip-header">
            <span class="tip-sparkle">💡</span>
            <h4>เคล็ดลับการใช้งาน</h4>
          </div>
          <p class="tip-text">
            คลิกที่ไอคอนบุ๊กมาร์กใต้โพสต์เพื่อยกเลิกการบันทึกได้ตลอดเวลา
          </p>
        </div>

      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import PostCard from '~/components/post/PostCard.vue'

definePageMeta({ middleware: 'auth' })

useHead({
  title: 'บุ๊กมาร์ก — ConnecXus',
  meta: [{ name: 'description', content: 'โพสต์ที่คุณบันทึกไว้' }],
})

const { user } = useAuth()
const { subscribe, joinRoom, leaveRoom } = useRealtime()

const posts = ref<any[]>([])
const pending = ref(false)
const searchQuery = ref('')
const filterTab = ref<'all' | 'media' | 'text'>('all')

const mediaCount = computed(() => posts.value.filter((p) => !!p.image_url).length)
const textCount = computed(() => posts.value.filter((p) => !p.image_url).length)

const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    // 1. Filter by Tab
    if (filterTab.value === 'media' && !post.image_url) return false
    if (filterTab.value === 'text' && post.image_url) return false

    // 2. Filter by Search Query
    if (searchQuery.value && searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const contentMatch = post.content?.toLowerCase().includes(q)
      const nameMatch = post.author_display_name?.toLowerCase().includes(q)
      const usernameMatch = post.author_username?.toLowerCase().includes(q)
      return contentMatch || nameMatch || usernameMatch
    }

    return true
  })
})

async function fetchBookmarks() {
  if (!user.value) return
  pending.value = true
  try {
    const res = await $fetch<{ posts: any[] }>('/api/bookmarks')
    posts.value = res.posts || []
  } catch {
    posts.value = []
  } finally {
    pending.value = false
  }
}

function handleDeleted(postId: number | string) {
  posts.value = posts.value.filter((p) => p.id !== postId)
}

let unsubscribeRealtime: (() => void) | null = null

onMounted(() => {
  fetchBookmarks()
  joinRoom('global')

  unsubscribeRealtime = subscribe((event) => {
    if (event.type === 'bookmark_update' || event.type === 'post_deleted') {
      fetchBookmarks()
    }
  })
})

onUnmounted(() => {
  if (unsubscribeRealtime) unsubscribeRealtime()
  leaveRoom('global')
})
</script>

<style scoped>
/* ── Root & Fluid Container ── */
.bookmarks-page-root {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.bookmarks-container {
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
.bookmarks-main-col {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Header Card ── */
.bookmarks-header-card {
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

.bookmark-count-pill {
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 100px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.bookmark-count-pill .count-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--brand);
}

.bookmark-count-pill .count-label {
  font-size: 12px;
  color: var(--brand);
  font-weight: 600;
}

/* ── Controls Row (Search + Filter) ── */
.controls-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 38px 9px 38px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search-btn:hover {
  color: var(--text-primary);
}

.filter-pills-scroller {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-pills-scroller::-webkit-scrollbar {
  display: none;
}

.filter-pills-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-pill:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filter-pill.active {
  background: var(--brand-light);
  border-color: rgba(99, 102, 241, 0.3);
  color: var(--brand);
  font-weight: 700;
}

/* ── States (Loading / Empty) ── */
.bookmarks-state-card {
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

.bookmarks-state-card h2 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 12px 0 6px;
}

.bookmarks-state-card p {
  font-size: 13.5px;
  color: var(--text-muted);
  max-width: 400px;
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

/* ── Posts Stream ── */
.bookmarks-posts-stream {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Right Side Column ── */
.bookmarks-side-col {
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

.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.stat-box {
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

.stat-box:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.3);
}

.stat-val {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-val.color-purple { color: #8b5cf6; }
.stat-val.color-emerald { color: #10b981; }

.stat-txt {
  font-size: 11px;
  color: var(--text-muted);
}

.privacy-banner {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11.5px;
  color: var(--text-muted);
  line-height: 1.4;
}

.privacy-banner strong {
  color: #10b981;
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

/* Tip Card */
.tip-card {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tip-sparkle {
  font-size: 14px;
}

.tip-header h4 {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.tip-text {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

/* ── Responsive Behavior on Resize (ขยายไปมา) ── */
@media (max-width: 920px) {
  .bookmarks-container {
    flex-direction: column;
    padding: 14px 12px 80px;
    gap: 16px;
  }
  
  .bookmarks-side-col {
    width: 100%;
    position: static;
  }
}

@media (max-width: 640px) {
  .bookmarks-header-card {
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
}
</style>
