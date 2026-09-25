<template>
  <div class="community-page-root">
    <div class="community-container">

      <!-- ══════════════════════════════════════════
           LEFT / CENTER — Main Discovery Hub
      ══════════════════════════════════════════ -->
      <main class="community-main-col">
        
        <!-- Hero Section -->
        <div class="community-hero-card">
          <div class="hero-glow-blob top-left"></div>
          <div class="hero-glow-blob bottom-right"></div>
          
          <div class="hero-content">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              <span>ศูนย์รวมกลุ่มและพื้นที่แบ่งปัน</span>
            </div>
            
            <h1 class="hero-title">ค้นพบชุมชนที่ใช่สำหรับคุณ</h1>
            <p class="hero-subtitle">
              เข้าร่วมกลุ่ม แลกเปลี่ยนไอเดีย และเชื่อมต่อกับเพื่อนๆ ที่มีความสนใจเดียวกัน
            </p>
            
            <!-- Large Search Bar -->
            <div class="hero-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาชื่อชุมชน, แท็ก, หรือหัวข้อที่สนใจ..."
                class="hero-search-input"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn" title="ล้างการค้นหา">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs Bar -->
        <div class="community-nav-bar">
          <div class="nav-tabs-group">
            <button
              @click="activeTab = 'discover'"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'discover' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: -2px; margin-right: 6px;">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
              <span>ค้นพบทั้งหมด</span>
            </button>
            <button
              @click="activeTab = 'trending'"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'trending' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: -2px; margin-right: 6px;">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <span>กำลังมาแรง</span>
            </button>
            <button
              @click="activeTab = 'my_communities'"
              class="nav-tab-btn"
              :class="{ active: activeTab === 'my_communities' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: -2px; margin-right: 6px;">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>ชุมชนของฉัน ({{ myCommunitiesCount }})</span>
            </button>
          </div>

          <span class="community-counter-tag">
            {{ filteredCommunities.length }} ชุมชน
          </span>
        </div>

        <!-- Community Grid Section -->
        <div class="community-stream-area">
          
          <!-- Loading State -->
          <div v-if="loading" class="community-state-card">
            <div class="spinner"></div>
            <p>กำลังโหลดชุมชน...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredCommunities.length === 0" class="community-state-card empty-card">
            <div class="state-icon-circle glowing">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2>ไม่พบชุมชนที่คุณค้นหา</h2>
            <p>ลองค้นหาด้วยคำอื่น หรือสร้างชุมชนใหม่ขึ้นมาเพื่อรวมเพื่อนๆ ที่มีใจเดียวกันได้เลย!</p>
            <button class="action-btn-primary" @click="openCreateCommunityModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              สร้างชุมชนใหม่เลย
            </button>
          </div>

          <!-- Cards Grid (2-column on desktop) -->
          <div v-else class="community-cards-grid">
            <CommunityCard
              v-for="item in filteredCommunities"
              :key="item.slug"
              :community="item"
              @toggle-join="toggleJoin"
            />
          </div>

        </div>

      </main>

      <!-- ══════════════════════════════════════════
           RIGHT — Sidebar Widgets
      ══════════════════════════════════════════ -->
      <aside class="community-side-col">
        
        <!-- Create Community Button Widget -->
        <button class="btn-create-side-card" @click="showCreateModal = true">
          <div class="btn-gleam"></div>
          <div class="create-btn-content">
            <div class="create-icon-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div class="create-text-wrap">
              <span class="create-main-text">สร้างชุมชนใหม่</span>
              <span class="create-sub-text">เปิดพื้นที่สำหรับเพื่อนๆ ของคุณ</span>
            </div>
          </div>
        </button>

        <!-- Widget: Join via Invite Link -->
        <div class="side-card invite-widget-card">
          <div class="card-header">
            <span class="card-header-icon" style="color: #8b5cf6;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </span>
            <h3>เข้าร่วมด้วยลิงก์เชิญ</h3>
          </div>

          <div class="invite-widget-body">
            <p class="invite-widget-desc">
              มีลิงก์หรือรหัสเชิญจากเพื่อน? วางที่นี่เพื่อเข้าสู่ชุมชนได้ทันที
            </p>
            <div class="invite-widget-input-row">
              <input
                v-model="inviteInput"
                type="text"
                placeholder="วางลิงก์ หรือใส่รหัสเชิญ..."
                class="invite-widget-input"
                @keyup.enter="handleJoinInvite"
              />
              <button
                @click="handleJoinInvite"
                class="btn-widget-join"
                :disabled="!inviteInput || !inviteInput.trim()"
              >
                <span>เข้าร่วม</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <p v-if="inviteError" class="invite-widget-error">{{ inviteError }}</p>
          </div>
        </div>

        <!-- Widget 1: Trending Leaderboard -->
        <div class="side-card">
          <div class="card-header">
            <span class="card-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </span>
            <h3>ชุมชนยอดฮิต</h3>
          </div>
          
          <div class="trending-leaders-list">
            <NuxtLink
              v-for="(trend, i) in trendingCommunities"
              :key="trend.slug"
              :to="`/community/${trend.slug}`"
              class="trend-leader-item"
            >
              <!-- Rank Number -->
              <div class="rank-badge" :class="'rank-' + (i + 1)">
                #{{ i + 1 }}
              </div>

              <!-- Avatar -->
              <div
                class="leader-avatar"
                :style="!trend.avatar_url ? { background: trend.bg_color || 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}"
              >
                <img v-if="trend.avatar_url" :src="trend.avatar_url" alt="avatar" />
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>

              <!-- Details -->
              <div class="leader-info">
                <div class="leader-name">{{ trend.name }}</div>
                <div class="leader-stats">{{ (trend.member_count || 0).toLocaleString() }} สมาชิก</div>
              </div>

              <div class="leader-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Widget 2: Guidelines & Community Spirit -->
        <div class="side-card">
          <div class="card-header">
            <span class="card-header-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
              </svg>
            </span>
            <h3>แนวทางชุมชน</h3>
          </div>

          <div class="guideline-content">
            <p>
              ConnecXus Community คือพื้นที่สำหรับการแลกเปลี่ยนอย่างสร้างสรรค์ เคารพผู้อื่น และแบ่งปันเนื้อหาที่เป็นประโยชน์
            </p>
            <div class="guideline-tags">
              <span class="guideline-tag">แบ่งปันไอเดีย</span>
              <span class="guideline-tag">เคารพซึ่งกันและกัน</span>
              <span class="guideline-tag">ปลอดภัยและเป็นมิตร</span>
            </div>
          </div>
        </div>

        <div class="footer-credit">
          © 2026 ConnecXus • ชุมชนแห่งการเชื่อมต่อ
        </div>

      </aside>

    </div>

    <!-- Mobile Floating Action Button (FAB) -->
    <button class="mobile-create-fab" @click="openCreateCommunityModal">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span>สร้างชุมชน</span>
    </button>

    <!-- Create Modal -->
    <CreateCommunityModal v-if="showCreateModal" @close="showCreateModal = false" @created="fetchCommunities" />
  </div>
</template>

<script setup lang="ts">
import CommunityCard from '~/components/community/CommunityCard.vue'
import CreateCommunityModal from '~/components/community/CreateCommunityModal.vue'

useHead({ title: 'ชุมชน — ConnecXus' })

const { user } = useAuth()
const { openLoginModal } = useLoginModal()
const activeTab = ref<'discover' | 'trending' | 'my_communities'>('discover')
const searchQuery = ref('')
const showCreateModal = ref(false)

// ── Join via Invite Link in Sidebar ──
const inviteInput = ref('')
const inviteError = ref('')

function handleJoinInvite() {
  const raw = inviteInput.value.trim()
  if (!raw) return
  inviteError.value = ''

  let code = raw
  if (raw.includes('/invite/')) {
    const parts = raw.split('/invite/')
    code = parts[1].split('?')[0].split('/')[0].trim()
  } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const u = new URL(raw)
      const segments = u.pathname.split('/').filter(Boolean)
      code = segments[segments.length - 1] || raw
    } catch {
      code = raw
    }
  }

  if (!code) {
    inviteError.value = 'กรุณาใส่ลิงก์หรือรหัสเชิญที่ถูกต้อง'
    return
  }

  navigateTo(`/invite/${code}`)
}

function openCreateCommunityModal() {
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อสร้างชุมชน')
    return
  }
  showCreateModal.value = true
}

const { communities, loading, fetchCommunities, toggleJoin } = useCommunities()
const { subscribe, joinRoom, leaveRoom } = useRealtime()
let refreshTimer: any = null

onMounted(() => {
  fetchCommunities()
  joinRoom('global')

  const unsub = subscribe((event: any) => {
    if (
      event.type === 'communities_list_changed' ||
      event.type === 'community_member_joined' ||
      event.type === 'community_member_left' ||
      event.type === 'community_member_request' ||
      event.type === 'community_settings_updated' ||
      event.type === 'community_created' ||
      event.type === 'community_deleted'
    ) {
      fetchCommunities()
    }
  })

  // Polling fallback every 4s for instant cross-tab sync
  refreshTimer = setInterval(() => {
    fetchCommunities()
  }, 4000)

  onUnmounted(() => {
    unsub()
    leaveRoom('global')
    if (refreshTimer) clearInterval(refreshTimer)
  })
})

const myCommunitiesCount = computed(() => {
  return communities.value.filter(c => c.is_joined).length
})

const filteredCommunities = computed(() => {
  let list = [...communities.value]
  
  if (activeTab.value === 'my_communities') {
    list = list.filter(c => c.is_joined)
  } else if (activeTab.value === 'trending') {
    list.sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
  }
  
  if (!searchQuery.value || !searchQuery.value.trim()) return list
  
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(
    (c) => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  )
})

const trendingCommunities = computed(() => {
  return [...communities.value]
    .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
    .slice(0, 5)
})
</script>

<style scoped>
/* ── Root & Container ── */
.community-page-root {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.community-container {
  display: flex;
  width: 100%;
  max-width: 1180px;
  min-width: 0;
  gap: 24px;
  padding: 24px 20px 96px;
  align-items: flex-start;
}

/* ── Main Column ── */
.community-main-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Hero Spotlight Card ── */
.community-hero-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 32px 28px 28px;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  backdrop-filter: blur(14px);
}

.hero-glow-blob {
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(70px);
  opacity: 0.15;
}

.hero-glow-blob.top-left {
  top: -80px;
  left: -60px;
  background: var(--brand);
}

.hero-glow-blob.bottom-right {
  bottom: -80px;
  right: -60px;
  background: #ec4899;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 580px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 100px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 8px var(--brand);
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px;
  line-height: 1.25;
  letter-spacing: -0.4px;
}

.hero-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 22px;
  line-height: 1.55;
}

.hero-search-box {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.hero-search-input {
  width: 100%;
  padding: 12px 42px 12px 46px;
  border-radius: 100px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.hero-search-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.hero-search-input::placeholder {
  color: var(--text-muted);
}

.clear-search-btn {
  position: absolute;
  right: 14px;
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
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

/* ── Navigation Bar ── */
.community-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-tabs-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nav-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  transition: all 0.2s ease;
  font-family: inherit;
}

.nav-tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-tab-btn.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  font-weight: 700;
}

.community-counter-tag {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}

/* ── Stream & Cards Grid ── */
.community-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

/* ── State Cards (Loading, Empty) ── */
.community-state-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.state-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.state-icon-circle.glowing {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  box-shadow: 0 0 24px rgba(123, 108, 246, 0.25);
}

.community-state-card h2 {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.community-state-card p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  max-width: 440px;
  line-height: 1.6;
}

.community-state-card .spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--brand-light);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.action-btn-primary {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 100px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
}

.action-btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* ── Right Side Column ── */
.community-side-col {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 12px;
}

/* Create Button Side Card */
.btn-create-side-card {
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: none;
  border-radius: 20px;
  padding: 16px 20px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.35);
  transition: all 0.25s ease;
  font-family: inherit;
  text-align: left;
}

.btn-create-side-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(99, 102, 241, 0.45);
}

.btn-gleam {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: skewX(-20deg);
  animation: shine 3.5s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  25% { left: 200%; }
  100% { left: 200%; }
}

.create-btn-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 2;
}

.create-icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.create-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.create-main-text {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}

.create-sub-text {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.8);
}

/* Side Card */
.side-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: var(--card-shadow);
}

/* ── Invite Join Widget ── */
.invite-widget-card {
  background: linear-gradient(180deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%);
  border: 1px solid var(--border-primary);
}

.invite-widget-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.invite-widget-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.invite-widget-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.invite-widget-input {
  flex: 1;
  min-width: 0;
  padding: 9px 12px;
  border-radius: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 12.5px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.invite-widget-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.btn-widget-join {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 9px 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-widget-join:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-widget-join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.invite-widget-error {
  font-size: 11.5px;
  color: #ef4444;
  margin: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-header-icon {
  font-size: 18px;
}

.card-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

/* Trending Leaders */
.trending-leaders-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trend-leader-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.trend-leader-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
  transform: translateX(2px);
}

.rank-badge {
  font-size: 14px;
  font-weight: 800;
  width: 24px;
  text-align: center;
  color: var(--text-muted);
}

.leader-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.leader-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.leader-info {
  flex: 1;
  min-width: 0;
}

.leader-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leader-stats {
  font-size: 11.5px;
  color: var(--text-muted);
}

.leader-arrow {
  color: var(--text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.trend-leader-item:hover .leader-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--brand);
}

/* Guideline Card */
.guideline-content p {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px;
}

.guideline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.guideline-tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
}

.footer-credit {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  text-align: center;
  padding: 4px;
}

/* ── Mobile Floating Action Button ── */
.mobile-create-fab {
  display: none;
  align-items: center;
  gap: 8px;
  position: fixed;
  bottom: 84px;
  right: 20px;
  z-index: 80;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
  transition: transform 0.2s, box-shadow 0.2s;
}

.mobile-create-fab:active {
  transform: scale(0.95);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .community-container {
    flex-direction: column;
    gap: 20px;
  }
  .community-side-col {
    width: 100%;
    position: static;
  }
  .mobile-create-fab {
    display: flex;
  }
}

@media (max-width: 640px) {
  .community-container {
    padding: 12px 12px 96px;
  }
  .community-hero-card {
    padding: 22px 16px 20px;
    border-radius: 20px;
  }
  .hero-title {
    font-size: 21px;
  }
  .hero-subtitle {
    font-size: 13px;
    margin-bottom: 16px;
  }
  .community-cards-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
