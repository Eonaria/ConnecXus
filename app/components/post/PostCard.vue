<template>
  <div
    class="post-card-root"
    :class="{ 'clickable': !disableClick, 'is-menu-open': menuOpen }"
    @click="!disableClick && goToPost()"
  >
    <!-- Avatar -->
    <div class="post-avatar-wrapper" @click.stop>
      <NuxtLink :to="`/profile/${post.author_username}`" class="post-avatar-link">
        <div
          class="post-avatar-circle"
          :style="post.author_avatar_url
            ? `background-image: url(${post.author_avatar_url});`
            : `background: ${post.avatarBg || 'linear-gradient(135deg, #6366f1, #8b5cf6)'};`
          "
        >
          <span v-if="!post.author_avatar_url">{{ post.authorInitials || 'ผ' }}</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Content -->
    <div class="post-body-content">
      <!-- Repost Indicator -->
      <div v-if="(post as any).reposted_by_name" class="post-reposted-indicator">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
        <span>{{ (post as any).reposted_by_name }} รีโพสต์แล้ว</span>
      </div>

      <!-- Comment Indicator -->
      <div v-if="(post as any).is_comment" class="post-comment-indicator">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>ความคิดเห็น / ตอบกลับ</span>
      </div>

      <!-- Header: name + time + 3-dot menu -->
      <div class="post-header-row">
        <div class="post-author-meta">
          <NuxtLink
            :to="`/profile/${post.author_username}`"
            class="post-author-name"
            @click.stop
          >
            {{ post.author_display_name }}
          </NuxtLink>
          <span class="post-author-handle">
            @{{ post.author_username }}
          </span>
          <span class="post-meta-dot">·</span>
          <ClientOnly>
            <span class="post-time-ago">
              {{ post.time_ago }}
            </span>
            <template #fallback>
              <span class="post-time-ago">...</span>
            </template>
          </ClientOnly>
          <!-- Visibility Badge -->
          <span class="post-meta-dot">·</span>
          <span class="post-visibility-indicator" :title="getVisibilityTitle(postVisibility)">
            <!-- 🌐 Public -->
            <svg v-if="!postVisibility || postVisibility === 'public'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <!-- 👥 Followers -->
            <svg v-else-if="postVisibility === 'followers'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <!-- 🤝 Mutual -->
            <svg v-else-if="postVisibility === 'mutual'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <!-- 🔒 Private -->
            <svg v-else-if="postVisibility === 'private'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
        </div>

        <!-- 3-dot Menu -->
        <div v-if="user" class="post-menu-container" @click.stop>
          <button
            @click="menuOpen = !menuOpen"
            class="btn-post-menu"
            title="ตัวเลือกเพิ่มเติม"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          
          <!-- Dropdown -->
          <div v-if="menuOpen" class="post-dropdown-menu">
            <!-- Visibility button (Author only) -->
            <button
              v-if="user && (post.author_id === user.id || post.author_username === user.username)"
              @click.stop="openVisibilityModal"
              class="post-dropdown-item"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>ความเป็นส่วนตัว</span>
            </button>

            <!-- Edit button -->
            <button
              v-if="canDelete"
              @click.stop="openEditModal"
              class="post-dropdown-item"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              แก้ไขโพสต์
            </button>

            <!-- Delete button -->
            <button
              v-if="canDelete"
              @click.stop="triggerDelete"
              :disabled="deleteLoading"
              class="post-dropdown-item text-danger"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              {{ deleteLoading ? 'กำลังลบ...' : 'ลบโพสต์' }}
            </button>

            <!-- Report button -->
            <button
              v-if="user && post.author_id !== user.id"
              @click.stop="openReportModal('post', post.id, post.community_id)"
              class="post-dropdown-item text-warning"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              รายงานโพสต์
            </button>
          </div>
        </div>
      </div>

      <!-- Community Tag -->
      <div v-if="post.community_name" class="post-community-tag">
        <span class="community-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:-1px; margin-right:4px;">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {{ post.community_name }}
        </span>
      </div>

      <!-- Post Content -->
      <div
        v-if="post.content"
        class="post-text-wrapper"
        :class="{ 'is-collapsed': isCollapsible && !isExpanded }"
      >
        <p class="post-text-content" ref="postTextRef">
          <FormattedText :text="post.content" />
        </p>

        <!-- Fade-out gradient & Show More button when collapsed -->
        <div v-if="isCollapsible && !isExpanded" class="post-expand-fade">
          <button @click.stop="toggleExpanded" class="btn-toggle-expand" title="กดเพื่อดูเนื้อหาเพิ่มเติม">
            <span>ดูเพิ่มเติม</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        <!-- Show Less button when expanded -->
        <div v-if="isCollapsible && isExpanded" class="post-collapse-action">
          <button @click.stop="toggleExpanded" class="btn-toggle-collapse" title="กดเพื่อย่อเนื้อหา">
            <span>ดูน้อยลง</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Post Multi-Media Gallery (Facebook Style 1, 2, 3, 4, 5+ with +N Overlay) -->
      <div
        v-if="mediaList.length > 0"
        class="post-media-gallery"
        :class="`gallery-count-${Math.min(mediaList.length, 4)}`"
      >
        <!-- 1 Item (Single Image/Video/GIF) -->
        <template v-if="mediaList.length === 1">
          <div
            class="gallery-item single-item"
            @click.stop="!isVideoItem(mediaList[0]) ? openImageLightbox(0) : null"
          >
            <video
              v-if="isVideoItem(mediaList[0])"
              :src="mediaList[0]"
              controls
              @click.stop
              class="post-media-element"
            ></video>
            <img
              v-else
              :src="mediaList[0]"
              alt="post attachment"
              class="post-media-element"
              loading="lazy"
            />
          </div>
        </template>

        <!-- 2 Items (Side-by-side) -->
        <template v-else-if="mediaList.length === 2">
          <div
            v-for="(url, idx) in mediaList"
            :key="idx"
            class="gallery-item grid-item-2"
            @click.stop="openImageLightbox(idx)"
          >
            <img :src="url" alt="post attachment" class="gallery-image" loading="lazy" />
          </div>
        </template>

        <!-- 3 Items (1 Main Left + 2 Stacked Right) -->
        <template v-else-if="mediaList.length === 3">
          <div
            class="gallery-item grid-item-3 main-item"
            @click.stop="openImageLightbox(0)"
          >
            <img :src="mediaList[0]" alt="post attachment" class="gallery-image" loading="lazy" />
          </div>
          <div class="grid-col-stacked">
            <div
              v-for="(url, idx) in mediaList.slice(1, 3)"
              :key="idx + 1"
              class="gallery-item grid-item-3 sub-item"
              @click.stop="openImageLightbox(idx + 1)"
            >
              <img :src="url" alt="post attachment" class="gallery-image" loading="lazy" />
            </div>
          </div>
        </template>

        <!-- 4 or 5+ Items (2x2 Grid with +N Overlay on the 4th item) -->
        <template v-else>
          <div
            v-for="(url, idx) in mediaList.slice(0, 4)"
            :key="idx"
            class="gallery-item grid-item-4"
            @click.stop="openImageLightbox(idx)"
          >
            <img :src="url" alt="post attachment" class="gallery-image" loading="lazy" />
            <!-- +N Overlay on 4th image when total > 4 -->
            <div
              v-if="idx === 3 && mediaList.length > 4"
              class="gallery-more-overlay"
            >
              <span class="more-count-text">+{{ mediaList.length - 4 }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- Action Bar -->
      <div class="post-action-bar">
        <!-- Comment -->
        <button
          @click.stop="openCommentModal"
          class="btn-action-pill comment-action"
          title="ตอบกลับ"
        >
          <div class="action-icon-circle">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span v-if="displayCommentCount > 0" class="action-count">{{ displayCommentCount }}</span>
        </button>

        <!-- Repost -->
        <button
          @click.stop="toggleRepost"
          :disabled="repostLoading"
          class="btn-action-pill repost-action"
          :class="{ 'is-active': isReposted }"
          title="รีโพสต์"
        >
          <div class="action-icon-circle">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </div>
          <span v-if="repostCount > 0" class="action-count">{{ repostCount }}</span>
        </button>

        <!-- Like -->
        <button
          @click.stop="toggleLike"
          :disabled="likeLoading"
          class="btn-action-pill like-action"
          :class="{ 'is-active': isLiked }"
          title="ถูกใจ"
        >
          <div class="action-icon-circle">
            <svg width="17" height="17" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span v-if="displayLikeCount > 0" class="action-count">{{ displayLikeCount }}</span>
        </button>

        <!-- Bookmark -->
        <button
          @click.stop="toggleBookmark"
          :disabled="bookmarkLoading"
          class="btn-action-pill bookmark-action"
          :class="{ 'is-active': isBookmarked }"
          title="บันทึก"
        >
          <div class="action-icon-circle">
            <svg width="17" height="17" viewBox="0 0 24 24" :fill="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- Visibility Modal -->
    <Teleport to="body" v-if="showVisibilityModal">
      <div
        class="visibility-modal-backdrop"
        @click.self="showVisibilityModal = false"
      >
        <div class="visibility-modal-card">
          <!-- Header -->
          <div class="visibility-modal-header">
            <div class="visibility-icon-halo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <h3 class="visibility-modal-title">ใครสามารถเห็นโพสต์นี้ได้บ้าง?</h3>
              <p class="visibility-modal-subtitle">กำหนดกลุ่มเป้าหมายและความเป็นส่วนตัวของโพสต์นี้</p>
            </div>
          </div>

          <!-- Options List -->
          <div class="visibility-options-grid">
            <!-- 1. Public -->
            <button
              type="button"
              class="visibility-option-btn"
              :class="{ 'is-selected': selectedVisibility === 'public' }"
              @click="selectedVisibility = 'public'"
            >
              <div class="vis-opt-icon public">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="vis-opt-content">
                <div class="vis-opt-label">
                  <span>สาธารณะ (Public)</span>
                  <span class="vis-opt-tag tag-green">ทุกคน</span>
                </div>
                <div class="vis-opt-desc">ทุกคนทั้งสมาชิกและผู้เยี่ยมชมทั่วไปสามารถเห็นโพสต์นี้ได้</div>
              </div>
              <div class="vis-opt-radio">
                <div class="radio-inner" v-if="selectedVisibility === 'public'"></div>
              </div>
            </button>

            <!-- 2. Followers -->
            <button
              type="button"
              class="visibility-option-btn"
              :class="{ 'is-selected': selectedVisibility === 'followers' }"
              @click="selectedVisibility = 'followers'"
            >
              <div class="vis-opt-icon followers">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="vis-opt-content">
                <div class="vis-opt-label">
                  <span>คนที่ติดตามฉัน</span>
                  <span class="vis-opt-tag tag-blue">ผู้ติดตาม</span>
                </div>
                <div class="vis-opt-desc">เฉพาะคนที่กดติดตามคุณจะมองเห็นโพสต์นี้ (แม้คุณไม่ได้ติดตามกลับ)</div>
              </div>
              <div class="vis-opt-radio">
                <div class="radio-inner" v-if="selectedVisibility === 'followers'"></div>
              </div>
            </button>

            <!-- 3. Mutual -->
            <button
              type="button"
              class="visibility-option-btn"
              :class="{ 'is-selected': selectedVisibility === 'mutual' }"
              @click="selectedVisibility = 'mutual'"
            >
              <div class="vis-opt-icon mutual">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="vis-opt-content">
                <div class="vis-opt-label">
                  <span>เพื่อนที่ติดตามกันสองคน</span>
                  <span class="vis-opt-tag tag-purple">Mutuals</span>
                </div>
                <div class="vis-opt-desc">เฉพาะเพื่อนที่คุณและเขาติดตามซึ่งกันและกันทั้งสองฝ่ายเท่านั้น</div>
              </div>
              <div class="vis-opt-radio">
                <div class="radio-inner" v-if="selectedVisibility === 'mutual'"></div>
              </div>
            </button>

            <!-- 4. Private -->
            <button
              type="button"
              class="visibility-option-btn"
              :class="{ 'is-selected': selectedVisibility === 'private' }"
              @click="selectedVisibility = 'private'"
            >
              <div class="vis-opt-icon private">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div class="vis-opt-content">
                <div class="vis-opt-label">
                  <span>ปิดเป็นส่วนตัว (Only Me)</span>
                  <span class="vis-opt-tag tag-red">เฉพาะฉัน</span>
                </div>
                <div class="vis-opt-desc">มีเพียงคุณคนเดียวเท่านั้นที่สามารถเห็นโพสต์นี้ได้</div>
              </div>
              <div class="vis-opt-radio">
                <div class="radio-inner" v-if="selectedVisibility === 'private'"></div>
              </div>
            </button>
          </div>

          <!-- Footer Actions -->
          <div class="visibility-modal-footer">
            <button
              type="button"
              class="btn-vis-cancel"
              @click="showVisibilityModal = false"
              :disabled="visibilityLoading"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn-vis-save"
              @click="saveVisibility(selectedVisibility)"
              :disabled="visibilityLoading"
            >
              <span v-if="!visibilityLoading">บันทึกการเปลี่ยนแปลง</span>
              <span v-else>กำลังบันทึก...</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Post Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        style="position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); padding: 16px;"
        @click.self="showDeleteModal = false"
      >
        <div
          :style="`
            background: var(--bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 32px;
            width: 100%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          `"
        >
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); color: #f87171; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </div>
          <h3 :style="`font-size: 22px; font-weight: 700; color: #f8fafc; margin: 0 0 12px;`">ต้องการลบโพสต์นี้ใช่หรือไม่?</h3>
          <p :style="`font-size: 15px; color: #94a3b8; margin: 0 0 28px; line-height: 1.5;`">
            หากคุณลบโพสต์นี้ ข้อมูลโพสต์และความคิดเห็นทั้งหมดจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button
              @click="showDeleteModal = false"
              :style="`
                flex: 1; background: transparent; border: none; border-radius: 100px;
                padding: 12px 20px; font-size: 15px; color: #94a3b8; cursor: pointer; font-family: inherit; font-weight: 600;
                transition: all 0.2s ease;
              `"
              @mouseenter="$event.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'"
              @mouseleave="$event.currentTarget.style.background = 'transparent'"
            >ยกเลิก</button>
            <button
              @click="deletePost"
              :disabled="deleteLoading"
              :style="`
                flex: 1; background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 100px;
                padding: 12px 20px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit;
                transition: all 0.2s ease;
                ${deleteLoading ? 'opacity: 0.5; cursor: not-allowed;' : ''}
              `"
              @mouseenter="!deleteLoading && ($event.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)', $event.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.2)')"
              @mouseleave="!deleteLoading && ($event.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)', $event.currentTarget.style.boxShadow = 'none')"
            >{{ deleteLoading ? 'กำลังลบล้าง...' : 'ลบทิ้งถาวร' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Image Lightbox Modal with Carousel Navigation -->
    <Teleport to="body">
      <div
        v-if="showImageModal"
        class="lightbox-overlay-backdrop"
        @click.self="showImageModal = false"
      >
        <div class="lightbox-container-box">
          <!-- Top Bar -->
          <div class="lightbox-header-bar">
            <!-- Counter Pill -->
            <div v-if="mediaList.length > 1" class="lightbox-counter-pill">
              {{ currentImageIndex + 1 }} / {{ mediaList.length }}
            </div>
            <div v-else></div>

            <div class="lightbox-actions-group">
              <button
                @click="downloadImage"
                class="btn-lightbox-icon"
                title="ดาวน์โหลดรูปนี้"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button
                @click="showImageModal = false"
                class="btn-lightbox-icon btn-close"
                title="ปิด"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="18" x2="18" y2="6"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Main Carousel Body -->
          <div class="lightbox-media-viewport">
            <!-- Prev Button -->
            <button
              v-if="mediaList.length > 1"
              @click.stop="prevImage"
              class="btn-lightbox-arrow prev-arrow"
              title="รูปก่อนหน้า (ลูกศรซ้าย)"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>

            <!-- Video or Image -->
            <video
              v-if="isVideoItem(currentImageUrl)"
              :src="currentImageUrl"
              controls
              autoplay
              class="lightbox-media-img"
            ></video>
            <img 
              v-else
              :src="currentImageUrl" 
              alt="Fullscreen Preview"
              class="lightbox-media-img" 
            />

            <!-- Next Button -->
            <button
              v-if="mediaList.length > 1"
              @click.stop="nextImage"
              class="btn-lightbox-arrow next-arrow"
              title="รูปถัดไป (ลูกศรขวา)"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Comment Modal -->
    <Teleport to="body">
      <div
        v-if="showCommentModal"
        style="position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); padding: 16px;"
        @click.self="showCommentModal = false"
      >
        <div
          :style="`
            background: var(--bg-card);
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 520px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          `"
        >
          <h3 :style="`font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 16px;`">ตอบกลับโพสต์</h3>
          
          <!-- Original post preview -->
          <div
            :style="`
              margin-bottom: 16px;
              border: 1px solid var(--border-primary);
              border-radius: 12px;
              padding: 12px;
              background: var(--bg-tertiary);
            `"
          >
            <div :style="`font-size: 13px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;`">
              {{ post.author_display_name }} <span :style="`color: var(--text-muted); font-weight: 400;`">@{{ post.author_username }}</span>
            </div>
            <p :style="`font-size: 14px; color: var(--text-secondary, var(--text-muted)); margin: 0; line-height: 1.4; white-space: pre-wrap; word-break: break-word;`">{{ post.content }}</p>
          </div>

          <textarea
            v-model="commentContent"
            placeholder="เพิ่มความคิดเห็นของคุณ..."
            :style="`
              width: 100%;
              min-height: 100px;
              border: 1px solid var(--border-primary);
              border-radius: 12px;
              padding: 12px;
              font-size: 15px;
              color: var(--text-primary);
              background: var(--bg-tertiary);
              font-family: inherit;
              resize: none;
              outline: none;
              box-sizing: border-box;
            `"
          />
          <div style="display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end;">
            <button
              @click="showCommentModal = false"
              :style="`
                background: none; border: 1px solid var(--border-primary); border-radius: 9999px;
                padding: 8px 18px; font-size: 14px; color: var(--text-muted); cursor: pointer; font-family: inherit;
              `"
            >ยกเลิก</button>
            <button
              @click="submitComment"
              :disabled="!commentContent.trim() || commentLoading"
              :style="`
                background: var(--brand); color: #fff; border: none; border-radius: 9999px;
                padding: 8px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
                ${!commentContent.trim() || commentLoading ? 'opacity: 0.5; cursor: not-allowed;' : ''}
              `"
            >{{ commentLoading ? 'กำลังตอบกลับ...' : 'ตอบกลับ' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Post Modal -->
    <Teleport to="body">
      <div
        v-if="showEditModal"
        style="position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); padding: 16px;"
        @click.self="showEditModal = false"
      >
        <div
          :style="`
            background: var(--bg-card);
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 520px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          `"
        >
          <h3 :style="`font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 16px;`">แก้ไขโพสต์</h3>
          
          <textarea
            v-model="editContent"
            placeholder="เนื้อหาโพสต์..."
            :style="`
              width: 100%;
              min-height: 120px;
              border: 1px solid var(--border-primary);
              border-radius: 12px;
              padding: 12px;
              font-size: 15px;
              color: var(--text-primary);
              background: var(--bg-tertiary);
              font-family: inherit;
              resize: none;
              outline: none;
              box-sizing: border-box;
            `"
          />
          <div style="display: flex; gap: 10px; margin-top: 16px; justify-content: flex-end;">
            <button
              @click="showEditModal = false"
              :style="`
                background: none; border: 1px solid var(--border-primary); border-radius: 9999px;
                padding: 8px 18px; font-size: 14px; color: var(--text-muted); cursor: pointer; font-family: inherit;
              `"
            >ยกเลิก</button>
            <button
              @click="saveEdit"
              :disabled="!editContent.trim() || editLoading"
              :style="`
                background: var(--brand); color: #fff; border: none; border-radius: 9999px;
                padding: 8px 22px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
                ${!editContent.trim() || editLoading ? 'opacity: 0.5; cursor: not-allowed;' : ''}
              `"
            >{{ editLoading ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { openImage } = useImageViewer()
import { useReportModal } from '~/composables/useReportModal'
import { useLoginModal } from '~/composables/useLoginModal'

const props = defineProps<{
  post: {
    id: number | string
    author_id?: number | string
    author_display_name: string
    author_username: string
    authorInitials?: string
    author_avatar_url?: string
    avatarBg?: string
    time_ago: string
    community_name?: string | null
    content: string
    image_url?: string | null
    like_count: number
    comment_count: number
    isLiked: boolean
    isBookmarked?: boolean
    visibility?: string
  }
  disableClick?: boolean
}>()

const emit = defineEmits(['deleted'])

const { user } = useAuth()
const toast = useToast()
const { openReportModal } = useReportModal()
const { openLoginModal } = useLoginModal()
const route = useRoute()
const router = useRouter()
const { publish, subscribe } = useRealtime()

// ── Expand / Collapse for Long Text (ดูเพิ่มเติม / ดูน้อยลง) ──
const isExpanded = ref(false)
const postTextRef = ref<HTMLElement | null>(null)
const isOverflowing = ref(false)

const isCollapsible = computed(() => {
  if (!props.post?.content) return false
  const content = props.post.content
  const lineCount = (content.match(/\n/g) || []).length + 1
  return lineCount > 6 || content.length > 350 || isOverflowing.value
})

function checkOverflow() {
  if (postTextRef.value && postTextRef.value.scrollHeight > 185) {
    isOverflowing.value = true
  }
}

onMounted(() => {
  checkOverflow()
})

watch(() => props.post?.content, () => {
  isExpanded.value = false
  nextTick(checkOverflow)
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

// ── Visibility State ──
const postVisibility = ref<string>((props.post as any).visibility || 'public')
watch(() => (props.post as any).visibility, (newV) => {
  if (newV) postVisibility.value = newV
})

const showVisibilityModal = ref(false)
const selectedVisibility = ref<string>(postVisibility.value)
const visibilityLoading = ref(false)

function openVisibilityModal() {
  menuOpen.value = false
  selectedVisibility.value = postVisibility.value
  showVisibilityModal.value = true
}

function getVisibilityTitle(v?: string) {
  switch (v) {
    case 'followers': return 'คนที่ติดตามฉัน'
    case 'mutual': return 'เพื่อนที่ติดตามกันสองคน'
    case 'private': return 'เฉพาะฉัน (ส่วนตัว)'
    default: return 'สาธารณะ'
  }
}

async function saveVisibility(newVis: string) {
  selectedVisibility.value = newVis
  visibilityLoading.value = true
  try {
    await $fetch(`/api/posts/${props.post.id}/visibility`, {
      method: 'PUT',
      body: { visibility: newVis }
    })
    postVisibility.value = newVis
    ;(props.post as any).visibility = newVis
    showVisibilityModal.value = false
    toast.add({
      title: 'อัปเดตความเป็นส่วนตัวแล้ว',
      description: `เปลี่ยนเป็น: ${getVisibilityTitle(newVis)}`,
      icon: 'i-heroicons-lock-closed',
      color: 'green'
    })
  } catch (err: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err.data?.message || 'ไม่สามารถอัปเดตความเป็นส่วนตัวได้',
      icon: 'i-heroicons-exclamation-circle',
      color: 'red'
    })
  } finally {
    visibilityLoading.value = false
  }
}

const isVideo = computed(() => {
  if (!props.post.image_url) return false
  const url = props.post.image_url.toLowerCase()
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
})

function goToPost() {
  const targetId = (props.post as any).parent_post_id || props.post.id
  router.push(`/post/${targetId}`)
}

const localCommentCount = ref(props.post.comment_count || 0)
const displayCommentCount = computed(() => localCommentCount.value)

onMounted(() => {
  const unsubscribe = subscribe((data) => {
    // Only update if it matches this post
    if (data.payload?.post_id === props.post.id) {
      if (data.type === 'like_post') {
        // Updated likeCount via props watch now
      } else if (data.type === 'new_comment') {
        localCommentCount.value++
      } else if (data.type === 'repost') {
        if (data.payload?.repost_count !== undefined) {
          repostCount.value = data.payload.repost_count
        } else if (Number(data.payload?.user_id) !== Number(user.value?.id)) {
          repostCount.value++
        }
      } else if (data.type === 'unrepost') {
        if (data.payload?.repost_count !== undefined) {
          repostCount.value = data.payload.repost_count
        } else if (Number(data.payload?.user_id) !== Number(user.value?.id)) {
          repostCount.value = Math.max(0, repostCount.value - 1)
        }
      } else if (data.type === 'post_visibility_updated') {
        postVisibility.value = data.payload.visibility
        ;(props.post as any).visibility = data.payload.visibility
      }
    }
  })

  const handleOutsideClick = () => {
    if (menuOpen.value) {
      menuOpen.value = false
    }
  }
  window.addEventListener('click', handleOutsideClick)

  onUnmounted(() => {
    unsubscribe()
    window.removeEventListener('click', handleOutsideClick)
  })
})

// Can the current user delete this post?
const canDelete = computed(() => {
  if (!user.value) return false
  return user.value.username === props.post.author_username || user.value.role === 'admin'
})

// ── Like ──
const isLiked = ref(props.post.isLiked)
const likeCount = ref(props.post.like_count)
watch(() => props.post.like_count, (newVal) => {
  likeCount.value = newVal
})

const likeLoading = ref(false)
const displayLikeCount = computed(() => likeCount.value)

async function toggleLike() {
  if (likeLoading.value) return
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อกดถูกใจ')
    return
  }
  
  likeLoading.value = true
  const wasLiked = isLiked.value
  isLiked.value = !wasLiked
  likeCount.value = Math.max(0, likeCount.value + (wasLiked ? -1 : 1))
  try {
    const isCmt = Boolean((props.post as any).is_comment)
    const endpoint = wasLiked
      ? (isCmt ? `/api/comments/${props.post.id}/unlike` : `/api/posts/${props.post.id}/unlike`)
      : (isCmt ? `/api/comments/${props.post.id}/like` : `/api/posts/${props.post.id}/like`)
    const res = await $fetch<any>(endpoint, { method: 'POST' })
    if (res?.like_count !== undefined) {
      likeCount.value = Number(res.like_count)
    }
  } catch {
    isLiked.value = wasLiked
    likeCount.value = Math.max(0, likeCount.value + (wasLiked ? 1 : -1))
  } finally {
    likeLoading.value = false
  }
}

// ── Bookmark ──
const isBookmarked = ref(props.post.isBookmarked ?? false)
const bookmarkLoading = ref(false)

async function toggleBookmark() {
  if (bookmarkLoading.value) return
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อบันทึกบุ๊กมาร์กไว้ดูภายหลัง')
    return
  }
  bookmarkLoading.value = true
  const prev = isBookmarked.value
  isBookmarked.value = !prev
  try {
    const isCmt = Boolean((props.post as any).is_comment)
    const endpoint = isCmt ? `/api/comments/${props.post.id}/bookmark` : `/api/posts/${props.post.id}/bookmark`
    const res = await $fetch<{ success: boolean; bookmarked: boolean }>(endpoint, { method: 'POST' })
    if (res?.bookmarked !== undefined) {
      isBookmarked.value = res.bookmarked
    }
  } catch {
    isBookmarked.value = prev
  } finally {
    bookmarkLoading.value = false
  }
}

// ── Repost ──
const isReposted = ref((props.post as any).isReposted ?? false)
const repostCount = ref((props.post as any).repost_count ?? 0)
const repostLoading = ref(false)

watch(() => (props.post as any).isReposted, (newVal) => {
  if (newVal !== undefined) isReposted.value = newVal
})

watch(() => (props.post as any).repost_count, (newVal) => {
  if (newVal !== undefined) repostCount.value = newVal
})

async function toggleRepost() {
  if (repostLoading.value) return
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบก่อนทำการรีโพสต์')
    return
  }
  repostLoading.value = true
  const wasReposted = isReposted.value
  isReposted.value = !wasReposted
  repostCount.value = Math.max(0, repostCount.value + (wasReposted ? -1 : 1))

  try {
    const isCmt = Boolean((props.post as any).is_comment)
    if (isCmt) {
      const endpoint = wasReposted ? `/api/comments/${props.post.id}/unrepost` : `/api/comments/${props.post.id}/repost`
      const res = await $fetch<any>(endpoint, { method: 'POST' })
      if (res?.repost_count !== undefined) {
        repostCount.value = Number(res.repost_count)
      }
    } else {
      if (wasReposted) {
        const res = await $fetch<any>(`/api/posts/${props.post.id}/unrepost`, { method: 'POST' })
        if (res?.repost_count !== undefined) {
          repostCount.value = Number(res.repost_count)
        }
      } else {
        const res = await $fetch<any>(`/api/posts/${props.post.id}/repost`, { method: 'POST', body: {} })
        if (res?.repost_count !== undefined) {
          repostCount.value = Number(res.repost_count)
        }
      }
    }
  } catch (err: any) {
    isReposted.value = wasReposted
    repostCount.value = Math.max(0, repostCount.value + (wasReposted ? 1 : -1))
    console.warn('[repost]', err?.data?.message || err)
  } finally {
    repostLoading.value = false
  }
}

// ── Delete ──
const menuOpen = ref(false)
const deleteLoading = ref(false)
const isDeleted = ref(false)
const showDeleteModal = ref(false)

function triggerDelete() {
  menuOpen.value = false
  showDeleteModal.value = true
}

async function deletePost() {
  if (deleteLoading.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/posts/${props.post.id}`, { method: 'DELETE' })
    showDeleteModal.value = false
    emit('deleted', props.post.id)
  } catch (err: any) {
    alert(err?.data?.message || 'ไม่สามารถลบโพสต์ได้')
  } finally {
    deleteLoading.value = false
  }
}

const mediaList = computed<string[]>(() => {
  if (!props.post.image_url) return []
  if (Array.isArray(props.post.image_url)) {
    return (props.post.image_url as any[]).filter(Boolean)
  }
  if (typeof props.post.image_url === 'string') {
    const trimmed = (props.post.image_url as string).trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch {}
    }
    return [trimmed]
  }
  return []
})

function isVideoItem(url?: string) {
  if (!url) return false
  const lower = url.toLowerCase()
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.startsWith('data:video/')
}

// ── Image Lightbox Modal ──
const showImageModal = ref(false)
const currentImageIndex = ref(0)
const currentImageUrl = computed(() => mediaList.value[currentImageIndex.value] || '')

function openImageLightbox(index: number) {
  currentImageIndex.value = Math.max(0, Math.min(index, mediaList.value.length - 1))
  showImageModal.value = true
}

function nextImage() {
  if (mediaList.value.length <= 1) return
  currentImageIndex.value = (currentImageIndex.value + 1) % mediaList.value.length
}

function prevImage() {
  if (mediaList.value.length <= 1) return
  currentImageIndex.value = (currentImageIndex.value - 1 + mediaList.value.length) % mediaList.value.length
}

function handleImageClick(url: string) {
  const foundIdx = mediaList.value.indexOf(url)
  openImageLightbox(foundIdx >= 0 ? foundIdx : 0)
}

async function downloadImage() {
  if (!currentImageUrl.value) return
  try {
    const response = await fetch(currentImageUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = currentImageUrl.value.split('/').pop()?.split('?')[0] || `image-${Date.now()}.jpg`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Download failed', err)
    window.open(currentImageUrl.value, '_blank')
  }
}

const showCommentModal = ref(false)
const commentContent = ref('')
const commentLoading = ref(false)

function openCommentModal() {
  if (!user.value) {
    openLoginModal('เข้าสู่ระบบเพื่อแสดงความคิดเห็น')
    return
  }
  commentContent.value = ''
  showCommentModal.value = true
}

async function submitComment() {
  if (!commentContent.value.trim() || commentLoading.value) return
  commentLoading.value = true
  try {
    await $fetch(`/api/posts/${props.post.id}/comments`, {
      method: 'POST',
      body: { content: commentContent.value.trim() },
    })
    showCommentModal.value = false
    commentContent.value = ''
    localCommentCount.value++
  } catch (err: any) {
    alert(err?.data?.message || 'ไม่สามารถตอบกลับได้')
  } finally {
    commentLoading.value = false
  }
}

const showEditModal = ref(false)
const editContent = ref('')
const editLoading = ref(false)

function openEditModal() {
  menuOpen.value = false
  editContent.value = props.post.content
  showEditModal.value = true
}

async function saveEdit() {
  if (!editContent.value.trim() || editLoading.value) return
  editLoading.value = true
  try {
    await $fetch(`/api/posts/${props.post.id}`, {
      method: 'PATCH',
      body: { content: editContent.value.trim() },
    })
    showEditModal.value = false
    props.post.content = editContent.value.trim()
  } catch (err: any) {
    alert(err?.data?.message || 'ไม่สามารถแก้ไขโพสต์ได้')
  } finally {
    editLoading.value = false
  }
}
</script>

<style scoped>
.post-card-root {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  gap: 14px;
  position: relative;
  z-index: 1;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-card-root.is-menu-open {
  z-index: 60;
}

.post-card-root.clickable {
  cursor: pointer;
}

.post-card-root:hover {
  background: var(--bg-hover);
}

/* Avatar */
.post-avatar-wrapper {
  flex-shrink: 0;
}

.post-avatar-link {
  text-decoration: none;
  display: block;
}

.post-avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
  color: #fff;
  border: 2px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.post-avatar-circle:hover {
  transform: scale(1.06);
  border-color: var(--brand);
}

/* Body Content */
.post-body-content {
  flex: 1;
  min-width: 0;
}

.post-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.post-author-meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.post-reposted-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.post-reposted-indicator svg {
  color: #10b981;
}

.post-comment-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
  padding: 2px 9px;
  border-radius: 99px;
  margin-bottom: 6px;
  width: fit-content;
}

.post-comment-indicator svg {
  color: #8b5cf6;
}

.post-author-name {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-primary);
  text-decoration: none;
  line-height: 1.2;
  transition: color 0.15s;
}

.post-author-name:hover {
  color: var(--brand);
}

.post-author-handle {
  font-size: 13.5px;
  color: var(--text-muted);
}

.post-meta-dot {
  font-size: 13.5px;
  color: var(--text-muted);
}

.post-time-ago {
  font-size: 13px;
  color: var(--text-muted);
}

/* 3-dot Menu */
.post-menu-container {
  position: relative;
  flex-shrink: 0;
  margin-left: 6px;
  z-index: 70;
}

.btn-post-menu {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}

.btn-post-menu:hover {
  background: var(--bg-hover);
  color: var(--brand);
}

.post-dropdown-menu {
  position: absolute;
  right: 0;
  top: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 9999;
  min-width: 175px;
  overflow: hidden;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  animation: fadeInDown 0.18s ease-out;
}

.post-dropdown-item {
  width: 100%;
  background: none;
  border: none;
  padding: 10px 14px;
  border-radius: 9px;
  text-align: left;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: inherit;
  transition: background 0.15s;
}

.post-dropdown-item:hover {
  background: var(--bg-hover);
}

.post-dropdown-item.text-danger {
  color: #ef4444;
}

.post-dropdown-item.text-danger:hover {
  background: rgba(239, 68, 68, 0.12);
}

.post-dropdown-item.text-warning {
  color: #f59e0b;
}

.post-dropdown-item.text-warning:hover {
  background: rgba(245, 158, 11, 0.12);
}

/* Community Tag */
.post-community-tag {
  margin-top: 4px;
}

.community-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: var(--brand-light);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  color: var(--brand);
}

/* Post Text Content Wrapper */
.post-text-wrapper {
  position: relative;
  margin-top: 8px;
}

.post-text-wrapper.is-collapsed {
  max-height: 168px;
  overflow: hidden;
}

.post-text-content {
  font-size: 15.5px;
  color: var(--text-primary);
  line-height: 1.55;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-weight: 400;
}

/* Gradient Fade for Collapsed Post */
.post-expand-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 68px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding-bottom: 2px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--bg-card) 85%);
  pointer-events: none;
}

.post-card-root:hover .post-expand-fade {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--bg-hover) 85%);
}

.btn-toggle-expand {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: var(--brand);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 99px;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2px;
}

.post-card-root:hover .btn-toggle-expand {
  background: var(--bg-secondary);
}

.btn-toggle-expand:hover {
  background: var(--brand) !important;
  color: #ffffff !important;
  border-color: var(--brand);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.btn-toggle-expand svg {
  transition: transform 0.2s ease;
}

.btn-toggle-expand:hover svg {
  transform: translateY(1px);
}

/* Show Less button when expanded */
.post-collapse-action {
  margin-top: 6px;
  display: flex;
  justify-content: flex-start;
}

.btn-toggle-collapse {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-toggle-collapse:hover {
  color: var(--brand);
  background: var(--brand-light);
}

.btn-toggle-collapse svg {
  transition: transform 0.2s ease;
}

.btn-toggle-collapse:hover svg {
  transform: translateY(-1px);
}

/* ══════════════════════════════════════════
   POST MEDIA GALLERY (Facebook Style 1, 2, 3, 4, 5+ with +N Overlay)
══════════════════════════════════════════ */
.post-media-gallery {
  margin-top: 12px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  box-shadow: var(--card-shadow);
  background: var(--bg-tertiary);
  display: grid;
  gap: 3px;
  transition: border-color 0.2s ease;
}

.post-media-gallery:hover {
  border-color: var(--brand);
}

/* 1 Item */
.post-media-gallery.gallery-count-1 {
  grid-template-columns: 1fr;
  max-height: 560px;
}

/* 2 Items */
.post-media-gallery.gallery-count-2 {
  grid-template-columns: 1fr 1fr;
  aspect-ratio: 16 / 9;
  max-height: 420px;
}

/* 3 Items */
.post-media-gallery.gallery-count-3 {
  grid-template-columns: 1.4fr 1fr;
  aspect-ratio: 16 / 9;
  max-height: 440px;
}

.grid-col-stacked {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 3px;
  height: 100%;
}

/* 4 or 5+ Items */
.post-media-gallery.gallery-count-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  aspect-ratio: 1 / 1;
  max-height: 500px;
}

.gallery-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-item:hover .gallery-image {
  transform: scale(1.03);
}

.post-media-gallery.gallery-count-1 .post-media-element {
  width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
  display: block;
}

/* +N Overlay */
.gallery-more-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.2s ease;
}

.gallery-item:hover .gallery-more-overlay {
  background: rgba(0, 0, 0, 0.75);
}

.more-count-text {
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

/* ══════════════════════════════════════════
   LIGHTBOX MODAL & CAROUSEL
══════════════════════════════════════════ */
.lightbox-overlay-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.lightbox-container-box {
  position: relative;
  width: 100%;
  max-width: 95vw;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-header-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}

.lightbox-counter-pill {
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 99px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.lightbox-actions-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-lightbox-icon {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-lightbox-icon:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.08);
}

.btn-lightbox-icon.btn-close:hover {
  background: rgba(239, 68, 68, 0.8);
}

.lightbox-media-viewport {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 82vh;
}

.lightbox-media-img {
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  user-select: none;
}

.btn-lightbox-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(20, 20, 30, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 5;
}

.btn-lightbox-arrow.prev-arrow {
  left: 14px;
}

.btn-lightbox-arrow.next-arrow {
  right: 14px;
}

.btn-lightbox-arrow:hover {
  background: rgba(99, 102, 241, 0.85);
  border-color: var(--brand);
  transform: translateY(-50%) scale(1.12);
}

/* Action Bar */
.post-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  max-width: 480px;
}

.btn-action-pill {
  background: transparent;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  padding: 2px 8px 2px 2px;
  border-radius: 9999px;
  transition: color 0.15s ease;
  user-select: none;
}

.action-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

.action-count {
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
  min-width: 12px;
}

/* Comment hover */
.comment-action:hover {
  color: #38bdf8;
}
.comment-action:hover .action-icon-circle {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  transform: scale(1.08);
}

/* Repost hover & active */
.repost-action:hover,
.repost-action.is-active {
  color: #10b981;
}
.repost-action:hover .action-icon-circle,
.repost-action.is-active .action-icon-circle {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  transform: scale(1.08);
}

/* Like hover & active */
.like-action:hover,
.like-action.is-active {
  color: #f43f5e;
}
.like-action:hover .action-icon-circle,
.like-action.is-active .action-icon-circle {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  transform: scale(1.08);
}

/* Bookmark hover & active */
.bookmark-action:hover,
.bookmark-action.is-active {
  color: #818cf8;
}
.bookmark-action:hover .action-icon-circle,
.bookmark-action.is-active .action-icon-circle {
  background: rgba(129, 140, 248, 0.15);
  color: #818cf8;
  transform: scale(1.08);
}

.action-count {
  font-size: 13px;
  font-weight: 600;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Post Header Visibility Badge ── */
.post-visibility-indicator {
  display: inline-flex;
  align-items: center;
  color: var(--text-muted);
  opacity: 0.8;
  cursor: default;
  transition: all 0.15s ease;
}

.post-visibility-indicator:hover {
  opacity: 1;
  color: var(--brand);
}

/* ── Visibility Modal (Cyberpunk Glass) ── */
.visibility-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.visibility-modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  padding: 28px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.visibility-modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.visibility-icon-halo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.visibility-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 3px 0;
}

.visibility-modal-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.visibility-options-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.visibility-option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border-radius: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.visibility-option-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
}

.visibility-option-btn.is-selected {
  background: rgba(99, 102, 241, 0.08);
  border-color: var(--brand);
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.12);
}

.vis-opt-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vis-opt-icon.public {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.vis-opt-icon.followers {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.vis-opt-icon.mutual {
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.vis-opt-icon.private {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.vis-opt-content {
  flex: 1;
  min-width: 0;
}

.vis-opt-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.vis-opt-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.tag-green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.tag-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.tag-purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.tag-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.vis-opt-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.vis-opt-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.visibility-option-btn.is-selected .vis-opt-radio {
  border-color: var(--brand);
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--brand);
}

.visibility-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-vis-cancel {
  background: transparent;
  border: 1px solid var(--border-primary);
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-vis-cancel:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-vis-save {
  background: var(--brand);
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
}

.btn-vis-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.btn-vis-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
