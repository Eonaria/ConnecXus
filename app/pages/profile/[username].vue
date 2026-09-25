<template>
  <div class="profile-page-root">
    <div class="profile-container">

      <!-- Loading State -->
      <div v-if="profileLoading" class="profile-state-card">
        <div class="spinner"></div>
        <p>กำลังโหลดโปรไฟล์...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="profileError" class="profile-state-card error-card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <h3>ไม่พบผู้ใช้นี้</h3>
        <p>ผู้ใช้นี้ไม่มีอยู่ในระบบ</p>
      </div>

      <!-- Suspended Account Privacy View -->
      <div v-else-if="profileData?.is_banned" class="profile-main-wrapper suspended-profile-wrapper">
        <div class="profile-hero-card suspended-hero-card">
          <div class="profile-banner suspended-banner">
            <div class="banner-gradient-overlay" />
          </div>

          <div class="profile-hero-body">
            <div class="avatar-and-actions">
              <div class="hero-avatar-wrapper">
                <div class="avatar-ring-outer suspended-ring">
                  <div class="avatar-ring-inner">
                    <div class="avatar-placeholder suspended-avatar-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div class="hero-actions-wrapper">
                <NuxtLink v-if="authUser?.role === 'admin'" to="/admin" class="action-pill-btn btn-brand" style="text-decoration:none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>จัดการใน Admin Panel</span>
                </NuxtLink>
              </div>
            </div>

            <div class="profile-info-section">
              <div class="name-badge-row">
                <h1 class="hero-display-name">{{ profileData?.display_name || username }}</h1>
                <div class="suspended-account-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <span>บัญชีถูกระงับ</span>
                </div>
              </div>
              <div class="hero-username">@{{ username }}</div>
            </div>
          </div>
        </div>

        <!-- Privacy Box Notice -->
        <div class="suspended-notice-card">
          <div class="suspended-icon-box">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3>บัญชีนี้ถูกระงับการใช้งาน</h3>
          <p>บัญชี @{{ username }} ถูกระงับสิทธิ์การใช้งานชั่วคราวหรือถาวร เนื้อหา โพสต์ และกิจกรรมทั้งหมดถูกซ่อนไว้จนกว่าจะได้รับการปลดระงับจากผู้ดูแลระบบ</p>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-main-wrapper">
        
        <!-- ══ 1. HERO HEADER CARD ══ -->
        <div class="profile-hero-card">
          <!-- Cover Banner -->
          <div 
            class="profile-banner"
            :style="profileData?.banner_url ? `background-image: url(${profileData.banner_url}); background-position: center ${savedBannerPositionY}%;` : 'background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%);'"
            @click="profileData?.banner_url && openImageViewer(profileData.banner_url)"
            :class="{ 'has-banner': !!profileData?.banner_url }"
          >
            <div class="banner-gradient-overlay" />
            <input ref="bannerInput" type="file" accept="image/*" style="display:none" @change="onBannerFileChange" />
          </div>

          <!-- Hero Details & Avatar Area -->
          <div class="profile-hero-body">
            
            <!-- Top Row: Overlapping Avatar + Action Buttons -->
            <div class="avatar-and-actions">
              
              <!-- Avatar Ring -->
              <div 
                class="hero-avatar-wrapper"
                @click="profileData?.avatar_url && openImageViewer(profileData.avatar_url)"
                :class="{ 'clickable': !!profileData?.avatar_url }"
              >
                <div class="avatar-ring-outer">
                  <div class="avatar-ring-inner">
                    <img 
                      v-if="profileData?.avatar_url" 
                      :src="profileData.avatar_url" 
                      alt="avatar" 
                      class="avatar-img"
                    />
                    <div v-else class="avatar-placeholder">
                      {{ avatarInitials }}
                    </div>
                  </div>
                </div>

                <!-- Online indicator -->
                <div v-if="profileData?.is_own_profile" class="online-indicator-dot" />
                <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarFileChange" />
              </div>

              <!-- Top-right Action Buttons -->
              <div class="hero-actions-wrapper">
                
                <!-- Own Profile Actions -->
                <template v-if="profileData?.is_own_profile">
                  <button @click="copyProfileLink" class="action-pill-btn btn-ghost" title="แชร์โปรไฟล์">
                    <svg v-if="copied" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    <span>{{ copied ? 'คัดลอกแล้ว!' : 'แชร์' }}</span>
                  </button>
                  <button @click="openEditProfileModal" class="action-pill-btn btn-brand">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span>แก้ไขโปรไฟล์</span>
                  </button>
                  <button @click="showSettings = true" class="action-pill-btn btn-outline" title="การตั้งค่า">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </button>
                </template>

                <!-- Other User Actions -->
                <template v-else-if="authUser">
                  <button @click="copyProfileLink" class="action-pill-btn btn-ghost" title="แชร์">
                    <svg v-if="copied" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  </button>
                  <button 
                    v-if="user && profileData && user.id !== profileData.id"
                    @click="openReportModal('user', profileData.id)"
                    class="action-pill-btn btn-ghost-danger"
                    title="รายงานผู้ใช้"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  </button>
                  <button @click="authUser ? navigateTo(`/messages?username=${username}`) : openLoginModal('เข้าสู่ระบบเพื่อส่งข้อความ')" class="action-pill-btn btn-outline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>ข้อความ</span>
                  </button>
                  <button 
                    @click="handleFollowClick" 
                    :disabled="followLoading"
                    class="action-pill-btn"
                    :class="isFollowing ? 'btn-following' : 'btn-follow'"
                  >
                    <svg v-if="!isFollowing" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{{ followLoading ? '...' : isFollowing ? 'เลิกติดตาม' : 'ติดตาม' }}</span>
                  </button>
                </template>
              </div>

            </div>

            <!-- Profile Info: Name, Username, Role, Bio, Metadata, Stats -->
            <div class="profile-info-section">
              <div class="name-badge-row">
                <h1 class="hero-display-name">{{ profileData?.display_name || username }}</h1>
                <div v-if="profileData?.role === 'admin' || profileData?.role === 'moderator'" class="verified-role-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>{{ profileData?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ดูแล' }}</span>
                </div>
              </div>

              <div class="hero-username">@{{ username }}</div>

              <p v-if="profileData?.bio" class="hero-bio">{{ profileData.bio }}</p>

              <!-- Join Date & Stats Row -->
              <div class="meta-and-stats-row">
                <div class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>เข้าร่วมเมื่อ {{ joinDate }}</span>
                </div>

                <div class="stats-pills-group">
                  <div class="stat-bubble">
                    <span class="stat-num">{{ profileData?.post_count || 0 }}</span>
                    <span class="stat-lbl">โพสต์</span>
                  </div>
                  <div class="stat-bubble clickable" @click="openFollowList('following')">
                    <span class="stat-num">{{ profileData?.following_count || 0 }}</span>
                    <span class="stat-lbl">กำลังติดตาม</span>
                  </div>
                  <div class="stat-bubble clickable" @click="openFollowList('followers')">
                    <span class="stat-num">{{ profileData?.follower_count || 0 }}</span>
                    <span class="stat-lbl">ผู้ติดตาม</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        <!-- ══ 2. PROFILE CONTENT LAYOUT (Tabs + Feed + Right Sidebar) ══ -->
        <div class="profile-body-layout">
          
          <!-- Left / Main Stream -->
          <div class="profile-stream-col">
            
            <!-- Segmented Tabs -->
            <div class="profile-tabs-header">
              <button 
                v-for="tab in tabs" 
                :key="tab.key" 
                @click="activeTab = tab.key"
                class="stream-tab-btn"
                :class="{ 'active': activeTab === tab.key }"
              >
                <svg v-if="tab.key === 'posts'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <svg v-else-if="tab.key === 'reposts'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                <svg v-else-if="tab.key === 'media'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <svg v-else-if="tab.key === 'liked'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <!-- Tab Content Stream -->
            <div class="stream-content">
              <!-- Posts Tab -->
              <template v-if="activeTab === 'posts'">
                <div v-if="postsLoading" class="stream-loading">กำลังโหลดโพสต์...</div>
                <div v-else-if="userPosts.length === 0" class="stream-empty">
                  <div class="empty-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <h4>ยังไม่มีโพสต์</h4>
                  <p>ผู้ใช้นี้ยังไม่ได้แชร์โพสต์ใดๆ</p>
                </div>
                <div v-else class="posts-list">
                  <PostCard v-for="post in userPosts" :key="post.id" :post="post" @deleted="handleDeletedPost" />
                </div>
              </template>

              <!-- Reposts Tab -->
              <template v-if="activeTab === 'reposts'">
                <div v-if="repostsLoading" class="stream-loading">กำลังโหลดรีโพสต์...</div>
                <div v-else-if="userReposts.length === 0" class="stream-empty">
                  <div class="empty-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <polyline points="17 1 21 5 17 9"/>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                      <polyline points="7 23 3 19 7 15"/>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                  </div>
                  <h4>ยังไม่มีรีโพสต์</h4>
                  <p>ผู้ใช้นี้ยังไม่ได้รีโพสต์ข้อความใดๆ</p>
                </div>
                <div v-else class="posts-list">
                  <PostCard v-for="post in userReposts" :key="post.id" :post="post" />
                </div>
              </template>

              <!-- Media Tab -->
              <template v-if="activeTab === 'media'">
                <div v-if="mediaImages.length > 0" class="media-masonry-grid">
                  <div 
                    v-for="img in mediaImages" 
                    :key="img.id" 
                    class="media-grid-item"
                    @click="openImageViewer(img.image_url)"
                  >
                    <video 
                      v-if="isVideoItem(img.image_url)" 
                      :src="img.image_url" 
                      class="media-grid-video" 
                      muted 
                      preload="metadata" 
                      playsinline
                    ></video>
                    <img v-else :src="img.image_url" alt="media" loading="lazy" />
                    
                    <div v-if="isVideoItem(img.image_url)" class="media-grid-video-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div v-else class="stream-empty">
                  <div class="empty-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <h4>ยังไม่มีรูปภาพ</h4>
                  <p>ไม่มีรูปภาพหรือมีเดียที่โพสต์</p>
                </div>
              </template>

              <!-- Liked Tab -->
              <template v-if="activeTab === 'liked'">
                <div v-if="likedPostsLoading" class="stream-loading">กำลังโหลด...</div>
                <div v-else-if="likedPosts.length === 0" class="stream-empty">
                  <div class="empty-icon-circle">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <h4>ยังไม่มีโพสต์ที่ถูกใจ</h4>
                  <p>ยังไม่มีรายการโพสต์ที่กดถูกใจไว้</p>
                </div>
                <div v-else class="posts-list">
                  <PostCard v-for="post in likedPosts" :key="post.id" :post="post" />
                </div>
              </template>
            </div>

          </div>

          <!-- Right Sidebar (Achievements & Media Preview) -->
          <div class="profile-side-col">
            
            <!-- Achievements Widget -->
            <div class="side-widget-card">
              <div class="widget-header">
                <span class="widget-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                  </svg>
                </span>
                <h3>เกียรติบัตร & ตราสัญลักษณ์</h3>
              </div>
              <div class="achievements-badges-wrap">
                <div class="badge-item">
                  <span class="badge-emoji">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </span>
                  <div class="badge-info">
                    <span class="badge-name">สมาชิก</span>
                    <span class="badge-desc">ผู้ใช้งาน ConnecXus</span>
                  </div>
                </div>
                <div v-if="(profileData?.post_count || 0) >= 1" class="badge-item">
                  <span class="badge-emoji">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </span>
                  <div class="badge-info">
                    <span class="badge-name">นักเขียน</span>
                    <span class="badge-desc">เคยสร้างโพสต์ในระบบ</span>
                  </div>
                </div>
                <div v-if="profileData?.role === 'admin'" class="badge-item admin-badge">
                  <span class="badge-emoji">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                    </svg>
                  </span>
                  <div class="badge-info">
                    <span class="badge-name">ผู้ดูแลระบบ</span>
                    <span class="badge-desc">ทีมงานส่วนกลาง</span>
                  </div>
                </div>
                <div v-if="profileData?.role === 'admin' || profileData?.role === 'moderator'" class="badge-item verified-badge">
                  <span class="badge-emoji">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </span>
                  <div class="badge-info">
                    <span class="badge-name">ยืนยันตัวตนแล้ว</span>
                    <span class="badge-desc">บัญชีทางการ</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Media Mini Grid -->
            <div v-if="mediaImages.length > 0" class="side-widget-card">
              <div class="widget-header">
                <span class="widget-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </span>
                <h3>รูปภาพ & วิดีโอล่าสุด</h3>
              </div>
              <div class="recent-media-grid">
                <div 
                  v-for="img in mediaImages.slice(0, 6)" 
                  :key="img.id" 
                  class="recent-media-item"
                  @click="openImageViewer(img.image_url)"
                >
                  <video 
                    v-if="isVideoItem(img.image_url)" 
                    :src="img.image_url" 
                    class="recent-media-thumb-video" 
                    muted 
                    preload="metadata" 
                    playsinline
                  ></video>
                  <img v-else :src="img.image_url" alt="recent media" loading="lazy" />
                  
                  <div v-if="isVideoItem(img.image_url)" class="recent-media-video-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- ══════════════════════════════════════════
         IMAGE PREVIEW MODAL (avatar & banner)
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="imagePreview.show"
        style="position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); padding: 20px;"
        @click.self="cancelImagePreview"
      >
        <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 20px; overflow: hidden; width: 100%; max-width: 640px; box-shadow: var(--card-shadow);">

          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border-primary);">
            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0;">
              {{ imagePreview.type === 'banner' ? 'ตั้งค่าภาพปกหลัง' : 'ตั้งค่ารูปโปรไฟล์' }}
            </h3>
            <button @click="cancelImagePreview" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Preview area -->
          <div 
            class="crop-preview-stage"
            @pointerdown="onDragStart"
            @wheel.prevent="onWheelZoom"
            :style="`
              position: relative; overflow: hidden; user-select: none; touch-action: none;
              ${imagePreview.type === 'banner' ? 'height: 280px; background: #0b0c16;' : 'height: 310px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0e0e1a;'}
            `"
          >
            <!-- Banner preview -->
            <div v-if="imagePreview.type === 'banner'" style="width: 100%; height: 100%; position: relative; cursor: grab;" :class="{ 'cursor-grabbing': imagePreview.isDragging }">
              <img
                :src="imagePreview.dataUrl"
                alt="preview"
                draggable="false"
                :style="`
                  width: 100%; height: 100%; object-fit: cover;
                  object-position: ${imagePreview.positionX}% ${imagePreview.positionY}%;
                  transform: scale(${imagePreview.zoom / 100});
                  transform-origin: ${imagePreview.positionX}% ${imagePreview.positionY}%;
                  display: block;
                  pointer-events: none;
                `"
              />
              <div class="crop-overlay-hint">ลากเพื่อเลื่อนตำแหน่งภาพ หรือหมุนลูกกลิ้งเมาส์เพื่อซูม</div>
            </div>

            <!-- Avatar preview -->
            <div v-else style="display: flex; flex-direction: column; align-items: center; gap: 14px; position: relative; z-index: 2;">
              <div
                style="
                  position: relative;
                  width: 160px; height: 160px; border-radius: 50%;
                  border: 4px solid var(--brand);
                  box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0,0,0,0.5);
                  overflow: hidden;
                  cursor: grab;
                  background: #000;
                "
                :class="{ 'cursor-grabbing': imagePreview.isDragging }"
              >
                <img
                  :src="imagePreview.dataUrl"
                  alt="avatar preview"
                  draggable="false"
                  :style="`
                    width: 100%; height: 100%; object-fit: cover;
                    object-position: ${imagePreview.positionX}% ${imagePreview.positionY}%;
                    transform: scale(${imagePreview.zoom / 100});
                    transform-origin: ${imagePreview.positionX}% ${imagePreview.positionY}%;
                    display: block;
                    pointer-events: none;
                  `"
                />
              </div>

              <!-- Directional Nudge Pills for Ultra Easy Adjustments -->
              <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.45); padding: 4px 10px; border-radius: 100px; border: 1px solid var(--border-primary);">
                <button type="button" @click.stop="nudgePosition(0, -10)" class="btn-nudge" title="เลื่อนขึ้น">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" @click.stop="nudgePosition(0, 10)" class="btn-nudge" title="เลื่อนลง">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button type="button" @click.stop="nudgePosition(-10, 0)" class="btn-nudge" title="เลื่อนซ้าย">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" @click.stop="nudgePosition(10, 0)" class="btn-nudge" title="เลื่อนขวา">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button type="button" @click.stop="resetCropPosition" class="btn-nudge reset" title="กึ่งกลาง">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  <span>กึ่งกลาง</span>
                </button>
              </div>

              <p style="color: var(--text-muted); font-size: 12px; margin: 0;">ลากเมาส์เลื่อนภาพได้อิสระ หรือกดปุ่มลูกศรเพื่อปรับ</p>
            </div>
          </div>

          <!-- Slider & controls -->
          <div style="padding: 18px 22px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
              <span style="font-size: 13px; color: var(--brand); font-weight: 700; white-space: nowrap; display: flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>ปรับขนาดภาพ (Zoom)</span>
              </span>

              <button type="button" @click="imagePreview.zoom = Math.max(100, imagePreview.zoom - 15)" class="btn-zoom-step" title="ซูมออก">-</button>
              
              <input
                type="range"
                min="100"
                max="300"
                step="1"
                v-model.number="imagePreview.zoom"
                style="flex: 1; accent-color: var(--brand); cursor: pointer; height: 6px; border-radius: 99px;"
              />

              <button type="button" @click="imagePreview.zoom = Math.min(300, imagePreview.zoom + 15)" class="btn-zoom-step" title="ซูมเข้า">+</button>
              <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); width: 42px; text-align: right;">{{ imagePreview.zoom }}%</span>
            </div>

            <!-- Confirm / Cancel buttons -->
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button
                @click="cancelImagePreview"
                style="padding: 10px 22px; border-radius: 12px; background: transparent; border: 1px solid var(--border-primary); color: var(--text-muted); font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s;"
              >ยกเลิก</button>
              <button
                @click="confirmImageUpload"
                :disabled="imagePreview.uploading"
                style="padding: 10px 28px; border-radius: 12px; background: linear-gradient(135deg, #5b46e0, #7b6cf6); border: none; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; box-shadow: 0 4px 14px rgba(91,70,224,0.35);"
              >{{ imagePreview.uploading ? 'กำลังบันทึก...' : '✓ ยืนยัน' }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>



    <!-- ══════════════════════════════════════════
         EDIT PROFILE MODAL
    ══════════════════════════════════════════ -->
    <!-- ══════════════════════════════════════════
         EDIT PROFILE MODAL
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-card" style="max-width: 520px; padding: 0; overflow: hidden; border-radius: 24px;">
          
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border-primary);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; color: #a78bfa;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin: 0;">แก้ไขโปรไฟล์</h2>
                <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">ปรับแต่งรูปโปรไฟล์ รูปหน้าปก และข้อมูลของคุณ</p>
              </div>
            </div>
            <button @click="showEditModal = false" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveProfile">
            <!-- ── Interactive Cover & Avatar Editor ── -->
            <div style="position: relative; margin-bottom: 48px;">
              <!-- Banner Container with Overlay Controls -->
              <div 
                :style="`
                  height: 140px;
                  background: ${editForm.banner_url ? `url(${editForm.banner_url}) center/cover no-repeat` : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%)'};
                  position: relative;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `"
              >
                <!-- Overlay Shadow -->
                <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; gap: 10px;">
                  <button 
                    type="button"
                    @click="bannerInput?.click()"
                    style="display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; padding: 7px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>{{ editForm.banner_url ? 'เปลี่ยนรูปปก' : 'เพิ่มรูปปก' }}</span>
                  </button>

                  <button 
                    v-if="editForm.banner_url"
                    type="button"
                    @click="editForm.banner_url = ''"
                    style="display: flex; align-items: center; gap: 4px; background: rgba(239, 68, 68, 0.75); backdrop-filter: blur(8px); border: 1px solid rgba(239, 68, 68, 0.4); color: #fff; padding: 7px 10px; border-radius: 10px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                    title="ลบรูปภาพปก"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    <span>ลบ</span>
                  </button>
                </div>
              </div>

              <!-- Overlapping Avatar Container -->
              <div style="position: absolute; left: 24px; bottom: -36px; z-index: 10;">
                <div style="position: relative; width: 80px; height: 80px;">
                  <div style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid var(--bg-card); background: var(--bg-tertiary); overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
                    <img 
                      v-if="editForm.avatar_url" 
                      :src="editForm.avatar_url" 
                      alt="Avatar Preview" 
                      style="width: 100%; height: 100%; object-fit: cover;"
                    />
                    <div v-else style="font-size: 24px; font-weight: 800; color: #a78bfa;">
                      {{ avatarInitials }}
                    </div>
                  </div>

                  <!-- Avatar Camera Overlay Button -->
                  <button 
                    type="button" 
                    @click="avatarInput?.click()"
                    style="position: absolute; inset: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.45); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0.85; transition: opacity 0.2s;"
                    title="แตะเพื่อเปลี่ยนรูปโปรไฟล์"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Form Content -->
            <div style="padding: 0 24px 24px 24px;">
              <!-- Display Name -->
              <div style="margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="font-size: 13px; font-weight: 600; color: var(--text-primary);">ชื่อที่แสดง (Display Name)</label>
                  <span style="font-size: 11.5px; color: var(--text-muted);">{{ (editForm.display_name || '').length }}/50</span>
                </div>
                <input
                  v-model="editForm.display_name"
                  type="text"
                  class="cx-input"
                  placeholder="ชื่อที่แสดง"
                  maxlength="50"
                  style="width: 100%; box-sizing: border-box;"
                />
              </div>

              <!-- Bio -->
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="font-size: 13px; font-weight: 600; color: var(--text-primary);">แนะนำตัว (Bio)</label>
                  <span style="font-size: 11.5px; color: var(--text-muted);">{{ (editForm.bio || '').length }}/160</span>
                </div>
                <textarea
                  v-model="editForm.bio"
                  class="cx-input"
                  rows="3"
                  placeholder="เขียนแนะนำตัวของคุณ..."
                  maxlength="160"
                  style="resize: none; min-height: 80px; width: 100%; box-sizing: border-box;"
                />
              </div>

              <!-- Theme Selection Option -->
              <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">ธีมการแสดงผล (Theme)</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Dark Mode Button -->
                  <button
                    type="button"
                    @click="setTheme('dark')"
                    :style="`
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                      padding: 11px 14px;
                      border-radius: 12px;
                      background: ${theme === 'dark' ? 'rgba(123, 108, 246, 0.15)' : 'var(--bg-tertiary)'};
                      border: 2px solid ${theme === 'dark' ? 'var(--brand)' : 'var(--border-primary)'};
                      color: ${theme === 'dark' ? 'var(--brand)' : 'var(--text-secondary)'};
                      font-size: 13.5px;
                      font-weight: 700;
                      cursor: pointer;
                      transition: all 0.2s;
                    `"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                    <span>ธีมมืด (Dark)</span>
                  </button>

                  <!-- Light Mode Button -->
                  <button
                    type="button"
                    @click="setTheme('light')"
                    :style="`
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 8px;
                      padding: 11px 14px;
                      border-radius: 12px;
                      background: ${theme === 'light' ? 'rgba(123, 108, 246, 0.15)' : 'var(--bg-tertiary)'};
                      border: 2px solid ${theme === 'light' ? 'var(--brand)' : 'var(--border-primary)'};
                      color: ${theme === 'light' ? 'var(--brand)' : 'var(--text-secondary)'};
                      font-size: 13.5px;
                      font-weight: 700;
                      cursor: pointer;
                      transition: all 0.2s;
                    `"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    <span>ธีมสว่าง (Light)</span>
                  </button>
                </div>
              </div>

              <!-- Actions Footer -->
              <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button
                  type="button"
                  @click="showEditModal = false"
                  style="
                    background: transparent;
                    border: 1px solid var(--border-primary);
                    border-radius: 12px;
                    padding: 10px 22px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-muted);
                    cursor: pointer;
                  "
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  :disabled="editSaving"
                  class="cx-btn-primary"
                  style="padding: 10px 28px; border-radius: 12px; font-weight: 700;"
                >
                  <span v-if="editSaving">กำลังบันทึก...</span>
                  <span v-else>บันทึกการเปลี่ยนแปลง</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════════════════════════════
         SETTINGS MODAL
    ══════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
        <div class="modal-card" style="max-width: 520px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -3px; margin-right: 8px;">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              การตั้งค่า
            </h2>
            <button @click="showSettings = false" style="background: none; border: none; cursor: pointer; color: #9ba3c0; padding: 4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Settings Sections -->
          <div style="display: flex; flex-direction: column; gap: 0;">

            <!-- Account Section -->
            <div class="settings-section">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 class="settings-section-title" style="margin: 0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  บัญชี
                </h3>
                <NuxtLink to="/settings/security" style="font-size: 13px; color: var(--brand); font-weight: 600; text-decoration: none;">
                  ตั้งค่าความปลอดภัย &rarr;
                </NuxtLink>
              </div>
              <div class="settings-item">
                <div>
                  <div class="settings-item-label">ชื่อผู้ใช้</div>
                  <div class="settings-item-value">@{{ username }}</div>
                </div>
              </div>
              <div class="settings-item">
                <div>
                  <div class="settings-item-label">อีเมล</div>
                  <div class="settings-item-value">{{ profileData?.email || '-' }}</div>
                </div>
              </div>
              <div class="settings-item">
                <div>
                  <div class="settings-item-label">บทบาท</div>
                  <div class="settings-item-value">
                    {{ profileData?.role === 'admin' ? 'ผู้ดูแลระบบ' : profileData?.role === 'moderator' ? 'ผู้ดูแล' : 'สมาชิก' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Privacy Section -->
            <div class="settings-section">
              <h3 class="settings-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                ความเป็นส่วนตัว
              </h3>
              <div class="settings-item" style="justify-content: space-between; align-items: center;">
                <div>
                  <div class="settings-item-label">โปรไฟล์สาธารณะ</div>
                  <div class="settings-item-desc">อนุญาตให้ทุกคนเห็นโปรไฟล์ของคุณ</div>
                </div>
                <div class="toggle-switch active">
                  <div class="toggle-knob" />
                </div>
              </div>
              <div class="settings-item" style="justify-content: space-between; align-items: center;">
                <div>
                  <div class="settings-item-label">แสดงสถานะออนไลน์</div>
                  <div class="settings-item-desc">ให้ผู้อื่นเห็นเมื่อคุณออนไลน์</div>
                </div>
                <div class="toggle-switch active">
                  <div class="toggle-knob" />
                </div>
              </div>
            </div>

            <!-- Theme Section -->
            <div class="settings-section">
              <h3 class="settings-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                </svg>
                ธีม
              </h3>
              <div style="display: flex; gap: 10px; padding: 0 0 8px;">
                <button
                  @click="setTheme('light')"
                  :style="`
                    flex: 1; padding: 12px; border-radius: 10px;
                    border: 2px solid ${theme === 'light' ? '#7b6cf6' : '#edf0f7'};
                    background: ${theme === 'light' ? 'rgba(123,108,246,0.08)' : '#f8fafc'};
                    cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;
                  `"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="theme === 'light' ? '#7b6cf6' : '#9ba3c0'" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  </svg>
                  <span :style="`font-size: 13px; font-weight: 600; color: ${theme === 'light' ? '#7b6cf6' : '#7882a4'};`">สว่าง</span>
                </button>
                <button
                  @click="setTheme('dark')"
                  :style="`
                    flex: 1; padding: 12px; border-radius: 10px;
                    border: 2px solid ${theme === 'dark' ? '#7b6cf6' : '#edf0f7'};
                    background: ${theme === 'dark' ? 'rgba(123,108,246,0.08)' : '#f8fafc'};
                    cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;
                  `"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="theme === 'dark' ? '#7b6cf6' : '#9ba3c0'" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span :style="`font-size: 13px; font-weight: 600; color: ${theme === 'dark' ? '#7b6cf6' : '#7882a4'};`">มืด</span>
                </button>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="settings-section" style="border-bottom: none;">
              <h3 class="settings-section-title" style="color: #ef4444;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                โซนอันตราย
              </h3>
              <button
                @click="handleLogout"
                style="
                  width: 100%;
                  background: rgba(239, 68, 68, 0.08);
                  border: 1px solid rgba(239, 68, 68, 0.2);
                  border-radius: 10px;
                  padding: 12px 16px;
                  font-size: 14px;
                  font-weight: 600;
                  color: #ef4444;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  transition: all 0.2s;
                "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                ออกจากระบบ
              </button>

              <button
                @click="openDeleteAccountModal"
                style="
                  width: 100%;
                  margin-top: 12px;
                  background: #ef4444;
                  border: none;
                  border-radius: 10px;
                  padding: 12px 16px;
                  font-size: 14px;
                  font-weight: 600;
                  color: #ffffff;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                "
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                ลบบัญชี
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <AppConfirmModal
    :isOpen="isConfirmUnfollowOpen"
    title="เลิกติดตาม"
    :message="`คุณต้องการเลิกติดตาม @${username} ใช่หรือไม่?`"
    confirmText="เลิกติดตาม"
    @confirm="() => { executeToggleFollow(); isConfirmUnfollowOpen = false }"
    @cancel="isConfirmUnfollowOpen = false"
  />
  <FollowListModal
    :isOpen="isFollowListOpen"
    :title="followListType === 'followers' ? 'ผู้ติดตาม' : 'กำลังติดตาม'"
    :username="username"
    :type="followListType"
    @close="isFollowListOpen = false"
  />

  <!-- Delete Account Modal -->
  <Teleport to="body">
    <div v-if="showDeleteModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px);">
      <div style="background: var(--bg-card); border-radius: 16px; width: 400px; max-width: 90%; padding: 24px; border: 1px solid var(--border-primary); text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; color: #ef4444; margin-bottom: 12px;">ลบบัญชีผู้ใช้</h3>
        
        <div v-if="deleteStep === 1">
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">
            การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบถาวร
            <br><br>กรุณากรอกรหัสด้านล่างเพื่อยืนยัน:
          </p>
          <div style="background: rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 12px; font-size: 24px; font-weight: 800; letter-spacing: 4px; color: #ef4444; margin-bottom: 20px; user-select: none;">
            {{ deleteCode }}
          </div>
          <input 
            v-model="inputDeleteCode" 
            type="text" 
            placeholder="กรอกรหัส 6 หลัก" 
            style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-primary); background: var(--bg-body); color: var(--text-primary); text-align: center; font-size: 18px; letter-spacing: 2px; margin-bottom: 24px; outline: none;"
          />
          <div style="display: flex; gap: 12px;">
            <button @click="showDeleteModal = false" style="flex: 1; padding: 12px; border-radius: 8px; border: none; background: var(--bg-tertiary); color: var(--text-primary); cursor: pointer; font-weight: 600;">ยกเลิก</button>
            <button @click="confirmDeleteCode" :disabled="inputDeleteCode !== deleteCode" :style="`flex: 1; padding: 12px; border-radius: 8px; border: none; background: ${inputDeleteCode === deleteCode ? '#ef4444' : 'var(--bg-tertiary)'}; color: #fff; cursor: ${inputDeleteCode === deleteCode ? 'pointer' : 'not-allowed'}; font-weight: 600;`">ยืนยัน</button>
          </div>
        </div>

        <div v-else-if="deleteStep === 2">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">คุณแน่ใจหรือไม่?</p>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5;">
            นี่คือการยืนยันครั้งสุดท้าย หลังจากกดลบบัญชีแล้ว คุณจะไม่สามารถกู้คืนข้อมูลใดๆ กลับมาได้อีก
          </p>
          <div style="display: flex; gap: 12px;">
            <button @click="showDeleteModal = false" style="flex: 1; padding: 12px; border-radius: 8px; border: none; background: var(--bg-tertiary); color: var(--text-primary); cursor: pointer; font-weight: 600;" :disabled="isDeletingAccount">ยกเลิก</button>
            <button @click="executeAccountDeletion" style="flex: 1; padding: 12px; border-radius: 8px; border: none; background: #ef4444; color: #fff; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;" :disabled="isDeletingAccount">
              <span v-if="isDeletingAccount">กำลังลบ...</span>
              <span v-else>ใช่, ลบบัญชีเลย</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══════════════════════════════════════════
       MEDIA LIGHTBOX / VIEWER (Image & Video)
  ══════════════════════════════════════════ -->
  <Teleport to="body">
    <div
      v-if="imageViewer.show"
      class="media-lightbox-overlay"
      @click.self="closeImageViewer"
    >
      <div class="media-lightbox-container">
        <button class="media-lightbox-close" @click="closeImageViewer" title="ปิด">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <video
          v-if="isVideoItem(imageViewer.url)"
          :src="imageViewer.url"
          controls
          autoplay
          class="media-lightbox-media"
        ></video>
        <img
          v-else
          :src="imageViewer.url"
          alt="media view"
          class="media-lightbox-media"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useReportModal } from '~/composables/useReportModal'
const { openReportModal } = useReportModal()
const route = useRoute()
const username = computed(() => (route.params.username as string) || '')
const { user: authUser, logout } = useAuth()
const { openLoginModal } = useLoginModal()
const toast = useToast()
const user = authUser  // keep backward compat for template refs
const { theme, setTheme } = useTheme()

useHead({ title: computed(() => `โปรไฟล์ @${username.value} — ConnecXus`) })

onMounted(() => {
  // Ensure we start at the top when landing on this profile
  window.scrollTo({ top: 0, behavior: 'instant' })
})

// ── State ──
const profileData = ref<any>(null)
const profileLoading = ref(true)
const profileError = ref(false)
const activeTab = ref<'posts' | 'reposts' | 'media' | 'liked'>('posts')
const showEditModal = ref(false)
const showSettings = ref(false)
const editSaving = ref(false)

const userPosts = ref<any[]>([])
const postsLoading = ref(false)
const userReposts = ref<any[]>([])
const repostsLoading = ref(false)
const likedPosts = ref<any[]>([])
const likedPostsLoading = ref(false)

const editForm = reactive({
  display_name: '',
  bio: '',
  banner_url: '',
  avatar_url: '',
})

function openEditProfileModal() {
  editForm.display_name = profileData.value?.display_name || ''
  editForm.bio = profileData.value?.bio || ''
  editForm.banner_url = profileData.value?.banner_url || ''
  editForm.avatar_url = profileData.value?.avatar_url || ''
  showEditModal.value = true
}

const avatarInput = ref<HTMLInputElement | null>(null)
const bannerInput = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)
const bannerUploading = ref(false)

// ── Follow State ──
const isFollowing = ref(false)
const followLoading = ref(false)
const localFollowerCount = computed(() => profileData.value?.follower_count ?? 0)

// ── Share Profile ──
const copied = ref(false)
async function copyProfileLink() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${origin}/profile/${route.params.username}`
  await copyToClipboard(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

// ── Banner display position (saved after confirm) ──
const savedBannerPositionY = ref(50)

// ── Media images (posts that have images/media, expanding multi-image posts) ──
const mediaImages = computed(() => {
  const items: { id: string; post_id: number; image_url: string; isVideo: boolean }[] = []
  
  for (const post of userPosts.value) {
    if (!post.image_url) continue
    
    let urls: string[] = []
    if (Array.isArray(post.image_url)) {
      urls = (post.image_url as any[]).filter(Boolean)
    } else if (typeof post.image_url === 'string') {
      const trimmed = (post.image_url as string).trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed)
          if (Array.isArray(parsed)) {
            urls = parsed.filter(Boolean)
          }
        } catch {
          urls = [trimmed]
        }
      } else if (trimmed) {
        urls = [trimmed]
      }
    }

    urls.forEach((url, idx) => {
      items.push({
        id: `${post.id}-${idx}`,
        post_id: post.id,
        image_url: url,
        isVideo: isVideoItem(url)
      })
    })
  }

  return items
})

  // ── Image Preview Modal state ──
// ── Image Preview Modal state ──
const imagePreview = reactive({
  show: false,
  type: 'banner' as 'banner' | 'avatar',
  file: null as File | null,
  dataUrl: '',
  positionX: 50,
  positionY: 50,
  zoom: 100,
  uploading: false,
  isDragging: false,
  startX: 0,
  startY: 0
})

function onDragStart(e: PointerEvent | MouseEvent | TouchEvent) {
  imagePreview.isDragging = true
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
  imagePreview.startX = clientX
  imagePreview.startY = clientY

  if (typeof window !== 'undefined') {
    window.addEventListener('pointermove', onPointerDragMove)
    window.addEventListener('pointerup', onPointerDragEnd)
    window.addEventListener('touchmove', onTouchDragMove, { passive: false })
    window.addEventListener('touchend', onPointerDragEnd)
  }
}

function onPointerDragMove(e: PointerEvent | MouseEvent) {
  if (!imagePreview.isDragging) return
  const dx = e.clientX - imagePreview.startX
  const dy = e.clientY - imagePreview.startY

  // Responsive drag sensitivity: dragging up (dy < 0) moves image up (increases positionY)
  const speed = 0.55
  imagePreview.positionX = Math.max(0, Math.min(100, imagePreview.positionX - dx * speed))
  imagePreview.positionY = Math.max(0, Math.min(100, imagePreview.positionY - dy * speed))

  imagePreview.startX = e.clientX
  imagePreview.startY = e.clientY
}

function onTouchDragMove(e: TouchEvent) {
  if (!imagePreview.isDragging || !e.touches[0]) return
  e.preventDefault()
  const touch = e.touches[0]
  const dx = touch.clientX - imagePreview.startX
  const dy = touch.clientY - imagePreview.startY

  const speed = 0.55
  imagePreview.positionX = Math.max(0, Math.min(100, imagePreview.positionX - dx * speed))
  imagePreview.positionY = Math.max(0, Math.min(100, imagePreview.positionY - dy * speed))

  imagePreview.startX = touch.clientX
  imagePreview.startY = touch.clientY
}

function onPointerDragEnd() {
  imagePreview.isDragging = false
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onPointerDragMove)
    window.removeEventListener('pointerup', onPointerDragEnd)
    window.removeEventListener('touchmove', onTouchDragMove)
    window.removeEventListener('touchend', onPointerDragEnd)
  }
}

function onWheelZoom(e: WheelEvent) {
  const delta = e.deltaY < 0 ? 8 : -8
  imagePreview.zoom = Math.max(100, Math.min(300, imagePreview.zoom + delta))
}

function nudgePosition(dxPercent: number, dyPercent: number) {
  imagePreview.positionX = Math.max(0, Math.min(100, imagePreview.positionX + dxPercent))
  imagePreview.positionY = Math.max(0, Math.min(100, imagePreview.positionY + dyPercent))
}

function resetCropPosition() {
  imagePreview.positionX = 50
  imagePreview.positionY = 50
  imagePreview.zoom = 100
}

async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file, file.name)
  const res = await $fetch<{ success: boolean, url: string }>('/api/upload', {
    method: 'POST',
    body: formData
  })
  return res.url
}

// Open preview modal for banner
function onBannerFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (ev) => {
    imagePreview.file = file
    imagePreview.dataUrl = ev.target?.result as string
    imagePreview.type = 'banner'
    imagePreview.positionX = 50
    imagePreview.positionY = 50
    imagePreview.zoom = 100
    imagePreview.show = true
  }
  reader.readAsDataURL(file)
  target.value = ''
}

// Open preview modal for avatar
function onAvatarFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  const reader = new FileReader()
  reader.onload = (ev) => {
    imagePreview.file = file
    imagePreview.dataUrl = ev.target?.result as string
    imagePreview.type = 'avatar'
    imagePreview.positionX = 50
    imagePreview.positionY = 50
    imagePreview.zoom = 100
    imagePreview.show = true
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function cancelImagePreview() {
  onPointerDragEnd()
  imagePreview.show = false
  imagePreview.file = null
  imagePreview.dataUrl = ''
}

// ── Video detection helper ──
function isVideoItem(url?: string | null) {
  if (!url) return false
  const lower = url.toLowerCase()
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.mkv') ||
    lower.endsWith('.avi') ||
    lower.startsWith('data:video/') ||
    lower.includes('/video')
  )
}

// ── Image Viewer State ──
const imageViewer = reactive({
  show: false,
  url: ''
})

function openImageViewer(url: string | null) {
  if (url) {
    imageViewer.url = url
    imageViewer.show = true
  }
}

function closeImageViewer() {
  imageViewer.show = false
  setTimeout(() => { imageViewer.url = '' }, 300)
}

function downloadImage(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = url.split('/').pop() || 'image.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ── Image Cropping Logic ──
function cropImage(imgDataUrl: string, type: 'avatar' | 'banner', zoom: number, posX: number, posY: number, originalFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas ctx is null'))
      
      let targetW = type === 'avatar' ? 400 : 900
      let targetH = type === 'avatar' ? 400 : 300
      
      canvas.width = targetW
      canvas.height = targetH

      // Calculate cover dimensions
      const imgRatio = img.width / img.height
      const targetRatio = targetW / targetH
      
      let drawW, drawH
      if (imgRatio > targetRatio) {
        drawH = targetH
        drawW = targetH * imgRatio
      } else {
        drawW = targetW
        drawH = targetW / imgRatio
      }
      
      // Apply zoom
      drawW *= (zoom / 100)
      drawH *= (zoom / 100)
      
      // Calculate max offset
      const maxOffsetX = drawW - targetW
      const maxOffsetY = drawH - targetH
      
      // Calculate actual offset (positionX and positionY are 0-100 percentages)
      const offsetX = -(maxOffsetX * (posX / 100))
      const offsetY = -(maxOffsetY * (posY / 100))
      
      // Fill background (for transparent images)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, targetW, targetH)
      
      // Draw image
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
      
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Blob failed'))
        const newFile = new File([blob], originalFile.name, { type: originalFile.type })
        resolve(newFile)
      }, originalFile.type, 0.95)
    }
    img.onerror = reject
    img.src = imgDataUrl
  })
}

async function confirmImageUpload() {
  if (!imagePreview.file || imagePreview.uploading) return
  imagePreview.uploading = true
  try {
    // 1. Crop image via Canvas based on user's positioning
    const croppedFile = await cropImage(
      imagePreview.dataUrl, 
      imagePreview.type, 
      imagePreview.zoom, 
      imagePreview.positionX, 
      imagePreview.positionY, 
      imagePreview.file
    )
    
    // 2. Upload the cropped file instead of the raw file
    const url = await uploadFile(croppedFile)
    
    if (imagePreview.type === 'banner') {
      savedBannerPositionY.value = 50 // Reset because it's already cropped correctly!
      await $fetch('/api/users/profile', {
        method: 'PUT',
        body: { banner_url: url }
      })
      editForm.banner_url = url
      if (profileData.value) profileData.value.banner_url = url
    } else {
      await $fetch('/api/users/profile', {
        method: 'PUT',
        body: { avatar_url: url }
      })
      editForm.avatar_url = url
      if (profileData.value) profileData.value.avatar_url = url
      if (authUser.value) authUser.value.avatar_url = url
    }
    imagePreview.show = false
    imagePreview.file = null
    imagePreview.dataUrl = ''
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    imagePreview.uploading = false
  }
}


// Legacy: avatar handler for edit modal (keeping for compat)
async function onAvatarFileSelected(e: Event) {
  onAvatarFileChange(e)
}
async function onBannerFileSelected(e: Event) {
  onBannerFileChange(e)
}


// ── Computed ──
const avatarInitials = computed(() => {
  const name = profileData.value?.display_name || username.value
  return name.trim().slice(0, 2)
})

const joinDate = computed(() => {
  if (!profileData.value?.created_at) return '-'
  const d = new Date(profileData.value.created_at)
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  const buddhistYear = d.getFullYear() + 543
  return `${months[d.getMonth()]} พ.ศ. ${buddhistYear}`
})

// ── Tab config (simple — avoids SSR/CSR hydration mismatch from inline defineComponent) ──
const tabs = [
  { key: 'posts' as const, label: 'โพสต์' },
  { key: 'reposts' as const, label: 'รีโพสต์' },
  { key: 'media' as const, label: 'มีเดีย' },
  { key: 'liked' as const, label: 'ถูกใจ' },
]

const { publish, subscribe } = useRealtime()

// ── Fetch Profile Data ──
async function fetchProfile() {
  const currentUsername = username.value
  // Guard: prevent fetching if username is literally "undefined" or empty
  if (!currentUsername || currentUsername === 'undefined' || currentUsername === 'null') {
    profileError.value = true
    profileLoading.value = false
    return
  }
  profileLoading.value = true
  profileError.value = false
  // Clean reset to prevent banner / profile leakage from previously visited profiles
  profileData.value = null
  savedBannerPositionY.value = 50
  
  try {
    const data = await $fetch<any>(`/api/users/${currentUsername}`)
    profileData.value = data.user
    isFollowing.value = data.user?.is_following ?? false
    // Pre-fill edit form
    editForm.display_name = data.user.display_name || ''
    editForm.bio = data.user.bio || ''
    editForm.banner_url = data.user.banner_url || ''
    editForm.avatar_url = data.user.avatar_url || ''
  } catch {
    profileError.value = true
  } finally {
    profileLoading.value = false
  }
}

const isConfirmUnfollowOpen = ref(false)
const isFollowListOpen = ref(false)
const followListType = ref<'followers' | 'following'>('followers')

function openFollowList(type: 'followers' | 'following') {
  followListType.value = type
  isFollowListOpen.value = true
}

async function handleFollowClick() {
  if (!authUser.value) {
    openLoginModal('เข้าสู่ระบบเพื่อติดตามผู้ใช้นี้')
    return
  }
  if (isFollowing.value) {
    isConfirmUnfollowOpen.value = true
  } else {
    await executeToggleFollow()
  }
}

async function executeToggleFollow() {
  if (followLoading.value) return
  followLoading.value = true
  const prev = isFollowing.value
  isFollowing.value = !prev
  if (profileData.value) {
    profileData.value.follower_count = (profileData.value.follower_count || 0) + (prev ? -1 : 1)
  }
  try {
    const res = await $fetch<{ following: boolean }>(`/api/users/follow`, {
      method: 'POST',
      body: { username: username.value }
    })
    isFollowing.value = res.following
    
    if (res.following) {
      publish('new_follower', {
        source_username: authUser.value?.username,
        target_username: username.value
      })
    } else {
      toast.add({
        title: 'เลิกติดตามแล้ว',
        description: `คุณได้เลิกติดตาม @${username.value} เรียบร้อยแล้ว`,
        icon: 'i-heroicons-user-minus',
        color: 'gray'
      })
    }
  } catch (err: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err.data?.message || err.message || 'ไม่สามารถดำเนินการได้',
      icon: 'i-heroicons-exclamation-circle',
      color: 'red'
    })
    isFollowing.value = prev
    if (profileData.value) {
      profileData.value.follower_count = (profileData.value.follower_count || 0) + (prev ? 1 : -1)
    }
  } finally {
    followLoading.value = false
  }
}

// ── Fetch User Posts ──
async function fetchUserPosts() {
  const currentUsername = username.value
  if (!currentUsername || currentUsername === 'undefined' || currentUsername === 'null') return
  postsLoading.value = true
  userPosts.value = []
  try {
    const data = await $fetch<any>(`/api/posts/user/${currentUsername}`, { query: { type: 'posts' } })
    userPosts.value = data.posts || []
  } catch {
    userPosts.value = []
  } finally {
    postsLoading.value = false
  }
}

// ── Fetch Liked Posts ──
async function fetchLikedPosts() {
  const currentUsername = username.value
  if (!currentUsername || currentUsername === 'undefined' || currentUsername === 'null') return
  likedPostsLoading.value = true
  likedPosts.value = []
  try {
    const data = await $fetch<any>(`/api/posts/user/${currentUsername}`, { query: { type: 'liked' } })
    likedPosts.value = data.posts || []
  } catch {
    likedPosts.value = []
  } finally {
    likedPostsLoading.value = false
  }
}

// ── Fetch User Reposts ──
async function fetchUserReposts() {
  const currentUsername = username.value
  if (!currentUsername || currentUsername === 'undefined' || currentUsername === 'null') return
  repostsLoading.value = true
  userReposts.value = []
  try {
    const data = await $fetch<any>(`/api/posts/user/${currentUsername}`, { query: { type: 'reposts' } })
    userReposts.value = data.posts || []
  } catch {
    userReposts.value = []
  } finally {
    repostsLoading.value = false
  }
}

function handleDeletedPost(postId: number | string) {
  userPosts.value = userPosts.value.filter((p) => p.id !== postId)
  userReposts.value = userReposts.value.filter((p) => p.id !== postId)
}

// ── Save Profile ──
async function saveProfile() {
  editSaving.value = true
  try {
    const res = await $fetch<any>('/api/users/profile', {
      method: 'PUT',
      body: {
        display_name: editForm.display_name,
        bio: editForm.bio,
        banner_url: editForm.banner_url,
        avatar_url: editForm.avatar_url,
      },
    })
    if (res.user) {
      profileData.value = { ...profileData.value, ...res.user }
    }
    showEditModal.value = false
  } catch (err) {
    console.error('Save profile error:', err)
  } finally {
    editSaving.value = false
  }
}

// ── Logout ──
async function handleLogout() {
  await logout()
}

// ── Watch route changes (handles navigating between profiles without full reload) ──
watch(() => route.params.username, (newUsername) => {
  if (newUsername) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    fetchProfile()
    fetchUserPosts()
    if (activeTab.value === 'reposts') {
      fetchUserReposts()
    } else if (activeTab.value === 'liked') {
      fetchLikedPosts()
    }
  }
})

// ── Watch tab changes to fetch data ──
watch(activeTab, (tab) => {
  if (tab === 'reposts' && userReposts.value.length === 0) {
    fetchUserReposts()
  } else if (tab === 'liked' && likedPosts.value.length === 0) {
    fetchLikedPosts()
  }
})

let unsubscribeRealtime: (() => void) | null = null

// ── Init ──
onMounted(() => {
  fetchProfile()
  fetchUserPosts()
  
  unsubscribeRealtime = subscribe((event) => {
    // Live follower count
    if (event.type === 'new_follower' && event.payload?.target_username === username.value) {
      if (event.payload?.source_username !== authUser.value?.username) {
        if (profileData.value) {
          profileData.value.follower_count = (profileData.value.follower_count || 0) + 1
        }
      }
    }
    // Live unfollow
    if (event.type === 'unfollow' && event.payload?.target_username === username.value) {
      if (profileData.value) {
        profileData.value.follower_count = Math.max(0, (profileData.value.follower_count || 0) - 1)
      }
    }
    
    // Live new post in profile feed
    if (event.type === 'new_post' && event.payload?.source_username === username.value) {
      if (event.payload?.post) {
        const newPost = event.payload.post
        if (!userPosts.value.find(p => p.id === newPost.id)) {
          userPosts.value = [newPost, ...userPosts.value]
        }
      }
    }
    
    // Live post delete from profile
    if (event.type === 'post_deleted' && event.payload?.post_id) {
      userPosts.value = userPosts.value.filter(p => p.id !== event.payload.post_id)
    }
  })
})

onUnmounted(() => {
  onPointerDragEnd()
  if (unsubscribeRealtime) unsubscribeRealtime()
})
// ── Delete Account Logic ──
const showDeleteModal = ref(false)
const deleteStep = ref(1)
const deleteCode = ref('')
const inputDeleteCode = ref('')
const isDeletingAccount = ref(false)

function openDeleteAccountModal() {
  showSettings.value = false
  deleteCode.value = Math.random().toString(36).substring(2, 8).toUpperCase()
  inputDeleteCode.value = ''
  deleteStep.value = 1
  showDeleteModal.value = true
}

function confirmDeleteCode() {
  if (inputDeleteCode.value === deleteCode.value) {
    deleteStep.value = 2
  }
}

async function executeAccountDeletion() {
  if (isDeletingAccount.value) return
  isDeletingAccount.value = true
  try {
    const res = await $fetch('/api/auth/delete', { method: 'POST' })
    if (res.success) {
      showDeleteModal.value = false
      toast.add({
        title: 'ลบบัญชีสำเร็จ',
        description: 'ข้อมูลของคุณถูกลบออกจากระบบแล้ว กำลังกลับสู่หน้าล็อกอิน...',
        icon: 'i-heroicons-check-circle',
        color: 'green'
      })
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
  } catch (err: any) {
    toast.add({
      title: 'ลบบัญชีไม่สำเร็จ',
      description: err.data?.message || err.message || 'เกิดข้อผิดพลาด',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

<style scoped>
/* ── Container & Layout ── */
.profile-page-root {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.profile-container {
  width: 100%;
  max-width: 1160px;
  min-width: 0;
  padding: 20px 20px 80px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* ── State Cards (Loading / Error) ── */
.profile-state-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: var(--text-muted);
}

.profile-state-card .spinner {
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

.profile-state-card.error-card h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.profile-state-card.error-card p {
  font-size: 14px;
  margin: 0;
}

/* ── 1. Hero Profile Card ── */
.profile-hero-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  margin-bottom: 24px;
}

.profile-banner {
  height: 240px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.profile-banner.has-banner {
  cursor: zoom-in;
}

.banner-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.45) 100%);
  pointer-events: none;
}

.banner-camera-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
}

.banner-camera-btn:hover {
  background: var(--brand);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

/* ── Hero Body ── */
.profile-hero-body {
  padding: 0 32px 28px;
}

.avatar-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -55px;
  margin-bottom: 16px;
  gap: 16px;
}

/* ── Avatar Ring ── */
.hero-avatar-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  flex-shrink: 0;
  z-index: 6;
}

.hero-avatar-wrapper.clickable {
  cursor: zoom-in;
}

.avatar-ring-outer {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #7b6cf6 0%, #06b6d4 50%, #ec4899 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.avatar-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 3px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #5b46e0, #7b6cf6);
  user-select: none;
}

.online-indicator-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 3px solid var(--bg-card);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
  z-index: 7;
}

.avatar-camera-btn {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--brand);
  border: 2px solid var(--bg-card);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 8;
}

.avatar-camera-btn:hover {
  filter: brightness(1.1);
  transform: scale(1.1);
}

/* ── Hero Actions ── */
.hero-actions-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 6px;
}

.action-pill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 100px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.action-pill-btn.btn-brand {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.action-pill-btn.btn-brand:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.action-pill-btn.btn-outline {
  background: var(--bg-card);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

.action-pill-btn.btn-outline:hover {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  transform: translateY(-1px);
}

.action-pill-btn.btn-ghost {
  background: transparent;
  border-color: var(--border-primary);
  color: var(--text-muted);
}

.action-pill-btn.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.action-pill-btn.btn-ghost-danger {
  background: transparent;
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-pill-btn.btn-ghost-danger:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.4);
}

.action-pill-btn.btn-follow {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.action-pill-btn.btn-follow:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.action-pill-btn.btn-following {
  background: transparent;
  border-color: var(--brand);
  color: var(--brand);
}

.action-pill-btn.btn-following:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* ── Profile Info Details ── */
.name-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.hero-display-name {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.2;
}

.verified-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  border-radius: 100px;
  padding: 3px 10px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
}

.hero-username {
  font-size: 14.5px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 12px;
}

.hero-bio {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px;
  max-width: 720px;
  word-break: break-word;
}

.meta-and-stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-primary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.stats-pills-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-bubble {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  font-size: 13px;
  transition: all 0.2s ease;
}

.stat-bubble .stat-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--brand);
}

.stat-bubble .stat-lbl {
  color: var(--text-muted);
  font-weight: 500;
}

.stat-bubble.clickable {
  cursor: pointer;
}

.stat-bubble.clickable:hover {
  background: var(--brand-light);
  border-color: var(--brand);
  transform: translateY(-1px);
}

/* ── 2. Profile Body Layout (Stream + Sidebar) ── */
.profile-body-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.profile-stream-col {
  flex: 1;
  min-width: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.profile-tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(12px);
}

.stream-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.stream-tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.stream-tab-btn.active {
  color: var(--brand);
  font-weight: 700;
  border-bottom-color: var(--brand);
  background: var(--brand-light);
}

.stream-content {
  padding: 4px 0;
}

.stream-loading {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
  font-size: 14px;
}

.stream-empty {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.stream-empty h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.stream-empty p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 0;
}

.posts-list {
  display: flex;
  flex-direction: column;
}

.media-masonry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
}

.media-grid-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: zoom-in;
  background: var(--bg-tertiary);
}

.media-grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-grid-item:hover img {
  transform: scale(1.05);
}

/* ── 3. Right Sidebar Widgets ── */
.profile-side-col {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-widget-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 20px 22px;
  box-shadow: var(--card-shadow);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.widget-header .widget-icon {
  font-size: 18px;
}

.widget-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.achievements-badges-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
}

.badge-item:hover {
  background: var(--bg-hover);
  transform: translateX(2px);
}

.badge-item.admin-badge {
  background: var(--brand-light);
  border-color: var(--brand);
}

.badge-item.verified-badge {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.25);
}

.badge-emoji {
  font-size: 20px;
  flex-shrink: 0;
}

.badge-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.badge-desc {
  font-size: 11.5px;
  color: var(--text-muted);
}

.recent-media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.recent-media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-tertiary);
}

.recent-media-thumb-video,
.recent-media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}

.recent-media-item:hover .recent-media-thumb-video,
.recent-media-item:hover img {
  transform: scale(1.08);
}

.recent-media-video-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.media-grid-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.media-grid-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-grid-video-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* Lightbox Modal */
.media-lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modal-fade-in 0.2s ease;
}

.media-lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-lightbox-media {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  object-fit: contain;
}

.media-lightbox-close {
  position: absolute;
  top: -45px;
  right: 0;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.media-lightbox-close:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: scale(1.1);
}

/* ── Modals & Settings ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modal-fade-in 0.2s ease;
}

.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 32px;
  width: 92%;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  animation: modal-slide-up 0.3s ease;
}

@keyframes modal-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-slide-up {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.settings-section {
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: 18px;
  margin-bottom: 18px;
}

.settings-section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-primary);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-item-value {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.settings-item-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--border-secondary);
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: #7b6cf6;
}

.toggle-knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(20px);
}

/* ── Responsive Media Queries ── */
@media (max-width: 920px) {
  .profile-body-layout {
    flex-direction: column;
  }
  .profile-side-col {
    width: 100%;
    position: static;
  }
  .profile-banner {
    height: 200px;
  }
  .profile-hero-body {
    padding: 0 24px 24px;
  }
}

@media (max-width: 640px) {
  .profile-container {
    padding: 12px 10px 96px;
  }
  .profile-hero-card {
    border-radius: 18px;
  }
  .profile-banner {
    height: 150px;
  }
  .profile-hero-body {
    padding: 0 16px 20px;
  }
  .avatar-and-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-top: -45px;
  }
  .hero-avatar-wrapper {
    width: 90px;
    height: 90px;
  }
  .avatar-ring-outer {
    width: 90px;
    height: 90px;
    padding: 3px;
  }
  .hero-actions-wrapper {
    width: 100%;
    justify-content: flex-start;
  }
  .meta-and-stats-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .stats-pills-group {
    width: 100%;
  }
  .stat-bubble {
    flex: 1;
    justify-content: center;
  }
}
/* ── Quick Links (ทางลัดแนะนำ) ── */
.quick-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.quick-link-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-secondary);
  transform: translateX(3px);
}

.link-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.link-icon-box.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.link-icon-box.green {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.link-icon-box.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.link-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.link-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-desc {
  font-size: 11.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Cropper Modal & Controls ── */
.crop-preview-stage {
  position: relative;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

.btn-nudge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-nudge:hover {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.btn-nudge.reset {
  width: auto;
  padding: 0 10px;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-zoom-step {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-zoom-step:hover {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.crop-overlay-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #e2e8f0;
  font-size: 11.5px;
  padding: 4px 12px;
  border-radius: 100px;
  pointer-events: none;
  white-space: nowrap;
}

/* Suspended Account Profile Styles */
.suspended-banner {
  background: linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%) !important;
  opacity: 0.85;
}

.suspended-ring {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.1)) !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
}

.suspended-avatar-icon {
  background: var(--bg-card) !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suspended-account-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 99px;
  padding: 3px 10px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.suspended-notice-card {
  margin-top: 18px;
  background: var(--bg-card);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 18px;
  padding: 50px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
}

.suspended-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.suspended-notice-card h3 {
  font-size: 19px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.suspended-notice-card p {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 460px;
  line-height: 1.6;
  margin: 0;
}
</style>
