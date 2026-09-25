<template>
  <div v-if="error?.statusCode === 403" class="error-container">
    <div class="error-card">
      <div class="error-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <h2 class="error-title">ชุมชนนี้ถูกระงับการเข้าถึง</h2>
      <p class="error-desc">
        เหตุผล: <strong style="color: #f43f5e;">{{ error?.data?.data?.suspend_reason || 'ละเมิดข้อตกลงการใช้งาน' }}</strong><br/>
        ระงับจนถึง: <strong>{{ error?.data?.data?.suspended_until ? new Date(error?.data?.data?.suspended_until).toLocaleString('th-TH') : 'ถาวร' }}</strong>
      </p>
      <NuxtLink to="/community" class="btn-action-primary">กลับสู่หน้ารวมชุมชน</NuxtLink>
    </div>
  </div>

  <div v-else class="community-detail-root">
    <!-- Floating Sticky Mini Bar (Visible when scrolling down) -->
    <Transition name="fade-down">
      <div v-if="isScrolledDown && community" class="sticky-community-minibar">
        <div class="minibar-left" @click="scrollToTop" title="กดเพื่อเลื่อนขึ้นบนสุด">
          <NuxtLink to="/community" class="minibar-back-btn" @click.stop title="ย้อนกลับไปหน้ารวมชุมชน">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </NuxtLink>
          <div class="minibar-avatar">
            <img v-if="community.avatar_url" :src="community.avatar_url" alt="avatar" />
            <span v-else>{{ community.icon || '🚀' }}</span>
          </div>
          <div class="minibar-text">
            <span class="minibar-name">{{ community.name }}</span>
            <span class="minibar-members">{{ (community.member_count || 0).toLocaleString() }} สมาชิก</span>
          </div>
        </div>
        <div class="minibar-actions">
          <button v-if="!isJoined" @click="handleJoinBtnClick" class="minibar-join-btn">
            <span>{{ isPending ? 'รออนุมัติ' : 'เข้าร่วม' }}</span>
          </button>
          <div v-else class="minibar-joined-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>สมาชิก</span>
          </div>
        </div>
      </div>
    </Transition>

    <div class="community-detail-container">
      
      <!-- ══════════════════════════════════════════
           TOP — Hero Profile Card of Community
      ══════════════════════════════════════════ -->
      <div class="community-hero-card">
        
        <!-- Cover Banner -->
        <div 
          class="cover-banner-wrap"
          :style="community?.banner_url ? `background-image: url(${community.banner_url}); background-position: center ${community.banner_position_y ?? 50}%; background-size: cover;` : `background: linear-gradient(135deg, ${community?.bg_color || '#6366f1'} 0%, #0a0b12 100%)`"
        >
          <div class="banner-gradient-shade"></div>

          <!-- Back / Exit Button -->
          <NuxtLink to="/community" class="btn-back-pill" title="ย้อนกลับไปหน้ารวมชุมชน">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>ย้อนกลับ</span>
          </NuxtLink>
        </div>

        <div class="hero-body">
          <!-- Avatar & Actions Bar -->
          <div class="avatar-action-bar">
            
            <!-- Community Avatar -->
            <div 
              class="community-avatar-box"
              :style="!community?.avatar_url ? { background: community?.bg_color || 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}"
            >
              <img v-if="community?.avatar_url" :src="community.avatar_url" alt="avatar" />
              <span v-else class="avatar-emoji">{{ community?.icon || '🚀' }}</span>
            </div>

            <!-- Action Buttons Group -->
            <div class="hero-actions-group">
              <!-- Settings Button (Owner & Moderator) -->
              <NuxtLink
                v-if="community?.user_role === 'owner' || community?.user_role === 'moderator' || user?.role === 'admin'"
                :to="`/community/${community?.slug}/settings`"
                class="btn-pill-glass"
                title="แผงควบคุม & ตั้งค่าชุมชน"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>ตั้งค่า</span>
              </NuxtLink>

              <!-- Report Button -->
              <button
                v-if="user && community && user.id !== community.owner_id"
                @click="openReportModal('community', community.id)"
                class="btn-icon-danger"
                title="รายงานชุมชนนี้"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </button>

              <!-- Join / Pending Button -->
              <button
                v-if="!isJoined"
                @click="handleJoinBtnClick"
                class="btn-action-primary"
                :class="{ 'btn-pending': isPending }"
              >
                <template v-if="isPending">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>รออนุมัติ</span>
                </template>
                <template v-else>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span>เข้าร่วมชุมชน</span>
                </template>
              </button>

              <!-- Joined Pill Badge -->
              <div
                v-if="isJoined"
                class="status-joined-pill"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>เป็นสมาชิกแล้ว</span>
              </div>

              <!-- Leave Button -->
              <button
                v-if="isJoined && user?.id !== community?.owner_id"
                @click="confirmLeave"
                class="btn-pill-danger"
                title="ออกจากชุมชนนี้"
              >
                ออกกลุ่ม
              </button>
            </div>
          </div>

          <!-- Community Title & Meta Description -->
          <div class="community-meta-info">
            <h1 class="community-main-title">{{ community?.name }}</h1>
            <p v-if="community?.description" class="community-main-desc">
              {{ community.description }}
            </p>
            
            <!-- Chips Bar -->
            <div class="community-chips-row">
              <button
                type="button"
                @click="openMembersModal"
                class="meta-chip clickable-chip"
                title="คลิกเพื่อดูรายชื่อสมาชิกทั้งหมด"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <strong>{{ (community?.member_count || 0).toLocaleString() }}</strong>
                <span>สมาชิก</span>
                <span class="chip-click-hint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </button>

              <div class="meta-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
                </svg>
                <span>{{ community?.is_private ? 'ชุมชนปิด (Private)' : 'ชุมชนสาธารณะ (Public)' }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════════
           BOTTOM — 2-Column Content Layout
      ══════════════════════════════════════════ -->
      <div class="community-content-layout">

        <!-- Left Column: Feed / Gallery -->
        <div class="community-feed-col">

          <!-- Sub Navigation Tabs (Underline Glass Style) -->
          <div class="community-tabs-bar">
            <button 
              @click="switchSubTab('feed')" 
              class="sub-tab-btn"
              :class="{ active: activeSubTab === 'feed' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span>ฟีดโพสต์</span>
            </button>

            <button 
              @click="switchSubTab('gallery')" 
              class="sub-tab-btn"
              :class="{ active: activeSubTab === 'gallery' }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>รวมภาพ ({{ galleryPosts.length }})</span>
            </button>
          </div>

          <!-- Private Locked State -->
          <div v-if="requiresJoin" class="feed-locked-card">
            <div class="locked-icon-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>ชุมชนนี้เป็นชุมชนส่วนตัว</h2>
            <p>
              เฉพาะสมาชิกที่ได้รับอนุมัติเท่านั้นจึงจะสามารถดูและสร้างโพสต์ได้<br/>
              <span class="locked-subnote">สำหรับผู้ที่ติดตามซึ่งกันและกันกับเจ้าของชุมชน คุณจะได้รับอนุมัติทันทีที่กดเข้าร่วม!</span>
            </p>
            <button v-if="!isJoined && !isPending" class="btn-action-primary" @click="toggleJoin">
              ขอยื่นเข้าร่วมชุมชน
            </button>
          </div>

          <template v-else>
            <!-- 1. FEED TAB -->
            <div v-if="activeSubTab === 'feed'" class="feed-tab-content">
              
              <!-- Post Composer -->
              <div class="composer-container-card">
                <PostComposer
                  :community-id="community?.id"
                  :community-name="community?.name"
                  :is-community-only-default="Boolean(community?.is_community_only_feed)"
                  @posted="handleNewPost"
                />
              </div>

              <!-- Search Bar -->
              <div class="feed-search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="ค้นหาโพสต์ หรือผู้เขียนในกลุ่มนี้..." 
                  class="feed-search-input"
                />
                <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn" title="ล้างการค้นหา">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- Posts stream -->
              <div v-if="filteredPosts.length > 0" class="posts-stream-box">
                <PostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
              </div>

              <!-- Search Empty State -->
              <div v-else-if="searchQuery.trim()" class="feed-empty-card">
                <div class="state-icon-circle">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3>ไม่พบโพสต์ที่ตรงกับคำค้นหา</h3>
                <p>ลองใช้คำค้นหาอื่นดูอีกครั้ง</p>
                <button @click="searchQuery = ''" class="btn-pill-glass" style="margin-top: 10px;">
                  ล้างการค้นหา
                </button>
              </div>

              <!-- No Posts State -->
              <div v-else class="feed-empty-card">
                <div class="state-icon-circle glowing">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
                <h3>ยังไม่มีโพสต์ในกลุ่มนี้</h3>
                <p>เริ่มต้นแบ่งปันเรื่องราวหรือเปิดประเด็นพูดคุยคนแรกในชุมชนได้เลย!</p>
              </div>
            </div>

            <!-- 2. GALLERY TAB -->
            <div v-if="activeSubTab === 'gallery'" class="gallery-tab-content">
              <div v-if="galleryPosts.length > 0" class="gallery-cards-grid">
                <div 
                  v-for="post in galleryPosts" 
                  :key="post.id" 
                  class="gallery-item-wrap"
                  @click="selectedGalleryPost = post"
                >
                  <img :src="post.image_url" alt="gallery image" class="gallery-img" />
                  <div class="gallery-hover-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div v-else class="feed-empty-card">
                <div class="state-icon-circle">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <h3>ยังไม่มีรูปภาพในชุมชนนี้</h3>
                <p>โพสต์ใดก็ตามที่มีรูปภาพจะถูกรวบรวมไว้ที่นี่โดยอัตโนมัติ</p>
              </div>
            </div>
          </template>
        </div>

        <!-- Right Column: Sidebar Widgets -->
        <aside class="community-sidebar-col">
          
          <!-- Widget 1: Rules -->
          <div class="side-widget-card">
            <div class="widget-header">
              <span class="widget-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                </svg>
              </span>
              <h3>กฎกติกาของกลุ่ม</h3>
            </div>
            
            <div v-if="community?.rules && community.rules.length > 0" class="rules-box">
              <div 
                v-for="(rule, idx) in community.rules" 
                :key="idx"
                class="rule-row"
              >
                <div class="rule-index">{{ idx + 1 }}</div>
                <div class="rule-text">{{ rule }}</div>
              </div>
            </div>

            <div v-else class="rules-empty-box">
              <p>ไม่มีกฎกติกาเพิ่มเติม</p>
            </div>
          </div>
          
          <!-- Widget 2: Moderation / Admin Team -->
          <div class="side-widget-card">
            <div class="widget-header">
              <span class="widget-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                </svg>
              </span>
              <h3>ผู้ดูแลชุมชน ({{ community?.moderators?.length || 1 }})</h3>
            </div>
            
            <div class="moderators-list-stack" style="display: flex; flex-direction: column; gap: 8px;">
              <template v-if="community?.moderators && community.moderators.length > 0">
                <div 
                  v-for="mod in community.moderators"
                  :key="mod.user_id"
                  class="moderator-card-row"
                  @click="mod.username && navigateTo(`/profile/${mod.username}`)"
                >
                  <div class="mod-avatar-box">
                    <img v-if="mod.avatar_url" :src="mod.avatar_url" :alt="mod.display_name" />
                    <div v-else class="mod-avatar-fallback">
                      {{ mod.display_name ? mod.display_name.slice(0,1).toUpperCase() : (mod.username ? mod.username.slice(0,1).toUpperCase() : 'A') }}
                    </div>
                  </div>

                  <div class="mod-info-box">
                    <div class="mod-name">{{ mod.display_name || mod.username }}</div>
                    <div class="mod-role-badge" :style="mod.role === 'moderator' ? 'color: #0ea5e9; border-color: rgba(14, 165, 233, 0.3); background: rgba(14, 165, 233, 0.1);' : ''">
                      <svg v-if="mod.role === 'owner'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" style="display: inline-block; vertical-align: middle; margin-right: 3px;">
                        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                      </svg>
                      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" style="display: inline-block; vertical-align: middle; margin-right: 3px;">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
                      </svg>
                      <span>{{ mod.role === 'owner' ? 'ผู้สร้างกลุ่ม (Owner)' : 'ผู้ดูแล (Mod)' }}</span>
                    </div>
                  </div>

                  <div class="mod-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </template>
              <template v-else>
                <div 
                  class="moderator-card-row"
                  @click="community?.owner_username && navigateTo(`/profile/${community.owner_username}`)"
                >
                  <div class="mod-avatar-box">
                    <img v-if="community?.owner_avatar_url" :src="community.owner_avatar_url" alt="admin avatar" />
                    <div v-else class="mod-avatar-fallback">
                      {{ community?.owner_name ? community.owner_name.slice(0,1).toUpperCase() : 'A' }}
                    </div>
                  </div>

                  <div class="mod-info-box">
                    <div class="mod-name">{{ community?.owner_name || 'แอดมินระบบ' }}</div>
                    <div class="mod-role-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" style="display: inline-block; vertical-align: middle; margin-right: 3px;">
                        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                      </svg>
                      <span>ผู้สร้างกลุ่ม (Owner)</span>
                    </div>
                  </div>

                  <div class="mod-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Widget 3: Quick Info Card -->
          <div class="side-widget-card">
            <div class="widget-header">
              <span class="widget-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </span>
              <h3>ข้อมูลความปลอดภัย</h3>
            </div>
            <p class="privacy-note-text">
              โพสต์และเนื้อหาในกลุ่มนี้ได้รับการดูแลภายใต้กฎข้อบังคับของ ConnecXus โปรดปฏิบัติตามกฎของกลุ่มและรักษาบรรยากาศที่ดีร่วมกัน
            </p>
          </div>

        </aside>

      </div>
    </div>

    <!-- Custom Leave Confirmation Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="isMounted && showLeaveModal" class="nexus-modal-overlay" @click.self="showLeaveModal = false">
            <div class="nexus-modal">
              <div class="modal-icon warning">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h2>ยืนยันการออกจากกลุ่ม</h2>
              <p>คุณแน่ใจหรือไม่ว่าต้องการออกจากชุมชน "{{ community?.name }}"?</p>
              
              <div class="modal-buttons-row">
                <button class="btn-pill-glass" @click="showLeaveModal = false">ยกเลิก</button>
                <button class="btn-pill-danger-confirm" @click="executeLeave">ยืนยันการออก</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Cancel Join Request Confirmation Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="isMounted && showCancelRequestModal" class="nexus-modal-overlay" @click.self="showCancelRequestModal = false">
            <div class="nexus-modal">
              <div class="modal-icon warning" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2>ยกเลิกคำขอเข้าร่วมชุมชน?</h2>
              <p>คุณต้องการยกเลิกคำขอเข้าร่วมกลุ่ม "{{ community?.name }}" ใช่หรือไม่?</p>
              
              <div class="modal-buttons-row">
                <button class="btn-pill-glass" @click="showCancelRequestModal = false">คงคำขอไว้</button>
                <button class="btn-pill-amber-confirm" @click="executeCancelRequest">ยืนยันยกเลิกคำขอ</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Gallery Image Viewer Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="isMounted && selectedGalleryPost" class="nexus-modal-overlay gallery-viewer-overlay" @click.self="selectedGalleryPost = null">
            <button 
              @click="selectedGalleryPost = null"
              class="gallery-close-btn"
              title="ปิดรูปภาพ"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div class="gallery-modal-body">
              <img :src="selectedGalleryPost.image_url" class="gallery-zoom-img" />
              <div class="gallery-modal-footer">
                <button 
                  @click="router.push(`/post/${selectedGalleryPost.id}`); selectedGalleryPost = null"
                  class="btn-action-primary"
                >
                  <span>ดูโพสต์ต้นฉบับ</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Community Members List Modal -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal-fade">
          <div v-if="isMounted && showMembersModal" class="nexus-modal-overlay members-modal-overlay" @click.self="showMembersModal = false">
            <div class="nexus-modal members-modal-card">
              
              <!-- Modal Header -->
              <div class="members-modal-header">
                <div class="header-left-group">
                  <div class="modal-icon-circle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <div class="modal-title-row">
                      <h2>สมาชิกในชุมชน</h2>
                      <span class="count-badge-pill">{{ filteredMembersList.length }} คน</span>
                    </div>
                    <p class="modal-subtitle">{{ community?.name }}</p>
                  </div>
                </div>

                <button 
                  @click="showMembersModal = false" 
                  class="btn-close-modal"
                  title="ปิดหน้าต่าง"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <!-- Search & Filter Controls -->
              <div class="members-filter-bar">
                <div class="search-input-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input 
                    v-model="memberSearchQuery" 
                    type="text" 
                    placeholder="ค้นหาชื่อ หรือ @username..."
                    class="glass-search-input"
                  />
                  <button 
                    v-if="memberSearchQuery" 
                    @click="memberSearchQuery = ''" 
                    class="btn-clear-search"
                    title="ล้างคำค้นหา"
                  >
                    ✕
                  </button>
                </div>

                <div class="role-filter-segmented">
                  <button 
                    type="button"
                    @click="memberRoleTab = 'all'" 
                    class="filter-tab-btn" 
                    :class="{ active: memberRoleTab === 'all' }"
                  >
                    ทั้งหมด ({{ allMembersList.length }})
                  </button>
                  <button 
                    type="button"
                    @click="memberRoleTab = 'staff'" 
                    class="filter-tab-btn" 
                    :class="{ active: memberRoleTab === 'staff' }"
                  >
                    ผู้ดูแล ({{ staffCount }})
                  </button>
                  <button 
                    type="button"
                    @click="memberRoleTab = 'member'" 
                    class="filter-tab-btn" 
                    :class="{ active: memberRoleTab === 'member' }"
                  >
                    สมาชิก ({{ regularMemberCount }})
                  </button>
                </div>
              </div>

              <!-- Members List Scroll Container -->
              <div class="members-scroll-body custom-scrollbar">
                <!-- Loading State -->
                <div v-if="loadingMembers" class="members-loading-box">
                  <div class="spinner-neon"></div>
                  <span>กำลังโหลดรายชื่อสมาชิก...</span>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredMembersList.length === 0" class="members-empty-box">
                  <div class="empty-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <h3>ไม่พบรายชื่อสมาชิก</h3>
                  <p v-if="memberSearchQuery">ไม่พบสมาชิกที่ตรงกับคำค้นหา "{{ memberSearchQuery }}"</p>
                  <p v-else>ยังไม่มีสมาชิกในหมวดหมู่นี้</p>
                </div>

                <!-- Members Cards List -->
                <div v-else class="members-grid-stack">
                  <NuxtLink 
                    v-for="m in filteredMembersList" 
                    :key="m.user_id" 
                    :to="`/profile/${m.username}`"
                    class="member-list-item-card"
                    @click="showMembersModal = false"
                  >
                    <!-- Member Avatar -->
                    <div class="member-avatar-box">
                      <img v-if="m.avatar_url" :src="m.avatar_url" :alt="m.display_name" class="member-img" />
                      <div v-else class="member-avatar-fallback">
                        {{ m.display_name ? m.display_name.slice(0, 1).toUpperCase() : (m.username ? m.username.slice(0, 1).toUpperCase() : 'U') }}
                      </div>
                    </div>

                    <!-- Member Details -->
                    <div class="member-details-col">
                      <div class="member-name-row">
                        <span class="member-display-name">{{ m.display_name || m.username }}</span>
                        
                        <!-- Role Tag -->
                        <span v-if="m.role === 'owner'" class="role-badge owner">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
                            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                          </svg>
                          <span>ผู้สร้างกลุ่ม (Owner)</span>
                        </span>
                        <span v-else-if="m.role === 'moderator'" class="role-badge mod">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
                          </svg>
                          <span>ผู้ดูแล (Mod)</span>
                        </span>
                        <span v-else class="role-badge regular">
                          <span>สมาชิก</span>
                        </span>
                      </div>

                      <div class="member-sub-info">
                        <span class="member-username-tag">@{{ m.username }}</span>
                        <span v-if="m.joined_at" class="member-joined-text">
                          · เข้าร่วมเมื่อ {{ formatMemberJoinedDate(m.joined_at) }}
                        </span>
                      </div>
                    </div>

                    <!-- Right Action Arrow -->
                    <div class="member-action-right">
                      <div class="btn-view-profile">
                        <span>ดูโปรไฟล์</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </div>
                    </div>
                  </NuxtLink>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="members-modal-footer">
                <span class="footer-hint">คลิกที่สมาชิกเพื่อเปิดดูหน้าโปรไฟล์</span>
                <button @click="showMembersModal = false" class="btn-close-footer">
                  ปิด
                </button>
              </div>

            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import PostComposer from '~/components/post/PostComposer.vue'
import PostCard from '~/components/post/PostCard.vue'

const router = useRouter()
const route = useRoute()
const slug = route.params.slug as string
const { user } = useAuth()
const toast = useToast()
const { openReportModal } = useReportModal()
const { openLoginModal } = useLoginModal()
const activeSubTab = ref<'feed' | 'gallery'>('feed')
const isScrolledDown = ref(false)

// ── Members Modal State & Methods ──
const showMembersModal = ref(false)
const allMembersList = ref<any[]>([])
const loadingMembers = ref(false)
const memberSearchQuery = ref('')
const memberRoleTab = ref<'all' | 'staff' | 'member'>('all')

const staffCount = computed(() => {
  return allMembersList.value.filter(m => m.role === 'owner' || m.role === 'moderator').length
})

const regularMemberCount = computed(() => {
  return allMembersList.value.filter(m => m.role === 'member').length
})

const filteredMembersList = computed(() => {
  let list = allMembersList.value
  if (memberRoleTab.value === 'staff') {
    list = list.filter(m => m.role === 'owner' || m.role === 'moderator')
  } else if (memberRoleTab.value === 'member') {
    list = list.filter(m => m.role === 'member')
  }
  if (memberSearchQuery.value.trim()) {
    const q = memberSearchQuery.value.trim().toLowerCase()
    list = list.filter(m => 
      (m.display_name && m.display_name.toLowerCase().includes(q)) ||
      (m.username && m.username.toLowerCase().includes(q))
    )
  }
  return list
})

async function openMembersModal() {
  showMembersModal.value = true
  memberSearchQuery.value = ''
  memberRoleTab.value = 'all'
  loadingMembers.value = true
  try {
    const res: any = await $fetch(`/api/communities/${slug}/members`)
    allMembersList.value = res.members || []
  } catch (err: any) {
    toast.add({
      title: 'ไม่สามารถดูรายชื่อสมาชิกได้',
      description: err?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลสมาชิก',
      color: 'red'
    })
  } finally {
    loadingMembers.value = false
  }
}

function formatMemberJoinedDate(dateStr?: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

function scrollToTop() {
  if (typeof window !== 'undefined') {
    const mainViewport = document.querySelector('.app-main-viewport')
    if (mainViewport) {
      mainViewport.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

function resetViewportScroll() {
  if (typeof document !== 'undefined') {
    const el = document.querySelector('.app-main-viewport')
    if (el) el.scrollTop = 0
  }
}

function switchSubTab(tab: 'feed' | 'gallery') {
  if (activeSubTab.value !== tab) {
    activeSubTab.value = tab
    nextTick(() => resetViewportScroll())
    setTimeout(() => resetViewportScroll(), 50)
  }
}

function checkScroll() {
  if (typeof window === 'undefined') return
  const mainViewport = document.querySelector('.app-main-viewport')
  const scrollY = mainViewport ? mainViewport.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0)
  isScrolledDown.value = scrollY > 260
}

const { data, error } = await useFetch(`/api/communities/${slug}`)
const community = computed(() => data.value?.community)
const requiresJoin = computed(() => data.value?.requires_join)

const isMounted = ref(false)
const { subscribe, publish, joinRoom, leaveRoom } = useRealtime()
let unsub: any = null

onMounted(() => {
  isMounted.value = true

  // Ensure we start at top when landing on this community page
  if (typeof window !== 'undefined') {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    resetViewportScroll()
    nextTick(() => resetViewportScroll())
    setTimeout(() => resetViewportScroll(), 50)
    setTimeout(() => resetViewportScroll(), 150)
    setTimeout(() => resetViewportScroll(), 350)

    const mainViewport = document.querySelector('.app-main-viewport')
    if (mainViewport) {
      mainViewport.addEventListener('scroll', checkScroll, { passive: true })
    }
    window.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()
  }

  joinRoom(`community-${slug}`)
  unsub = subscribe((event: any) => {
    // Live new post in community
    if (event.type === 'new_post') {
      const isTargetCommunity = 
        Number(event.payload?.community_id) === Number(community.value?.id) ||
        event.payload?.community_slug === slug ||
        Number(event.payload?.post?.community_id) === Number(community.value?.id) ||
        event.payload?.post?.community_slug === slug

      if (isTargetCommunity && event.payload?.post) {
        const newPost = event.payload.post
        const exists = posts.value.some(p => Number(p.id) === Number(newPost.id))
        if (!exists) {
          posts.value = [newPost, ...posts.value]
        }
      }
    }
    // Live member count update
    if (event.type === 'community_member_joined' && event.payload?.community_slug === slug) {
      if (community.value) community.value.member_count = event.payload.member_count
    }
    if (event.type === 'community_member_left' && event.payload?.community_slug === slug) {
      if (community.value) community.value.member_count = event.payload.member_count
    }
    // Live post delete
    if (event.type === 'post_deleted' && event.payload?.post_id) {
      posts.value = posts.value.filter(p => Number(p.id) !== Number(event.payload.post_id))
    }
    // Live post like count
    if (event.type === 'like_post' && event.payload?.post_id) {
      const post = posts.value.find(p => Number(p.id) === Number(event.payload.post_id))
      if (post && event.payload.like_count !== undefined) {
        post.like_count = event.payload.like_count
      }
    }
  })
})

onUnmounted(() => {
  if (unsub) unsub()
  leaveRoom(`community-${slug}`)
  if (typeof window !== 'undefined') {
    const mainViewport = document.querySelector('.app-main-viewport')
    if (mainViewport) {
      mainViewport.removeEventListener('scroll', checkScroll)
    }
    window.removeEventListener('scroll', checkScroll)
  }
})

useHead({
  title: computed(() => community.value ? `${community.value.name} — ConnecXus` : 'ชุมชน')
})

const isJoined = ref(false)
const isPending = ref(false)
const posts = ref<any[]>([])
const showLeaveModal = ref(false)

const searchQuery = ref('')
const filteredPosts = computed(() => {
  if (!searchQuery.value.trim()) return posts.value
  const q = searchQuery.value.toLowerCase()
  return posts.value.filter(p => 
    (p.content && p.content.toLowerCase().includes(q)) || 
    (p.author_display_name && p.author_display_name.toLowerCase().includes(q))
  )
})

const galleryPosts = computed(() => posts.value.filter(p => p.image_url))
const selectedGalleryPost = ref<any>(null)

watch(
  () => community.value,
  (val) => {
    if (val) {
      isJoined.value = val.is_joined
      isPending.value = val.user_status === 'pending'
      posts.value = val.posts || []
    }
  },
  { immediate: true }
)

const showCancelRequestModal = ref(false)

async function handleJoinBtnClick() {
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อเข้าร่วมชุมชนนี้')
    return
  }

  // If already pending, show cancel confirmation modal
  if (isPending.value) {
    showCancelRequestModal.value = true
    return
  }

  await toggleJoin()
}

async function executeCancelRequest() {
  showCancelRequestModal.value = false
  try {
    await $fetch(`/api/communities/${slug}/leave`, { method: 'POST' })
    isJoined.value = false
    isPending.value = false
  } catch (err) {
    console.error(err)
  }
}

async function toggleJoin() {
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อเข้าร่วมชุมชนนี้')
    return
  }
  try {
    const res = await $fetch<any>(`/api/communities/${slug}/join`, { method: 'POST' })
    if (res.is_joined) {
      isJoined.value = true
      isPending.value = false
    } else if (res.is_pending) {
      isJoined.value = false
      isPending.value = true
    } else {
      isJoined.value = false
      isPending.value = false
    }
  } catch (err) {
    console.error(err)
  }
}

async function confirmLeave() {
  showLeaveModal.value = true
}

async function executeLeave() {
  showLeaveModal.value = false
  await toggleJoin()
}

async function handleNewPost(payload: { content: string; image_url?: string | null; is_community_only?: boolean; visibility?: string }) {
  try {
    const res = await $fetch<any>('/api/posts', {
      method: 'POST',
      body: { 
        content: payload.content, 
        image_url: payload.image_url,
        community_id: community.value?.id,
        is_community_only: payload.is_community_only,
        visibility: payload.visibility || 'public'
      },
    })

    const postId = Number(res?.id) || Date.now()
    const newPostData = {
      id: postId,
      author_id: user.value?.id,
      author_display_name: user.value?.display_name || 'คุณ',
      author_username: user.value?.username || 'user',
      author_avatar_url: user.value?.avatar_url || null,
      authorInitials: user.value?.display_name ? user.value.display_name.trim().slice(0, 2) : 'ME',
      avatarBg: '#5b46e0',
      time_ago: 'เมื่อสักครู่',
      community_name: community.value?.name,
      community_slug: community.value?.slug,
      community_id: community.value?.id,
      content: payload.content,
      image_url: payload.image_url,
      visibility: payload.visibility || 'public',
      is_community_only: Boolean(payload.is_community_only),
      like_count: 0,
      comment_count: 0,
      isLiked: false,
    }
    
    // Deduplicate before unshifting
    if (!posts.value.some(p => Number(p.id) === postId)) {
      posts.value.unshift(newPostData)
    }
  } catch (err) {
    console.error('Failed to post:', err)
  }
}
</script>

<style scoped>
/* ── Sticky Community Mini Bar (Scrolled State) ── */
.sticky-community-minibar {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: calc(100% - 32px);
  max-width: 720px;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-primary);
  border-radius: 999px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
  animation: fadeInDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.minibar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;
  flex: 1;
}

.minibar-back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.15s, background 0.15s;
}

.minibar-back-btn:hover {
  transform: scale(1.08);
  background: var(--border-secondary);
}

.minibar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--brand);
  font-size: 16px;
  flex-shrink: 0;
}

.minibar-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.minibar-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.minibar-name {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.minibar-members {
  font-size: 11px;
  color: var(--text-muted);
}

.minibar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.minibar-join-btn {
  padding: 6px 16px;
  border-radius: 99px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.minibar-join-btn:hover {
  opacity: 0.9;
}

.minibar-joined-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 99px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-size: 12px;
  font-weight: 700;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -16px);
}

/* ── Root & Container ── */
.community-detail-root {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
}

.community-detail-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1080px;
  min-width: 0;
  padding: 24px 20px 96px;
  gap: 20px;
}

/* ── Hero Card ── */
.community-hero-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(14px);
  overflow: visible;
}

.cover-banner-wrap {
  height: 220px;
  position: relative;
  background-color: var(--bg-tertiary);
  border-radius: 23px 23px 0 0;
  overflow: hidden;
}

.banner-gradient-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.btn-back-pill {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 100px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.btn-back-pill:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateX(-2px);
}

.hero-body {
  padding: 0 28px 28px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.avatar-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -46px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.community-avatar-box {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  border: 5px solid var(--bg-card);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  flex-shrink: 0;
}

.community-avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-actions-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  position: relative;
  z-index: 3;
}

/* Action Buttons */
.btn-action-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 22px;
  border-radius: 100px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-action-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-pending {
  background: rgba(245, 158, 11, 0.15) !important;
  color: #f59e0b !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
  box-shadow: none !important;
}

.status-joined-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 100px;
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 13px;
  font-weight: 700;
}

.btn-pill-glass {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 100px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-pill-glass:hover {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
}

.btn-icon-danger {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}

.btn-pill-danger {
  padding: 8px 16px;
  border-radius: 100px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-pill-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

/* Community Meta Info */
.community-meta-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.community-main-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.25;
  letter-spacing: -0.3px;
}

.community-main-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
  max-width: 820px;
}

.community-chips-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 100px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.meta-chip strong {
  color: var(--text-primary);
}

/* ── Content Layout (2 Columns) ── */
.community-content-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.community-feed-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.community-sidebar-col {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 12px;
}

/* ── Tabs Bar ── */
.community-tabs-bar {
  display: flex;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 6px;
}

.sub-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.sub-tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.sub-tab-btn.active {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 700;
}

/* ── Feed Search & Composer ── */
.feed-tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.composer-container-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: visible;
  position: relative;
  z-index: 30;
}

.composer-container-card :deep(.composer-root-card) {
  border-radius: 20px;
  border-bottom: none;
  overflow: visible;
}

.feed-search-box {
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

.feed-search-input {
  width: 100%;
  padding: 11px 38px 11px 40px;
  border-radius: 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 13.5px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.feed-search-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.clear-btn {
  position: absolute;
  right: 12px;
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

/* ── Posts Stream Container ── */
.posts-stream-box {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

/* ── State & Empty Cards ── */
.feed-empty-card, .feed-locked-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.state-icon-circle, .locked-icon-circle {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.state-icon-circle.glowing, .locked-icon-circle {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  box-shadow: 0 0 20px rgba(123, 108, 246, 0.2);
}

.feed-empty-card h3, .feed-locked-card h2 {
  font-size: 19px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.feed-empty-card p, .feed-locked-card p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 0;
  max-width: 440px;
  line-height: 1.55;
}

.locked-subnote {
  display: block;
  margin-top: 8px;
  color: var(--brand);
  font-size: 12.5px;
}

/* ── Gallery Tab ── */
.gallery-tab-content {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 16px;
}

.gallery-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.gallery-item-wrap {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: var(--bg-tertiary);
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item-wrap:hover .gallery-img {
  transform: scale(1.06);
}

.gallery-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gallery-item-wrap:hover .gallery-hover-overlay {
  opacity: 1;
}

/* ── Sidebar Widgets ── */
.side-widget-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: var(--card-shadow);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.widget-icon {
  font-size: 17px;
}

.widget-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.rules-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
}

.rule-index {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--brand-light);
  color: var(--brand);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.rule-text {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.rules-empty-box {
  padding: 14px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12.5px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

/* Moderator Card */
.moderator-card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.moderator-card-row:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
  transform: translateX(2px);
}

.mod-avatar-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-tertiary);
}

.mod-avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mod-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-size: 14px;
}

.mod-info-box {
  flex: 1;
  min-width: 0;
}

.mod-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mod-role-badge {
  font-size: 11px;
  color: var(--brand);
  font-weight: 600;
}

.mod-arrow {
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.moderator-card-row:hover .mod-arrow {
  opacity: 1;
  color: var(--brand);
}

.privacy-note-text {
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* ── Error Screen ── */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 24px;
}

.error-card {
  background: var(--bg-card);
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  max-width: 480px;
  border: 1px solid rgba(244, 63, 94, 0.3);
  box-shadow: var(--card-shadow);
}

.error-icon {
  width: 72px;
  height: 72px;
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.error-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.error-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 24px;
  line-height: 1.6;
}

/* ── Modal Overlays ── */
.nexus-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.nexus-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.nexus-modal .modal-icon.warning {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.nexus-modal h2 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.nexus-modal p {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.modal-buttons-row {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-pill-danger-confirm {
  padding: 9px 22px;
  border-radius: 100px;
  background: #ef4444;
  color: #fff;
  border: none;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-pill-danger-confirm:hover {
  background: #dc2626;
}

.btn-pill-amber-confirm {
  padding: 10px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  border: none;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
  transition: all 0.2s ease;
}

.btn-pill-amber-confirm:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* Gallery Viewer */
.gallery-viewer-overlay {
  background: rgba(0, 0, 0, 0.9);
}

.gallery-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.gallery-close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.gallery-modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40px;
}

.gallery-zoom-img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

.gallery-modal-footer {
  margin-top: 20px;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* ── Clickable Meta Chip ── */
.clickable-chip {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
  font-family: inherit;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.clickable-chip:hover {
  background: rgba(139, 92, 246, 0.18);
  border-color: rgba(139, 92, 246, 0.45);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
}

.clickable-chip:active {
  transform: translateY(0) scale(0.98);
}

.chip-click-hint {
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
  color: var(--text-muted);
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.clickable-chip:hover .chip-click-hint {
  opacity: 1;
  color: #a78bfa;
  transform: translateX(2px);
}

/* ── Community Members Modal Card ── */
.members-modal-overlay {
  padding: 16px;
}

.members-modal-card {
  width: 100%;
  max-width: 580px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: rgba(15, 17, 26, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(139, 92, 246, 0.15);
  border-radius: 24px;
  overflow: hidden;
  animation: modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalPopIn {
  0% { opacity: 0; transform: scale(0.96) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.members-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-row h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.count-badge-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.modal-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.btn-close-modal {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
  transform: rotate(90deg);
}

/* Filter & Search Bar */
.members-filter-bar {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-input-wrap {
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

.glass-search-input {
  width: 100%;
  padding: 10px 38px 10px 40px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.glass-search-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.btn-clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  border-radius: 50%;
}

.btn-clear-search:hover {
  color: var(--text-primary);
}

.role-filter-segmented {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.filter-tab-btn {
  flex: 1;
  padding: 6px 10px;
  border-radius: 8px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.filter-tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.filter-tab-btn.active {
  background: rgba(139, 92, 246, 0.25);
  color: #ede9fe;
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

/* Scroll Body */
.members-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 24px;
  min-height: 280px;
  max-height: 480px;
}

.members-loading-box, .members-empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  gap: 12px;
  color: var(--text-muted);
}

.spinner-neon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: #a78bfa;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.members-empty-box h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0;
}

.members-empty-box p {
  font-size: 13px;
  margin: 0;
}

.members-grid-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-list-item-card {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 14px;
}

.member-list-item-card:hover {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.35);
  transform: translateX(4px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}

.member-avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.member-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar-fallback {
  font-size: 18px;
  font-weight: 700;
  color: #a78bfa;
}

.member-details-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.member-display-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
}

.role-badge.owner {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.role-badge.mod {
  background: rgba(14, 165, 233, 0.15);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.35);
}

.role-badge.regular {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.member-sub-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
  gap: 4px;
}

.member-username-tag {
  color: #a78bfa;
}

.member-action-right {
  display: flex;
  align-items: center;
}

.btn-view-profile {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;
}

.member-list-item-card:hover .btn-view-profile {
  background: rgba(139, 92, 246, 0.25);
  color: #ede9fe;
}

/* Modal Footer */
.members-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.25);
}

.footer-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.btn-close-footer {
  padding: 7px 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-footer:hover {
  background: rgba(255, 255, 255, 0.16);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .community-content-layout {
    flex-direction: column;
  }
  .community-sidebar-col {
    width: 100%;
    position: static;
  }
  .gallery-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .community-detail-container {
    padding: 12px 10px 96px;
  }
  .cover-banner-wrap {
    height: 160px;
  }
  .hero-body {
    padding: 0 16px 18px;
  }
  .community-avatar-box {
    width: 76px;
    height: 76px;
    font-size: 32px;
    border-radius: 20px;
  }
  .avatar-action-bar {
    margin-top: -36px;
  }
  .community-main-title {
    font-size: 21px;
  }
  .members-modal-card {
    max-height: 92vh;
  }
  .members-scroll-body {
    padding: 12px 16px;
  }
}
</style>
