<template>
  <div class="messages-page-root">
    <!-- ══════════════════════════════════════════
         LEFT COLUMN: CHAT LIST
    ══════════════════════════════════════════ -->
    <div class="chat-list-col" :class="{ 'hidden-on-mobile': activeConversation }">
      <!-- List Header -->
      <div class="list-header-box">
        <div class="list-header-top">
          <h1 class="list-title">
            {{ showingArchived ? 'แชทที่จัดเก็บ' : 'ข้อความ' }}
          </h1>

          <div class="header-actions-group">
            <!-- Options Menu Trigger -->
            <button 
              @click.stop="showArchiveMenu = !showArchiveMenu" 
              class="btn-icon-glass"
              title="ตัวเลือกแชท"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
              </svg>
            </button>

            <!-- Create Group Button -->
            <button 
              @click="showCreateGroupModal = true; loadMutualFollowers()" 
              class="btn-icon-glass"
              title="สร้างกลุ่มใหม่"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>

            <!-- Archive Dropdown Menu -->
            <div v-if="showArchiveMenu" class="archive-dropdown-menu">
              <div 
                @click="showingArchived = !showingArchived; showArchiveMenu = false; fetchConversations()" 
                class="dropdown-item"
              >
                <svg v-if="!showingArchived" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>{{ showingArchived ? 'แชททั้งหมด' : 'จัดเก็บแชท' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-input-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาข้อความหรือเพื่อน..."
            class="chat-search-input"
          />
        </div>
      </div>

      <!-- Conversations Scroll List -->
      <div class="conversations-scroll-container">
        <div v-if="loadingConversations" class="chat-list-loading">
          <div class="spinner-small"></div>
          <span>กำลังโหลดข้อความ...</span>
        </div>

        <div v-else-if="filteredConversations.length === 0" class="chat-list-empty">
          <div class="empty-icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>ไม่มีข้อความ</h3>
          <p>ค้นหาเพื่อนหรือเริ่มบทสนทนาใหม่ได้เลย</p>
        </div>

        <div
          v-else
          v-for="chat in filteredConversations"
          :key="chat.id"
          @click="selectConversation(chat)"
          class="conversation-card"
          :class="{ active: activeConversation?.id === chat.id }"
          @mouseenter="hoveredChatId = chat.id"
          @mouseleave="hoveredChatId = null"
        >
          <!-- Avatar + Status -->
          <div class="conv-avatar-wrap">
            <img 
              v-if="chat.other_user?.avatar_url" 
              :src="chat.other_user.avatar_url" 
              alt="avatar" 
              @error="chat.other_user.avatar_url = null"
            />
            <div 
              v-else 
              class="conv-avatar-fallback" 
              :style="`background: linear-gradient(135deg, ${chat.theme_color && chat.theme_color.startsWith('#') ? chat.theme_color : '#6366f1'}, #8b5cf6);`"
            >
              {{ (chat.other_user?.display_name || chat.other_user?.username || '?').charAt(0).toUpperCase() }}
            </div>
            <!-- Online indicator -->
            <span v-if="isOnline(chat.other_user?.id)" class="online-indicator-dot"></span>
          </div>
          
          <!-- Info Details -->
          <div class="conv-info-col">
            <div class="conv-title-row">
              <div class="conv-name-wrap">
                <span class="conv-name">{{ chat.other_user?.display_name || chat.other_user?.username || 'Unknown' }}</span>
                <span v-if="chat.type === 'group'" class="conv-group-tag">กลุ่ม</span>
              </div>
              <span 
                v-if="chat.last_message?.created_at" 
                class="conv-time"
                :style="hoveredChatId === chat.id || activeChatMenuId === chat.id ? 'opacity: 0;' : 'opacity: 1;'"
              >
                {{ formatTimeShort(chat.last_message.created_at) }}
              </span>
            </div>
            
            <div class="conv-preview-row">
              <span v-if="chat.last_message?.audio_url" class="conv-snippet voice" style="display:inline-flex; align-items:center; gap:4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c-1.7 0-3 1.2-3 2.8v6.4c0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8V4.8C15 3.2 13.7 2 12 2z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
                <span>ส่งข้อความเสียง</span>
              </span>
              <span v-else-if="chat.last_message?.image_url" class="conv-snippet media" style="display:inline-flex; align-items:center; gap:4px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>รูปภาพ/สติกเกอร์</span>
              </span>
              <span v-else class="conv-snippet">{{ chat.last_message?.content || 'ไม่มีข้อความ' }}</span>

              <!-- Unread count badge -->
              <span v-if="chat.unread_count > 0 && !chat.is_muted" class="unread-pill-badge">
                {{ chat.unread_count }}
              </span>
              <span v-if="chat.is_muted" class="muted-icon" title="ปิดแจ้งเตือน">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </span>
            </div>
          </div>
          
          <!-- Context Menu Trigger -->
          <div v-show="hoveredChatId === chat.id || activeChatMenuId === chat.id" class="conv-options-anchor">
            <button @click.stop="openChatMenu(chat.id, $event)" class="btn-more-conv">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Conv Context Menu teleported to body to escape overflow:hidden clipping -->
    <Teleport to="body">
      <div
        v-if="activeChatMenuId !== null"
        class="conv-context-menu-fixed"
        :style="{ top: convMenuPosition.top + 'px', right: convMenuPosition.right + 'px' }"
        @click.stop
      >
        <template v-for="chat in conversations" :key="chat.id">
          <template v-if="chat.id === activeChatMenuId">
            <div @click="toggleChatMute(chat); activeChatMenuId = null" class="context-menu-item">
              <template v-if="!chat.is_muted">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span>ปิดแจ้งเตือน</span>
              </template>
              <template v-else>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <span>เปิดแจ้งเตือน</span>
              </template>
            </div>
            <div @click="openProfile(chat.other_user?.username); activeChatMenuId = null" class="context-menu-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>ดูโปรไฟล์</span>
            </div>
            <div @click="archiveChat(chat); activeChatMenuId = null" class="context-menu-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
              <span>{{ showingArchived ? 'เลิกจัดเก็บแชท' : 'จัดเก็บแชท' }}</span>
            </div>
            <div @click="openReportModal('user', chat.other_user?.id); activeChatMenuId = null" class="context-menu-item text-amber">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              <span>รายงานผู้ใช้</span>
            </div>
            <div @click="deleteChat(chat); activeChatMenuId = null" class="context-menu-item text-rose">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <span>ลบแชท</span>
            </div>
          </template>
        </template>
      </div>
      <!-- Backdrop click to close -->
      <div v-if="activeChatMenuId !== null" class="conv-menu-backdrop" @click="activeChatMenuId = null"></div>
    </Teleport>

    <!-- ══════════════════════════════════════════
         CENTER COLUMN: ACTIVE CHAT THREAD
    ══════════════════════════════════════════ -->
    <div class="chat-main-col" :class="{ 'hidden-on-mobile': !activeConversation }">
      
      <template v-if="activeConversation">
        <!-- Custom Soft Wallpaper Background -->
        <div 
          v-if="activeConversation.wallpaper_url" 
          class="chat-custom-wallpaper-bg"
          :style="`background-image: url('${activeConversation.wallpaper_url}');`"
        >
          <div class="wallpaper-soft-overlay"></div>
        </div>

        <!-- Top Chat Header -->
        <div class="active-chat-header">
          <!-- Normal View -->
          <div v-if="!showSearch" class="chat-header-inner">
            <button class="mobile-back-btn" @click="activeConversation = null; currentMessages = []" title="ย้อนกลับ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>

            <div class="header-avatar-box" @click="showInfoPanel = !showInfoPanel">
              <img 
                v-if="activeConversation.other_user?.avatar_url" 
                :src="activeConversation.other_user.avatar_url" 
                alt="avatar" 
                @error="activeConversation.other_user.avatar_url = null"
              />
              <div 
                v-else 
                class="header-avatar-fallback" 
                :style="`background: linear-gradient(135deg, ${currentThemeColor && currentThemeColor.startsWith('#') ? currentThemeColor : '#6366f1'}, #8b5cf6);`"
              >
                {{ (activeConversation.other_user?.display_name || activeConversation.other_user?.username || '?').charAt(0).toUpperCase() }}
              </div>
              <span v-if="isOnline(activeConversation.other_user?.id)" class="online-indicator-dot small"></span>
            </div>

            <div class="header-user-info" @click="showInfoPanel = !showInfoPanel">
              <div style="display: flex; align-items: center; gap: 7px;">
                <h2 class="header-user-name">
                  {{ activeConversation.other_user?.display_name || activeConversation.other_user?.username || 'Unknown' }}
                </h2>
                <span v-if="activeConversation.type === 'group'" class="conv-group-tag">กลุ่ม</span>
              </div>
              <div v-if="activeConversation.type !== 'group'" class="header-online-status">
                <span class="status-dot"></span>
                <span>ออนไลน์</span>
              </div>
              <div v-else class="header-online-status" style="color: var(--text-muted);">
                <span>แชทกลุ่ม</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="header-controls">
              <button 
                @click="showSearch = !showSearch" 
                class="btn-icon-glass"
                title="ค้นหาข้อความในแชท"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>

              <button 
                @click="showInfoPanel = !showInfoPanel" 
                class="btn-icon-glass"
                :class="{ active: showInfoPanel }"
                title="ข้อมูลการสนทนา"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Search In Thread View -->
          <div v-else class="chat-search-in-thread">
            <button @click="showSearch = false; messageSearchQuery = ''" class="btn-icon-glass" title="ปิดการค้นหา">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div class="search-input-wrap flex-1">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="messageSearchQuery"
                type="text"
                placeholder="ค้นหาข้อความในแชทนี้..."
                class="chat-search-input"
              />
            </div>
          </div>
        </div>
        
        <!-- Pinned Messages Banner -->
        <div 
          v-if="pinnedMessages.length > 0" 
          @click="scrollToMessage(pinnedMessages[pinnedMessages.length - 1].id)" 
          class="pinned-messages-strip"
        >
          <div class="pinned-icon-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
          </div>
          <div class="pinned-text">
            <strong>ข้อความที่ปักหมุด:</strong>
            <span>{{ pinnedMessages[pinnedMessages.length - 1].content || 'รูปภาพ/มีเดีย' }}</span>
          </div>
        </div>

        <!-- Chat Messages Scroll Container -->
        <div class="messages-stream-area" ref="messagesContainer">
          
          <div v-if="loadingMessages" class="messages-loading-state">
            <div class="spinner-small"></div>
            <span>กำลังโหลดข้อความ...</span>
          </div>
          
          <template v-else>
            <!-- Message Row -->
            <div
              v-for="(msg, msgIdx) in filteredMessages"
              :key="msg.id"
              :id="'message-' + msg.id"
              class="message-row-wrapper"
              :class="{ 
                'is-mine': msg.is_mine,
                'cluster-tight': !shouldShowTime(msg, msgIdx, filteredMessages),
                'is-emoji-only': isOnlyEmoji(msg.content),
                'has-open-menu': activeMenuId === msg.id
              }"
            >
              <!-- Group Sender Label -->
              <NuxtLink 
                v-if="!msg.is_mine && activeConversation.type === 'group'" 
                :to="msg.sender?.username ? `/profile/${msg.sender.username}` : '#'" 
                class="group-sender-name"
                @click.stop
              >
                {{ msg.sender?.display_name || msg.sender?.username }}
              </NuxtLink>

              <div 
                :id="'msg-' + msg.id" 
                class="message-bubble-row"
                :class="{ 
                  'is-mine': msg.is_mine,
                  'is-emoji-only': isOnlyEmoji(msg.content),
                  'has-open-menu': activeMenuId === msg.id,
                  [getClusterClass(msg, msgIdx, filteredMessages)]: true
                }"
                @mouseenter="hoveredMessageId = msg.id"
                @mouseleave="hoveredMessageId = null"
              >
                
                <!-- Quick Message Action Menu Trigger (always in flow, shown via CSS opacity) -->
                <div class="msg-action-container" :class="{ 'has-open-menu': activeMenuId === msg.id }">
                  <button @click.stop="toggleMenu(msg.id, $event)" class="btn-msg-options" title="ตัวเลือกเพิ่มเติม">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/>
                    </svg>
                  </button>
                  
                  <!-- Dropdown Menu (Smart Upward/Downward Popover) -->
                  <div v-if="activeMenuId === msg.id" class="msg-dropdown-menu" :class="{ 'is-mine': msg.is_mine, 'open-upward': menuOpenUpward }">
                    <button v-if="msg.is_mine" @click.stop.prevent="startEdit(msg)" class="msg-menu-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      <span>แก้ไข</span>
                    </button>
                    <button v-if="msg.is_mine" @click.stop.prevent="unsendMessage(msg)" class="msg-menu-btn text-rose">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      <span>ยกเลิกการส่ง</span>
                    </button>
                    <button @click.stop.prevent="openForwardModal(msg)" class="msg-menu-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
                      <span>ส่งต่อ</span>
                    </button>
                    <button @click.stop.prevent="togglePin(msg)" class="msg-menu-btn">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                      <span>{{ msg.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด' }}</span>
                    </button>
                    <button v-if="!msg.is_mine" @click.stop.prevent="reportMessage(msg)" class="msg-menu-btn text-amber">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      <span>รายงาน</span>
                    </button>
                  </div>
                </div>

                <!-- Avatar for other user (Shown on cluster end) -->
                <NuxtLink 
                  v-if="!msg.is_mine && shouldShowAvatar(msg, msgIdx, filteredMessages)" 
                  :to="msg.sender?.username ? `/profile/${msg.sender.username}` : '#'" 
                  class="msg-user-avatar"
                  @click.stop
                >
                  <img 
                    v-if="msg.sender?.avatar_url" 
                    :src="msg.sender.avatar_url" 
                    alt="avatar" 
                    @error="msg.sender.avatar_url = null"
                  />
                  <div 
                    v-else 
                    class="msg-avatar-fallback" 
                    :style="`background: linear-gradient(135deg, ${currentThemeColor && currentThemeColor.startsWith('#') ? currentThemeColor : '#6366f1'}, #8b5cf6);`"
                  >
                    {{ (msg.sender?.display_name || msg.sender?.username || '?').charAt(0).toUpperCase() }}
                  </div>
                </NuxtLink>
                <!-- Avatar spacer for intermediate messages -->
                <div v-else-if="!msg.is_mine" class="msg-avatar-spacer" aria-hidden="true"></div>

                <!-- Bubble Content -->
                <div
                  @click="handleSearchClick(msg.id)"
                  class="message-bubble-card"
                  :class="{ 
                    'is-mine': msg.is_mine,
                    'is-media': msg.image_url,
                    'is-deleted': msg.is_deleted,
                    'is-emoji-only': isOnlyEmoji(msg.content)
                  }"
                  :style="msg.is_mine && !msg.image_url && !isOnlyEmoji(msg.content) ? { background: `linear-gradient(135deg, ${currentThemeColor}, #6366f1)` } : {}"
                >
                  <!-- Multi-image Grid -->
                  <div v-if="msg.image_url" class="msg-images-grid" :class="{ multi: parseImages(msg.image_url).length > 1 }">
                    <img 
                      v-for="(imgUrl, idx) in parseImages(msg.image_url)" 
                      :key="idx" 
                      :src="imgUrl" 
                      @click.stop="viewingImage = { ...msg, current_image_index: idx }" 
                      class="msg-attached-img"
                    />
                  </div>

                  <!-- Audio Player -->
                  <audio v-if="msg.audio_url" controls :src="msg.audio_url" class="msg-audio-player"></audio>

                  <!-- Text Content -->
                  <span 
                    v-if="msg.content && !messageSearchQuery" 
                    class="msg-text-span"
                    :class="{ 'emoji-big': isOnlyEmoji(msg.content) }"
                  >{{ msg.content }}</span>
                  <span v-else-if="msg.content && messageSearchQuery" class="msg-text-span" v-html="msg.content.replace(new RegExp('(' + messageSearchQuery + ')', 'gi'), '<mark class=\'search-highlight\'>$1</mark>')"></span>
                </div>
              </div>
              
              <!-- Message Meta Time & Receipt -->
              <div 
                v-if="shouldShowTime(msg, msgIdx, filteredMessages) || hoveredMessageId === msg.id" 
                class="message-meta-row" 
                :class="{ 'is-mine': msg.is_mine }"
              >
                <span v-if="msg.is_edited" class="edited-tag">(แก้ไขแล้ว)</span>
                <span class="meta-time">{{ formatTimeShort(msg.created_at) }}</span>
                <span v-if="msg.is_mine && msg.id === lastReadMessageId" class="read-receipt-tag">✓✓ อ่านแล้ว</span>
              </div>
            </div>
          </template>

        </div>

        <!-- Typing Live Indicator -->
        <div v-if="partnerIsTyping" class="typing-indicator-bar">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
          <span class="typing-label">กำลังพิมพ์ข้อความ...</span>
        </div>

        <!-- ══════════════════════════════════════════
             CHAT INPUT COMPOSER DOCK
        ══════════════════════════════════════════ -->
        <div class="chat-input-composer-card">
          <!-- Blocked States -->
          <div v-if="isBlockedByThem" class="input-notice-banner error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            <span>คุณถูกผู้ใช้นี้บล็อค ไม่สามารถส่งข้อความได้</span>
          </div>

          <div v-else-if="!isMutualFollow" class="input-notice-banner warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>คุณต้องติดตามกันและกันจึงจะสามารถส่งข้อความได้</span>
          </div>

          <div v-else-if="isBlocked" class="input-notice-banner error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            <span>คุณบล็อคผู้ใช้นี้แล้ว ไม่สามารถส่งข้อความได้</span>
          </div>

          <!-- Normal Composer Bar -->
          <div v-else class="composer-action-strip">
            
            <!-- Left Action Icons (Mic, Gallery, Sticker, GIF) -->
            <div v-if="!isRecording" class="composer-media-toolbar">
              <!-- Voice Record Button -->
              <button 
                @click="startRecording" 
                class="btn-composer-icon" 
                :style="`color: ${currentThemeColor};`"
                title="ส่งข้อความเสียง"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2c-1.7 0-3 1.2-3 2.8v6.4c0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8V4.8C15 3.2 13.7 2 12 2z"/>
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
              </button>

              <!-- Upload Image Button -->
              <label 
                class="btn-composer-icon" 
                :style="`color: ${currentThemeColor};`"
                title="ส่งรูปภาพ"
              >
                <input type="file" accept="image/*" multiple style="display: none;" @change="handleImageUpload" :disabled="sending">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </label>

              <!-- Sticker Button -->
              <button 
                @click="showStickerPicker = !showStickerPicker; showGifPicker = false" 
                class="btn-composer-icon" 
                :style="`color: ${currentThemeColor};`"
                title="สติกเกอร์"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </button>

              <!-- GIF Button -->
              <button 
                @click="showGifPicker = !showGifPicker; showStickerPicker = false" 
                class="btn-composer-icon gif-label" 
                :style="`color: ${currentThemeColor};`"
                title="ส่ง GIF"
              >
                GIF
              </button>
            </div>
            
            <!-- Voice Recording Active Bar -->
            <div v-else class="recording-active-strip">
              <div class="rec-live-box">
                <span class="rec-red-pulse"></span>
                <span class="rec-timer">{{ recordingTimeFormatted }}</span>
                <span class="rec-text">กำลังบันทึกเสียง...</span>
              </div>
              <div class="rec-buttons-row">
                <button @click="cancelRecording" class="btn-rec-cancel">ยกเลิก</button>
                <button @click="stopRecordingAndSend" class="btn-rec-send">ส่ง</button>
              </div>
            </div>
            
            <!-- Sticker Picker Popover -->
            <div v-if="showStickerPicker" class="popover-panel sticker-panel">
              <div class="stickers-grid">
                <button v-for="(sticker, i) in mockStickers" :key="i" @click="sendMedia(sticker)" class="btn-sticker-item">
                  <img :src="sticker" alt="sticker" />
                </button>
              </div>
            </div>

            <!-- GIF Picker Popover -->
            <div v-if="showGifPicker" class="popover-panel gif-panel">
              <div class="gif-search-box">
                <input v-model="gifQuery" @input="searchGifs" type="text" placeholder="ค้นหา GIF ดุ๊กดิ๊ก..." class="gif-input" />
              </div>
              <div class="gifs-grid">
                <div v-if="loadingGifs" class="gif-loading">กำลังโหลด...</div>
                <img v-else v-for="gif in (gifResults.length ? gifResults : ALL_GIFS)" :key="gif" :src="gif" @click="sendMedia(gif)" class="gif-item" />
              </div>
            </div>

            <!-- Text Input Area (Flex 1, never squeezed) -->
            <div v-if="!isRecording" class="composer-input-field-wrap">
              <div v-if="editingMessage" class="editing-banner">
                <span>กำลังแก้ไขข้อความ</span>
                <button @click="editingMessage = null; newMessage = ''" class="btn-cancel-edit">ยกเลิก</button>
              </div>
              
              <div class="textarea-relative-box">
                <textarea
                  v-model="newMessage"
                  placeholder="พิมพ์ข้อความ..."
                  rows="1"
                  class="chat-main-textarea"
                  @keydown.enter.prevent="sendMessage"
                  @input="handleTypingInput"
                ></textarea>
                
                <!-- Emoji toggle button inside input -->
                <button 
                  @click="showEmojiPicker = !showEmojiPicker" 
                  class="btn-emoji-inside"
                  title="ใส่อีโมจิ"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </button>

                <!-- Common Emoji Popover -->
                <div v-if="showEmojiPicker" class="popover-panel emoji-panel">
                  <button v-for="emoji in commonEmojis" :key="emoji" @click="insertEmoji(emoji)" class="btn-emoji-item">
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Send Button or Quick Emoji Button -->
            <button
              v-if="newMessage.trim() && !isRecording"
              @click="sendMessage"
              :disabled="sending"
              class="btn-send-message"
              :style="`background: ${currentThemeColor};`"
              title="ส่งข้อความ"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>

            <button
              v-else-if="!isRecording"
              @click="sendQuickEmoji"
              :disabled="sending"
              class="btn-quick-emoji"
              title="ส่งอีโมจิด่วน"
            >
              {{ activeConversation.quick_emoji || '👍' }}
            </button>
          </div>
        </div>
      </template>

      <!-- Empty State Screen when no conversation is selected -->
      <div v-else class="chat-welcome-empty-stage">
        <div class="welcome-orb glow-1"></div>
        <div class="welcome-orb glow-2"></div>
        
        <div class="welcome-icon-box">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        </div>
        <h2 class="welcome-title">ยินดีต้อนรับสู่กล่องข้อความ</h2>
        <p class="welcome-desc">เลือกการสนทนาจากรายการทางด้านซ้าย หรือเริ่มแชทใหม่กับเพื่อนของคุณ</p>
      </div>
      
    </div>

    <!-- ══════════════════════════════════════════
         RIGHT COLUMN: CHAT INFO / SIDEBAR PANEL
    ══════════════════════════════════════════ -->
    <div v-if="activeConversation && showInfoPanel" class="chat-info-col">
      <!-- Mobile Close Button for Info Panel -->
      <button 
        class="info-close-btn"
        @click="showInfoPanel = false"
        title="ปิดแถบข้อมูล"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>

      <!-- Profile Header Hero Card in Sidebar -->
      <div class="sidebar-hero-section">
        <div class="sidebar-avatar-glow-wrap">
          <img 
            v-if="activeConversation.other_user?.avatar_url" 
            :src="activeConversation.other_user.avatar_url" 
            alt="avatar" 
            class="sidebar-avatar-img" 
            @error="activeConversation.other_user.avatar_url = null"
          />
          <div 
            v-else 
            class="sidebar-avatar-fallback" 
            :style="`background: linear-gradient(135deg, ${currentThemeColor && currentThemeColor.startsWith('#') ? currentThemeColor : '#6366f1'}, #8b5cf6);`"
          >
            {{ (activeConversation.other_user?.display_name || activeConversation.other_user?.username || '?').charAt(0).toUpperCase() }}
          </div>
          <span v-if="isOnline(activeConversation.other_user?.id)" class="online-indicator-dot large"></span>
        </div>

        <h3 class="sidebar-user-name">
          {{ activeConversation.other_user?.display_name || activeConversation.other_user?.username }}
        </h3>
        <p class="sidebar-user-handle">
          @{{ activeConversation.other_user?.username || 'user' }}
        </p>
        <div class="sidebar-status-chip">
          <span class="status-dot"></span>
          <span>กำลังใช้งาน</span>
        </div>
        
        <!-- Action Buttons Row -->
        <div class="sidebar-quick-actions">
          <NuxtLink 
            v-if="activeConversation.type !== 'group'" 
            :to="`/profile/${activeConversation.other_user?.username}`" 
            class="quick-action-item"
          >
            <div class="quick-action-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span>โปรไฟล์</span>
          </NuxtLink>

          <button @click="toggleMute" class="quick-action-item">
            <div class="quick-action-icon" :class="{ muted: isMuted }">
              <svg v-if="!isMuted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/></svg>
            </div>
            <span>{{ isMuted ? 'เปิดแจ้งเตือน' : 'ปิดแจ้งเตือน' }}</span>
          </button>

          <button @click="showSearch = !showSearch" class="quick-action-item">
            <div class="quick-action-icon" :class="{ active: showSearch }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <span>ค้นหา</span>
          </button>
        </div>
      </div>

      <!-- Accordion Menus -->
      <div style="padding: 12px;">
        <!-- Chat Info -->
        <div style="margin-bottom: 8px;">
          <button @click="infoSections.info = !infoSections.info" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; padding: 12px 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; font-weight: 700;">
            ข้อความที่ปักหมุด
            <svg :style="`transform: rotate(${infoSections.info ? '180deg' : '0'}); transition: 0.2s;`" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="infoSections.info" style="padding: 0 8px 12px; display: flex; flex-direction: column; gap: 8px;">
            <div v-if="pinnedMessages.length === 0" style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 12px 0;">ไม่มีข้อความที่ปักหมุด</div>
            <div v-else v-for="msg in pinnedMessages" :key="'pin-'+msg.id" @click="scrollToMessage(msg.id)" style="padding: 12px; background: var(--bg-tertiary); border-radius: 12px; cursor: pointer; transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = 'var(--border-primary)'" @mouseleave="$event.currentTarget.style.background = 'var(--bg-tertiary)'">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img v-if="msg.sender?.avatar_url" :src="msg.sender.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" @error="msg.sender.avatar_url = null" />
                  <span v-else style="font-size: 11px; font-weight: 700; color: #ffffff;">{{ (msg.sender?.display_name || msg.sender?.username || '?').charAt(0).toUpperCase() }}</span>
                </div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary);">{{ msg.sender?.display_name || msg.sender?.username }}</div>
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); word-break: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                {{ msg.content || (msg.audio_url ? 'ข้อความเสียง' : (msg.image_url ? 'รูปภาพ/GIF' : 'ข้อความ')) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Customize Chat -->
        <div v-if="!isBlocked && !isBlockedByThem" style="margin-bottom: 8px;">
          <button @click="infoSections.customize = !infoSections.customize" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; padding: 12px 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; font-weight: 700;">
            ปรับแต่งแชท
            <svg :style="`transform: rotate(${infoSections.customize ? '180deg' : '0'}); transition: 0.2s;`" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="infoSections.customize" style="padding: 0 8px 12px; display: flex; flex-direction: column; gap: 6px;">
             <!-- Theme Color -->
             <div @click="showThemeModal = true" class="customize-option-item">
               <div :style="`width: 18px; height: 18px; border-radius: 50%; background: ${currentThemeColor}; box-shadow: 0 0 8px ${currentThemeColor}66;`"></div>
               <span>เปลี่ยนสีธีม</span>
             </div>

             <!-- Wallpaper Upload -->
             <label class="customize-option-item" style="cursor: pointer;">
               <input type="file" accept="image/*" style="display: none;" @change="handleWallpaperUpload">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
               <span>{{ activeConversation.wallpaper_url ? 'เปลี่ยนรูปพื้นหลัง' : 'ตั้งค่ารูปพื้นหลัง' }}</span>
             </label>

             <!-- Remove Wallpaper -->
             <div v-if="activeConversation.wallpaper_url" @click="removeWallpaper" class="customize-option-item text-rose">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
               <span>ลบรูปพื้นหลัง</span>
             </div>

             <!-- Quick Emoji -->
             <div @click="showEmojiSelectModal = true" class="customize-option-item">
               <span style="font-size: 18px;">{{ activeConversation.quick_emoji || '👍' }}</span>
               <span>เปลี่ยนอีโมจิเริ่มต้น</span>
             </div>
          </div>
        </div>

        <!-- Media -->
        <div style="margin-bottom: 8px;">
          <button @click="infoSections.media = !infoSections.media" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; padding: 12px 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; font-weight: 700;">
            สื่อและไฟล์
            <svg :style="`transform: rotate(${infoSections.media ? '180deg' : '0'}); transition: 0.2s;`" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="infoSections.media" style="padding: 0 8px 12px;">
             <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
               <div v-for="(img, idx) in currentMessages.filter(m => m.image_url).flatMap(m => parseImages(m.image_url).map(u => ({ url: u, msg: m }))).reverse().slice(0, 6)" :key="idx" style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #222;">
    <img :src="img.url" @click.stop="viewingImage = { ...img.msg, current_image_index: parseImages(img.msg.image_url).indexOf(img.url) }" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" />
 </div>
             </div>
          </div>
        </div>

        <!-- Privacy (direct only) -->
        <div v-if="activeConversation.type !== 'group'" style="margin-bottom: 8px;">
          <button @click="infoSections.privacy = !infoSections.privacy" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; padding: 12px 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; font-weight: 700;">
            ความเป็นส่วนตัว
            <svg :style="`transform: rotate(${infoSections.privacy ? '180deg' : '0'}); transition: 0.2s;`" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div v-if="infoSections.privacy" style="padding: 0 8px 12px; display: flex; flex-direction: column; gap: 8px;">
             <div @click="toggleBlock" style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #ef4444; cursor: pointer; padding: 8px; border-radius: 8px;" @mouseenter="$event.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">
               <div style="width: 16px; display: flex; justify-content: center;">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
               </div>
               {{ isBlocked ? 'เลิกบล็อคผู้ใช้' : 'บล็อคผู้ใช้' }}
             </div>
             <div @click="openReportModal('user', activeConversation?.other_user?.id)" style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #eab308; cursor: pointer; padding: 8px; border-radius: 8px;" @mouseenter="$event.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">
               <div style="width: 16px; display: flex; justify-content: center;">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
               </div>
               รายงานผู้ใช้
             </div>
          </div>
        </div>

        <!-- ═══ GROUP SECTIONS ═══ -->
        <template v-if="activeConversation.type === 'group'">

          <!-- Edit Group Name/Avatar (owner/admin only) -->
          <div v-if="['owner', 'admin'].includes(activeConversation.my_role)" style="margin-bottom: 8px; padding: 0 8px;">
            <button @click="showEditGroupModal = true" style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-tertiary); border: none; border-radius: 10px; cursor: pointer; color: var(--text-primary); font-size: 14px; font-weight: 600;" @mouseenter="$event.currentTarget.style.background = 'var(--border-primary)'" @mouseleave="$event.currentTarget.style.background = 'var(--bg-tertiary)'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              แก้ไขชื่อกลุ่ม / รูปปก
            </button>
          </div>

          <!-- Members Section -->
          <div style="margin-bottom: 8px;">
            <button @click="infoSections.members = !infoSections.members; if(infoSections.members) fetchGroupMembers()" style="width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; padding: 12px 8px; cursor: pointer; color: var(--text-primary); font-size: 14px; font-weight: 700;">
              สมาชิกกลุ่ม ({{ groupMembers.length || '...' }})
              <svg :style="`transform: rotate(${infoSections.members ? '180deg' : '0'}); transition: 0.2s;`" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div v-if="infoSections.members" style="padding: 0 8px 12px; display: flex; flex-direction: column; gap: 6px;">
              <!-- Add member button -->
              <button @click="showAddMemberModal = true; loadMutualFollowersForAdd()" style="width: 100%; display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: rgba(123,108,246,0.1); border: 1px dashed rgba(123,108,246,0.4); border-radius: 10px; cursor: pointer; color: var(--brand); font-size: 13px; font-weight: 600; margin-bottom: 4px;" @mouseenter="$event.currentTarget.style.background = 'rgba(123,108,246,0.2)'" @mouseleave="$event.currentTarget.style.background = 'rgba(123,108,246,0.1)'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                เพิ่มสมาชิก
              </button>
              <!-- Member list -->
              <div v-for="member in groupMembers" :key="member.user_id" style="display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 10px; position: relative;" @mouseenter="hoveredMemberId = member.user_id" @mouseleave="hoveredMemberId = null">
                <NuxtLink :to="member.username ? `/profile/${member.username}` : '#'" style="display: flex; flex: 1; align-items: center; gap: 10px; text-decoration: none;">
                  <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #6366f1, #8b5cf6); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    <img v-if="member.avatar_url" :src="member.avatar_url" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.2s;" @error="member.avatar_url = null" @mouseenter="$event.currentTarget.style.opacity = '0.8'" @mouseleave="$event.currentTarget.style.opacity = '1'" />
                    <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; transition: opacity 0.2s;" @mouseenter="$event.currentTarget.style.opacity = '0.8'" @mouseleave="$event.currentTarget.style.opacity = '1'">{{ (member.display_name || member.username || '?').charAt(0).toUpperCase() }}</div>
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s;" @mouseenter="$event.currentTarget.style.color = 'var(--brand)'" @mouseleave="$event.currentTarget.style.color = 'var(--text-primary)'">{{ member.display_name || member.username }}</div>
                    <div :style="`font-size: 11px; font-weight: 600; color: ${member.role === 'owner' ? '#f59e0b' : member.role === 'admin' ? '#7b6cf6' : 'var(--text-muted)'};`">{{ member.role === 'owner' ? 'เจ้าของ' : member.role === 'admin' ? 'แอดมิน' : 'สมาชิก' }}</div>
                  </div>
                </NuxtLink>
                <!-- 3-dot menu for owner -->
                <div v-if="activeConversation.my_role === 'owner' && member.role !== 'owner'" style="position: relative;">
                  <button @click.stop="memberMenuOpenId = memberMenuOpenId === member.user_id ? null : member.user_id" style="background: none; border: none; color: var(--text-muted); cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;" @mouseenter="$event.currentTarget.style.background = 'var(--bg-tertiary)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                  </button>
                  <div v-if="memberMenuOpenId === member.user_id" style="position: absolute; right: 0; top: 32px; background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: 10px; padding: 6px; width: 160px; z-index: 50; box-shadow: 0 8px 24px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 2px;">
                    <button v-if="member.role === 'member'" @click="setMemberRole(member.user_id, 'admin'); memberMenuOpenId = null" style="background: transparent; border: none; padding: 8px 12px; border-radius: 8px; text-align: left; font-size: 13px; font-weight: 600; color: #7b6cf6; cursor: pointer; font-family: inherit;" @mouseenter="$event.currentTarget.style.background = 'rgba(123,108,246,0.1)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">แต่งตั้งเป็นแอดมิน</button>
                    <button v-if="member.role === 'admin'" @click="setMemberRole(member.user_id, 'member'); memberMenuOpenId = null" style="background: transparent; border: none; padding: 8px 12px; border-radius: 8px; text-align: left; font-size: 13px; font-weight: 600; color: var(--text-primary); cursor: pointer; font-family: inherit;" @mouseenter="$event.currentTarget.style.background = 'var(--bg-tertiary)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">ถอดถอนแอดมิน</button>
                    <button @click="kickMember(member.user_id); memberMenuOpenId = null" style="background: transparent; border: none; padding: 8px 12px; border-radius: 8px; text-align: left; font-size: 13px; font-weight: 600; color: #ef4444; cursor: pointer; font-family: inherit;" @mouseenter="$event.currentTarget.style.background = 'rgba(239,68,68,0.1)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">เตะออกกลุ่ม</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Leave / Delete Group -->
          <div style="padding: 8px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border-primary); margin-top: 8px;">
            <button v-if="activeConversation.my_role !== 'owner'" @click="leaveGroup" style="width: 100%; padding: 10px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; color: #ef4444; font-size: 14px; font-weight: 700; cursor: pointer;" @mouseenter="$event.currentTarget.style.background = 'rgba(239,68,68,0.15)'" @mouseleave="$event.currentTarget.style.background = 'rgba(239,68,68,0.08)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: middle;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              ออกจากกลุ่ม
            </button>
            <button v-if="activeConversation.my_role === 'owner'" @click="deleteGroup" style="width: 100%; padding: 10px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; color: #ef4444; font-size: 14px; font-weight: 700; cursor: pointer;" @mouseenter="$event.currentTarget.style.background = 'rgba(239,68,68,0.15)'" @mouseleave="$event.currentTarget.style.background = 'rgba(239,68,68,0.08)'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              ลบกลุ่ม
            </button>
          </div>
        </template>

      </div>
    </div>


    <!-- Forward Modal -->

    <Teleport to="body">
      <div v-if="showForwardModal" style="position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;" @click.self="showForwardModal = false">
        <div style="background: var(--bg-card); width: 100%; max-width: 400px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; max-height: 80vh; box-shadow: 0 24px 48px rgba(0,0,0,0.3);">
          <div style="padding: 20px; border-bottom: 1px solid var(--border-primary); display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 16px; font-weight: 800; color: var(--text-primary);">ส่งต่อให้...</div>
            <button @click="showForwardModal = false" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style="overflow-y: auto; flex: 1;">
            <div v-if="conversations.length === 0" style="padding: 30px; text-align: center; color: var(--text-muted);">ไม่มีรายการแชท</div>
            <div v-else v-for="chat in conversations" :key="chat.id" @click="forwardTo(chat)" style="padding: 16px 20px; display: flex; align-items: center; gap: 14px; cursor: pointer; border-bottom: 1px solid var(--border-primary); transition: background 0.2s;" @mouseenter="$event.currentTarget.style.background = 'var(--bg-tertiary)'" @mouseleave="$event.currentTarget.style.background = 'transparent'">
               <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img v-if="chat.other_user?.avatar_url" :src="chat.other_user.avatar_url" style="width:100%;height:100%;object-fit:cover;" @error="chat.other_user.avatar_url = null" />
                  <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff;">
                    {{ (chat.other_user?.display_name || chat.other_user?.username || '?').charAt(0).toUpperCase() }}
                  </div>
               </div>
               <div style="color: var(--text-primary); font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                 <span>{{ chat.other_user?.display_name || chat.other_user?.username }}</span>
                 <span v-if="chat.type === 'group'" class="conv-group-tag">กลุ่ม</span>
               </div>
               <div style="margin-left: auto; width: 32px; height: 32px; border-radius: 50%; background: rgba(123, 108, 246, 0.1); color: var(--brand); display: flex; align-items: center; justify-content: center;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Unsend Confirmation Modal -->
    <Teleport to="body">
      <div v-if="confirmUnsendMsg" style="position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease-out;" @click.self="confirmUnsendMsg = null">
        <div style="background: var(--bg-card); width: 100%; max-width: 320px; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.3); padding: 24px; text-align: center; border: 1px solid var(--border-primary);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px;">ยกเลิกการส่งข้อความ?</h3>
          <p style="font-size: 14px; color: var(--text-secondary); margin: 0 0 24px;">ข้อความนี้จะถูกลบออกจากแชทของทุกคน และไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?</p>
          <div style="display: flex; gap: 12px;">
            <button @click="confirmUnsendMsg = null" style="flex: 1; padding: 12px; border-radius: 12px; background: var(--bg-tertiary); border: none; color: var(--text-primary); font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = 'var(--border-primary)'" @mouseleave="$event.currentTarget.style.background = 'var(--bg-tertiary)'">ยกเลิก</button>
            <button @click="executeUnsend" style="flex: 1; padding: 12px; border-radius: 12px; background: #ef4444; border: none; color: var(--text-primary); font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = '#dc2626'; $event.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'" @mouseleave="$event.currentTarget.style.background = '#ef4444'; $event.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'">ลบข้อความ</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Report Modal -->
    <Teleport to="body">
      <div v-if="reportMsgItem" style="position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease-out;" @click.self="reportMsgItem = null">
        <div style="background: var(--bg-card); width: 100%; max-width: 360px; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.3); padding: 24px; text-align: center; border: 1px solid var(--border-primary);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(234, 179, 8, 0.1); color: #eab308; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px;">รายงานข้อความ</h3>
          <p style="font-size: 14px; color: var(--text-secondary); margin: 0 0 20px;">โปรดระบุเหตุผลที่คุณต้องการรายงานข้อความนี้</p>
          
          <input v-model="reportReason" type="text" placeholder="ระบุเหตุผล..." style="width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border-primary); background: var(--bg-tertiary); color: var(--text-primary); margin-bottom: 24px; font-size: 15px; outline: none; box-sizing: border-box;" @keyup.enter="executeReport" />
          
          <div style="display: flex; gap: 12px;">
            <button @click="reportMsgItem = null" style="flex: 1; padding: 12px; border-radius: 12px; background: var(--bg-tertiary); border: none; color: var(--text-primary); font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = 'var(--border-primary)'" @mouseleave="$event.currentTarget.style.background = 'var(--bg-tertiary)'">ยกเลิก</button>
            <button @click="executeReport" :disabled="!reportReason.trim()" style="flex: 1; padding: 12px; border-radius: 12px; background: #eab308; border: none; color: var(--text-primary); font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); transition: 0.2s;" :style="{ opacity: reportReason.trim() ? '1' : '0.5' }" @mouseenter="if(reportReason.trim()) { $event.currentTarget.style.background = '#ca8a04'; $event.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 179, 8, 0.4)' }" @mouseleave="if(reportReason.trim()) { $event.currentTarget.style.background = '#eab308'; $event.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.3)' }">รายงาน</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Theme Selection Modal -->
    <Teleport to="body">
      <div v-if="showThemeModal" style="position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;" @click.self="showThemeModal = false">
        <div style="background: var(--bg-card); width: 100%; max-width: 320px; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.3); padding: 24px;">
          <h3 style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin: 0 0 16px; text-align: center;">เลือกสีธีมแชท</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            <button v-for="color in themeColors" :key="color" @click="updateSettings({ theme_color: color }); showThemeModal = false" :style="`width: 48px; height: 48px; border-radius: 50%; background: ${color}; border: 3px solid ${activeConversation?.theme_color === color ? '#fff' : 'transparent'}; cursor: pointer; transition: 0.2s; margin: 0 auto;`"></button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Emoji Selection Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEmojiSelectModal" style="position: fixed; inset: 0; z-index: 1000; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;" @click.self="showEmojiSelectModal = false">
          <div style="background: var(--bg-card); width: 100%; max-width: 340px; border-radius: 28px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); padding: 32px 24px; border: 1px solid rgba(255,255,255,0.05); position: relative; animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
            
            <!-- Glow Effect -->
            <div style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 200px; height: 100px; background: var(--brand); filter: blur(60px); opacity: 0.3; border-radius: 50%; pointer-events: none;"></div>

            <div style="position: relative; z-index: 1;">
              <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px; text-align: center; letter-spacing: -0.5px;">เลือกอีโมจิเริ่มต้น</h3>
              <p style="font-size: 13px; color: rgba(255,255,255,0.6); text-align: center; margin: 0 0 24px;">อีโมจินี้จะแสดงอยู่ข้างปุ่มส่งข้อความ</p>
              
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                <button v-for="emoji in quickEmojis" :key="emoji" @click="updateSettings({ quick_emoji: emoji }); showEmojiSelectModal = false" :style="`font-size: 28px; background: ${activeConversation?.quick_emoji === emoji ? 'rgba(123, 108, 246, 0.2)' : 'transparent'}; border: ${activeConversation?.quick_emoji === emoji ? '1px solid rgba(123, 108, 246, 0.5)' : '1px solid transparent'}; cursor: pointer; padding: 10px 0; border-radius: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);`" @mouseenter="$event.currentTarget.style.transform = 'scale(1.2) translateY(-4px)'; $event.currentTarget.style.background = 'rgba(255,255,255,0.05)'" @mouseleave="$event.currentTarget.style.transform = 'scale(1) translateY(0)'; $event.currentTarget.style.background = activeConversation?.quick_emoji === emoji ? 'rgba(123, 108, 246, 0.2)' : 'transparent'">
                  <span style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">{{ emoji }}</span>
                </button>
              </div>
            </div>
            
            <button @click="showEmojiSelectModal = false" style="width: 100%; margin-top: 24px; padding: 14px; border-radius: 16px; border: none; background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.1)'" @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.05)'">
              ยกเลิก
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
    </div>

  <Teleport to="body">
    <!-- Delete Confirmation Modal -->
    <div v-if="chatToDelete" style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 24px;">
      <div style="background: var(--bg-card); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 360px; padding: 24px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); text-align: center;">
        <div style="width: 56px; height: 56px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </div>
        <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: var(--text-primary);">ลบแชทนี้หรือไม่?</h3>
        <p style="margin: 0 0 24px; color: var(--text-secondary); font-size: 15px; line-height: 1.5;">
          ข้อความทั้งหมดในแชทนี้จะถูกลบออก คุณจะไม่สามารถเรียกคืนได้จนกว่าจะมีการส่งข้อความใหม่
        </p>
        <div style="display: flex; gap: 12px;">
          <button @click="chatToDelete = null" style="flex: 1; padding: 12px; background: var(--bg-tertiary); color: var(--text-primary); border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;" @mouseenter="$event.currentTarget.style.background = 'var(--border-primary)'" @mouseleave="$event.currentTarget.style.background = 'var(--bg-tertiary)'">ยกเลิก</button>
          <button @click="confirmDelete" style="flex: 1; padding: 12px; background: #ef4444; color: var(--text-primary); border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;" @mouseenter="$event.currentTarget.style.background = '#dc2626'" @mouseleave="$event.currentTarget.style.background = '#ef4444'">ลบแชท</button>
        </div>
      </div>
    </div>
    <!-- Toast Notification -->
  <Transition name="fade">
    <div v-if="toastMessage" style="position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 10000; padding: 12px 24px; border-radius: 99px; display: flex; align-items: center; gap: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); font-size: 14px; font-weight: 600; color: var(--text-primary); transition: all 0.3s;" :style="{ background: toastMessage.type === 'success' ? '#10b981' : '#ef4444' }">
      <svg v-if="toastMessage.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      {{ toastMessage.text }}
    </div>
  </Transition>

  <!-- Image Lightbox Modal -->
  <div v-if="viewingImage" style="position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center;" @click.self="viewingImage = null">
    <button @click="viewingImage = null" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; width: 40px; height: 40px; border-radius: 50%; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.2)'" @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.1)'">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>

    <!-- Prev Button -->
    <button v-if="parseImages(viewingImage.image_url).length > 1" 
            @click.stop="viewingImage.current_image_index = ((viewingImage.current_image_index || 0) - 1 + parseImages(viewingImage.image_url).length) % parseImages(viewingImage.image_url).length"
            style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; width: 48px; height: 48px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;" 
            @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.2)'" 
            @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.1)'">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>

    <!-- Next Button -->
    <button v-if="parseImages(viewingImage.image_url).length > 1" 
            @click.stop="viewingImage.current_image_index = ((viewingImage.current_image_index || 0) + 1) % parseImages(viewingImage.image_url).length"
            style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; width: 48px; height: 48px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;" 
            @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.2)'" 
            @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.1)'">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    
    <img :src="parseImages(viewingImage.image_url)[viewingImage.current_image_index || 0]" style="max-width: 90vw; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);" />
    
    <div style="display: flex; gap: 16px; margin-top: 24px;">
      <button @click="downloadImage(parseImages(viewingImage.image_url)[viewingImage.current_image_index || 0])" style="background: rgba(255,255,255,0.1); color: var(--text-primary); border: 1px solid rgba(255,255,255,0.2); padding: 10px 24px; border-radius: 99px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.2s;" @mouseenter="$event.currentTarget.style.background = 'rgba(255,255,255,0.2)'" @mouseleave="$event.currentTarget.style.background = 'rgba(255,255,255,0.1)'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        โหลดภาพ
      </button>
      <button @click="openForwardModal({ ...viewingImage, image_url: parseImages(viewingImage.image_url)[viewingImage.current_image_index || 0] }); viewingImage = null" style="background: var(--brand); color: var(--text-primary); border: none; padding: 10px 24px; border-radius: 99px; cursor: pointer; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.2s;" @mouseenter="$event.currentTarget.style.filter = 'brightness(1.1)'" @mouseleave="$event.currentTarget.style.filter = 'none'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        ส่งต่อภาพ
      </button>
    </div>
  </div>
  </Teleport>

  <!-- ═══════════════════════════════════════
       CREATE GROUP MODAL
  ═══════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="showCreateGroupModal" style="position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px;" @click.self="showCreateGroupModal = false">
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); width: 100%; max-width: 460px; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.4); display: flex; flex-direction: column; max-height: 85vh;">
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-primary); display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">สร้างกลุ่ม</h2>
          <button @click="showCreateGroupModal = false" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 50%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Group Cover -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <label style="cursor: pointer;">
              <input type="file" accept="image/*" style="display:none;" @change="handleGroupAvatarUpload">
              <div style="width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: var(--brand); display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.3); flex-shrink: 0;">
                <img v-if="newGroupAvatarUrl" :src="newGroupAvatarUrl" style="width: 100%; height: 100%; object-fit: cover;" />
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
            </label>
            <div style="flex: 1;">
              <input v-model="newGroupName" type="text" placeholder="ชื่อกลุ่ม *" style="width: 100%; padding: 12px 14px; border-radius: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-primary); color: var(--text-primary); font-size: 15px; font-weight: 600; outline: none; box-sizing: border-box;" @focus="$event.currentTarget.style.borderColor = 'var(--brand)'" @blur="$event.currentTarget.style.borderColor = 'var(--border-primary)'" />
            </div>
          </div>
          <!-- People to invite -->
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">เลือกสมาชิก (จากคนที่ติดตามกัน)</div>
            <div v-if="loadingMutualFollowers" style="text-align: center; padding: 20px; color: var(--text-muted);">กำลังโหลด...</div>
            <div v-else-if="mutualFollowers.length === 0" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">ไม่พบคนที่ติดตามกัน</div>
            <div v-else style="display: flex; flex-direction: column; gap: 4px;">
              <div v-for="f in mutualFollowers" :key="f.id" @click="toggleSelectMember(f.id)" :style="`display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; cursor: pointer; transition: 0.15s; background: ${selectedMemberIds.includes(f.id) ? 'rgba(123,108,246,0.12)' : 'transparent'}; border: 1px solid ${selectedMemberIds.includes(f.id) ? 'rgba(123,108,246,0.4)' : 'transparent'};`" @mouseenter="!selectedMemberIds.includes(f.id) && ($event.currentTarget.style.background = 'var(--bg-tertiary)')" @mouseleave="!selectedMemberIds.includes(f.id) && ($event.currentTarget.style.background = 'transparent')">
                <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #6366f1, #8b5cf6); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                  <img v-if="f.avatar_url" :src="f.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" @error="f.avatar_url = null" />
                  <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #fff;">{{ (f.display_name || f.username || '?').charAt(0).toUpperCase() }}</div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">{{ f.display_name || f.username }}</div>
                  <div style="font-size: 12px; color: var(--text-muted);">@{{ f.username }}</div>
                </div>
                <div :style="`width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${selectedMemberIds.includes(f.id) ? 'var(--brand)' : 'var(--border-primary)'}; background: ${selectedMemberIds.includes(f.id) ? 'var(--brand)' : 'transparent'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`">
                  <svg v-if="selectedMemberIds.includes(f.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="padding: 16px 24px; border-top: 1px solid var(--border-primary);">
          <button @click="createGroup" :disabled="!newGroupName.trim() || selectedMemberIds.length === 0 || creatingGroup" :style="`width: 100%; padding: 14px; border-radius: 14px; border: none; background: ${newGroupName.trim() && selectedMemberIds.length > 0 ? 'var(--brand)' : 'var(--bg-tertiary)'}; color: ${newGroupName.trim() && selectedMemberIds.length > 0 ? '#fff' : 'var(--text-muted)'}; font-size: 15px; font-weight: 800; cursor: ${newGroupName.trim() && selectedMemberIds.length > 0 ? 'pointer' : 'not-allowed'};`">
            {{ creatingGroup ? 'กำลังสร้าง...' : `สร้างกลุ่ม (${selectedMemberIds.length} คน)` }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Edit Group Modal -->
  <Teleport to="body">
    <div v-if="showEditGroupModal" style="position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px;" @click.self="showEditGroupModal = false">
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); width: 100%; max-width: 400px; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.4);">
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-primary); display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">แก้ไขกลุ่ม</h2>
          <button @click="showEditGroupModal = false" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 50%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <label style="cursor: pointer;">
              <input type="file" accept="image/*" style="display:none;" @change="handleEditGroupAvatarUpload">
              <div style="width: 64px; height: 64px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; border: 2px dashed rgba(255,255,255,0.3); flex-shrink: 0;">
                <img v-if="editGroupAvatarUrl || activeConversation?.other_user?.avatar_url" :src="editGroupAvatarUrl || activeConversation?.other_user?.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" @error="editGroupAvatarUrl = ''" />
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
            </label>
            <div style="flex: 1;">
              <input v-model="editGroupName" type="text" placeholder="ชื่อกลุ่ม" style="width: 100%; padding: 12px 14px; border-radius: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-primary); color: var(--text-primary); font-size: 15px; font-weight: 600; outline: none; box-sizing: border-box;" @focus="$event.currentTarget.style.borderColor = 'var(--brand)'" @blur="$event.currentTarget.style.borderColor = 'var(--border-primary)'" />
            </div>
          </div>
          <button @click="saveGroupEdit" :disabled="!editGroupName.trim()" style="width: 100%; padding: 14px; border-radius: 14px; border: none; background: var(--brand); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer;">บันทึก</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Add Member Modal -->
  <Teleport to="body">
    <div v-if="showAddMemberModal" style="position: fixed; inset: 0; z-index: 9000; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px;" @click.self="showAddMemberModal = false">
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); width: 100%; max-width: 400px; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.4); max-height: 80vh; display: flex; flex-direction: column;">
        <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-primary); display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--text-primary);">เพิ่มสมาชิก</h2>
          <button @click="showAddMemberModal = false" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 50%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 16px 20px;">
          <div v-if="loadingMutualFollowers" style="text-align: center; padding: 20px; color: var(--text-muted);">กำลังโหลด...</div>
          <div v-else-if="addableMutualFollowers.length === 0" style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">ไม่มีคนที่สามารถเพิ่มได้</div>
          <div v-else style="display: flex; flex-direction: column; gap: 4px;">
            <div v-for="f in addableMutualFollowers" :key="f.id" @click="toggleSelectAdd(f.id)" :style="`display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; cursor: pointer; background: ${selectedAddIds.includes(f.id) ? 'rgba(123,108,246,0.12)' : 'transparent'};`" @mouseenter="!selectedAddIds.includes(f.id) && ($event.currentTarget.style.background = 'var(--bg-tertiary)')" @mouseleave="!selectedAddIds.includes(f.id) && ($event.currentTarget.style.background = 'transparent')">
              <div style="width: 38px; height: 38px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #6366f1, #8b5cf6); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img v-if="f.avatar_url" :src="f.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" @error="f.avatar_url = null" />
                <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #fff;">{{ (f.display_name || f.username || '?').charAt(0).toUpperCase() }}</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">{{ f.display_name || f.username }}</div>
              </div>
              <div :style="`width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${selectedAddIds.includes(f.id) ? 'var(--brand)' : 'var(--border-primary)'}; background: ${selectedAddIds.includes(f.id) ? 'var(--brand)' : 'transparent'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`">
                <svg v-if="selectedAddIds.includes(f.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
        </div>
        <div style="padding: 16px 20px; border-top: 1px solid var(--border-primary);">
          <button @click="addMembersToGroup" :disabled="selectedAddIds.length === 0" :style="`width: 100%; padding: 14px; border-radius: 14px; border: none; background: ${selectedAddIds.length > 0 ? 'var(--brand)' : 'var(--bg-tertiary)'}; color: ${selectedAddIds.length > 0 ? '#fff' : 'var(--text-muted)'}; font-size: 15px; font-weight: 800; cursor: ${selectedAddIds.length > 0 ? 'pointer' : 'not-allowed'};`">
            เพิ่ม {{ selectedAddIds.length }} คน
          </button>
        </div>
      </div>
    </div>
  </Teleport>

</template>


<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useUnreadMessages } from '~/composables/useUnreadMessages'
import { useReportModal } from '~/composables/useReportModal'
import { usePresence } from '~/composables/usePresence'

useHead({ title: 'ข้อความ — ConnecXus' })
definePageMeta({ layout: 'default', middleware: ['auth'] })

const { user } = useAuth()
const { openReportModal } = useReportModal()
const { totalUnread, setUnreadCount, incrementUnread } = useUnreadMessages()
const { subscribe, publish, joinRoom } = useRealtime()
const { isOnline, initPresence } = usePresence()

const partnerIsTyping = ref(false)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

function handleTypingInput() {
  if (!activeConversation.value?.id) return
  publish('typing_start', {
    conversation_id: activeConversation.value.id,
    user_id: user.value?.id,
    username: user.value?.username
  })
  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    if (activeConversation.value?.id) {
      publish('typing_stop', {
        conversation_id: activeConversation.value.id,
        user_id: user.value?.id
      })
    }
  }, 3000)
}
  const route = useRoute()
  const searchQuery = ref('')
  
  function parseImages(urlStr: string | null): string[] {
    if (!urlStr) return []
    try {
      const parsed = JSON.parse(urlStr)
      if (Array.isArray(parsed)) return parsed
      return [urlStr]
    } catch(e) {
      return [urlStr]
    }
  }

  const loadingConversations = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const newMessage = ref('')

const showEmojiPicker = ref(false)
const showStickerPicker = ref(false)
const showGifPicker = ref(false)
// State
const conversations = ref<any[]>([])
const activeConversation = ref<any | null>(null)
const currentMessages = ref<any[]>([])
const chatToDelete = ref<any | null>(null)
const gifQuery = ref('')
const gifResults = ref<string[]>([])
const loadingGifs = ref(false)
const showingArchived = ref(false)
const showArchiveMenu = ref(false)
const showSearch = ref(false)

// ═══ GROUP CHAT STATE ═══
const showCreateGroupModal = ref(false)
const showEditGroupModal = ref(false)
const showAddMemberModal = ref(false)
const newGroupName = ref('')
const newGroupAvatarUrl = ref('')
const editGroupName = ref('')
const editGroupAvatarUrl = ref('')
const selectedMemberIds = ref<number[]>([])
const selectedAddIds = ref<number[]>([])
const mutualFollowers = ref<any[]>([])
const loadingMutualFollowers = ref(false)
const groupMembers = ref<any[]>([])
const creatingGroup = ref(false)
const hoveredMemberId = ref<number | null>(null)
const memberMenuOpenId = ref<number | null>(null)
const infoSections = ref({ info: true, customize: false, media: false, privacy: false, members: false })

const lastReadMessageId = computed(() => {
  if (!activeConversation.value?.other_last_read_at) return null
  const readTime = new Date(activeConversation.value.other_last_read_at).getTime()
  for (let i = currentMessages.value.length - 1; i >= 0; i--) {
    const m = currentMessages.value[i]
    if (m.is_mine && new Date(m.created_at).getTime() <= readTime) {
      return m.id
    }
  }
  return null
})
const messageSearchQuery = ref('')
const viewingImage = ref<any>(null)

async function downloadImage(url: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = 'image.jpg'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(objectUrl)
    document.body.removeChild(a)
  } catch(e) {
    showToast('ดาวน์โหลดไม่สำเร็จ', 'error')
  }
}
const hoveredChatId = ref<number | null>(null)

const toastMessage = ref<{text: string, type: 'success' | 'error'} | null>(null)
let toastTimeout: any = null
function showToast(text: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = { text, type }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

async function handleMessageClick(msgId: number) {
  if (messageSearchQuery.value) {
    messageSearchQuery.value = ''
    showSearch.value = false
    await nextTick()
    scrollToMessage(msgId)
  }
}

watch(showingArchived, () => {
  fetchConversations()
})
const activeChatMenuId = ref<number | null>(null)
const convMenuPosition = ref({ top: 0, right: 0 })

function openChatMenu(chatId: number, event: MouseEvent) {
  if (activeChatMenuId.value === chatId) {
    activeChatMenuId.value = null
    return
  }
  const btn = (event.currentTarget as HTMLElement)
  const rect = btn.getBoundingClientRect()
  convMenuPosition.value = {
    top: rect.bottom + 6,
    right: window.innerWidth - rect.right
  }
  activeChatMenuId.value = chatId
}


const isMuted = computed(() => activeConversation.value?.is_muted || false)
const isBlocked = computed(() => activeConversation.value?.is_blocked || false)
const isBlockedByThem = computed(() => activeConversation.value?.is_blocked_by_them || false)
const isMutualFollow = computed(() => {
  // Group chats always allow messaging
  if (activeConversation.value?.type === 'group') return true
  if (activeConversation.value?.is_mutual_follow === undefined) return true;
  return activeConversation.value.is_mutual_follow;
})


const currentThemeColor = computed(() => {
  if (isBlocked.value || isBlockedByThem.value) return '#9ca3af' // grey-400
  return activeConversation.value?.theme_color || 'var(--brand)'
})

const filteredMessages = computed(() => {
  if (!messageSearchQuery.value) return currentMessages.value
  const lowerQuery = messageSearchQuery.value.toLowerCase()
  return currentMessages.value.filter(m => m.content?.toLowerCase().includes(lowerQuery))
})

function isOnlyEmoji(text: string | null | undefined): boolean {
  if (!text) return false
  const trimmed = text.trim()
  if (!trimmed) return false
  const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uFE0F|\u200D|\s)+$/u
  const count = Array.from(trimmed.replace(/\s/g, '')).length
  return emojiRegex.test(trimmed) && count <= 3
}

function shouldShowAvatar(msg: any, index: number, messages: any[]): boolean {
  if (msg.is_mine) return false
  if (index === messages.length - 1) return true
  const nextMsg = messages[index + 1]
  const currentSenderId = msg.sender_id || msg.sender?.id
  const nextSenderId = nextMsg?.sender_id || nextMsg?.sender?.id
  if (Number(currentSenderId) !== Number(nextSenderId)) return true
  const currentTime = new Date(msg.created_at).getTime()
  const nextTime = new Date(nextMsg.created_at).getTime()
  if (Math.abs(nextTime - currentTime) > 2 * 60 * 1000) return true
  return false
}

function shouldShowTime(msg: any, index: number, messages: any[]): boolean {
  if (index === messages.length - 1) return true
  const nextMsg = messages[index + 1]
  const currentSenderId = msg.sender_id || msg.sender?.id
  const nextSenderId = nextMsg?.sender_id || nextMsg?.sender?.id
  if (Number(currentSenderId) !== Number(nextSenderId)) return true
  const currentTime = new Date(msg.created_at).getTime()
  const nextTime = new Date(nextMsg.created_at).getTime()
  if (Math.abs(nextTime - currentTime) > 2 * 60 * 1000) return true
  if (msg.is_mine && msg.id === lastReadMessageId.value) return true
  return false
}

function getClusterClass(msg: any, index: number, messages: any[]): string {
  const currentSenderId = Number(msg.sender_id || msg.sender?.id)
  const prevMsg = index > 0 ? messages[index - 1] : null
  const nextMsg = index < messages.length - 1 ? messages[index + 1] : null
  
  const isPrevSame = prevMsg && Number(prevMsg.sender_id || prevMsg.sender?.id) === currentSenderId
  const isNextSame = nextMsg && Number(nextMsg.sender_id || nextMsg.sender?.id) === currentSenderId
  
  if (!isPrevSame && !isNextSame) return 'cluster-single'
  if (!isPrevSame && isNextSame) return 'cluster-top'
  if (isPrevSame && isNextSame) return 'cluster-middle'
  if (isPrevSame && !isNextSame) return 'cluster-bottom'
  return 'cluster-single'
}

function handleSearchClick(msgId: number) {
  if (messageSearchQuery.value) {
    messageSearchQuery.value = ''
    showSearch.value = false
    setTimeout(() => {
      const el = document.getElementById('msg-' + msgId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const bubble = el.querySelector('div[style*=\"padding\"]') as HTMLElement
        if (bubble) {
          const oldShadow = bubble.style.boxShadow
          bubble.style.transition = 'box-shadow 0.3s, transform 0.3s'
          bubble.style.boxShadow = '0 0 0 4px rgba(123, 108, 246, 0.5)'
          bubble.style.transform = 'scale(1.02)'
          setTimeout(() => {
            bubble.style.boxShadow = oldShadow
            bubble.style.transform = 'scale(1)'
          }, 1500)
        }
      }
    }, 150)
  }
}

async function toggleChatMute(chat: any) {
  try {
    const newMuted = !chat.is_muted
    await $fetch(`/api/messages/conversations/${chat.id}/mute`, {
      method: 'PUT',
      body: { is_muted: newMuted }
    })
    chat.is_muted = newMuted
    activeChatMenuId.value = null
  } catch(e) {}
}



async function archiveChat(chat: any) {
  try {
    await $fetch(`/api/messages/conversations/${chat.id}/archive`, { 
      method: 'PUT',
      body: { is_archived: !showingArchived.value }
    })
    activeChatMenuId.value = null
    // Remove from local list to simulate instant archive/unarchive
    conversations.value = conversations.value.filter(c => c.id !== chat.id)
    if (activeConversation.value?.id === chat.id) {
      activeConversation.value = null
      currentMessages.value = []
    }
  } catch(e) {}
}

function deleteChat(chat: any) {
  activeChatMenuId.value = null
  chatToDelete.value = chat
}

async function confirmDelete() {
  if (!chatToDelete.value) return
  const chat = chatToDelete.value
  chatToDelete.value = null
  try {
    await $fetch(`/api/messages/conversations/${chat.id}`, { method: 'DELETE' })
    conversations.value = conversations.value.filter(c => c.id !== chat.id)
    if (activeConversation.value?.id === chat.id) {
      activeConversation.value = null
      currentMessages.value = []
    }
  } catch(e) {}
}

function openProfile(username: string) {
  activeChatMenuId.value = null
  navigateTo(`/profile/${username}`)
}

function openReportUser(chat: any) {
  activeChatMenuId.value = null
  reportUserModal.value = true
}

async function toggleMute() {
  if (!activeConversation.value) return
  try {
    const newMuted = !isMuted.value
    await $fetch(`/api/messages/${activeConversation.value.id}/mute`, {
      method: 'PUT',
      body: { is_muted: newMuted }
    })
    activeConversation.value.is_muted = newMuted
    fetchConversations() // refresh to update badges if needed
  } catch(e) {}
}

async function toggleBlock() {
  if (!activeConversation.value) return
  try {
    if (isBlocked.value) {
      await $fetch(`/api/users/${activeConversation.value.other_user.id}/block`, { method: 'DELETE' })
      activeConversation.value.is_blocked = false
    } else {
      await $fetch(`/api/users/${activeConversation.value.other_user.id}/block`, { method: 'POST' })
      activeConversation.value.is_blocked = true
    }
  } catch(e) {}
}

const gifTimeout = ref<any>(null)

// Mock GIF database
const ALL_GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjRjeGR6bmsyZnkyeTF3OWg3bzNmdGZ5cmFzZTFwZTViNjN4dnI0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnBlZXlkMnYxdnRxMXc5OTcybzQzajZrcWV2Ynl0YngwYWV2ZnhwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlBO7eyXzSZkJri/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJ2dXVjMjUyOGh1MzY5b3IyZHYxODhxYnhkNWxjeDhmYzR6ZGJ2cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWx4eW9yOWJrdnh1dnZqOXU1OHU4bmlyOXVtdWkxbGhqMW84dzBvYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif',
  'https://media.giphy.com/media/3oEduV4SOS9mmmIOkw/giphy.gif',
  'https://media.giphy.com/media/3o7WTF9wicpQnEpYNY/giphy.gif',
  'https://media.giphy.com/media/3o6Zt481isNvuFIWcw/giphy.gif',
  'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
  'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif',
  'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif',
  'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
]

function searchGifs() {
  clearTimeout(gifTimeout.value)
  gifTimeout.value = setTimeout(async () => {
    loadingGifs.value = true
    try {
      const q = gifQuery.value.trim() || 'trending'
      const data = await $fetch('/api/gifs/search', { params: { q } })
      if (data && data.gifs) {
        gifResults.value = data.gifs
      } else {
        gifResults.value = []
      }
    } catch (e) {
      console.error('Failed to fetch GIFs:', e)
    } finally {
      loadingGifs.value = false
    }
  }, 500)
}

watch(showGifPicker, (val) => {
  if (val && gifResults.value.length === 0) {
    searchGifs()
  }
})
const commonEmojis = ['😀','😂','🥰','😎','🤔','😭','👍','❤️','🔥','🎉','✨','👀']
const themeColors = ['#7b6cf6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#ec4899', '#8b5cf6']
const quickEmojis = ['👍','❤️','🔥','😂','😎','👀','🥰','🎉','✨','👏']

const mockStickers = [
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Cat%20with%20Tears%20of%20Joy.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Hearts.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png',
  'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png'
]

const mockGifs = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjRjeGR6bmsyZnkyeTF3OWg3bzNmdGZ5cmFzZTFwZTViNjN4dnI0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnBlZXlkMnYxdnRxMXc5OTcybzQzajZrcWV2Ynl0YngwYWV2ZnhwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlBO7eyXzSZkJri/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJ2dXVjMjUyOGh1MzY5b3IyZHYxODhxYnhkNWxjeDhmYzR6ZGJ2cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWx4eW9yOWJrdnh1dnZqOXU1OHU4bmlyOXVtdWkxbGhqMW84dzBvYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif'
]

// Recording State
const isRecording = ref(false)
const recordingTime = ref(0)
const recordingTimeFormatted = computed(() => {
  const m = Math.floor(recordingTime.value / 60)
  const s = recordingTime.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingInterval: any = null

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }
    
    mediaRecorder.start()
    isRecording.value = true
    recordingTime.value = 0
    recordingInterval = setInterval(() => { recordingTime.value++ }, 1000)
    
    showEmojiPicker.value = false
    showStickerPicker.value = false
    showGifPicker.value = false
  } catch (err) {
    showToast('ไม่สามารถเข้าถึงไมโครโฟนได้', 'error')
  }
}

function stopMediaTracks() {
  if (mediaRecorder && mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach(t => t.stop())
  }
}

function cancelRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop()
    stopMediaTracks()
  }
  clearInterval(recordingInterval)
  isRecording.value = false
  audioChunks = []
}

function stopRecordingAndSend() {
  if (!mediaRecorder) return
  mediaRecorder.onstop = async () => {
    stopMediaTracks()
    clearInterval(recordingInterval)
    isRecording.value = false
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
    
    sending.value = true
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await $fetch('/api/upload', { method: 'POST', body: fd })
      const url = (res as any).url
      
      const payload = {
        conversation_id: activeConversation.value.id,
        content: '',
        audio_url: url
      }
      const msgRes = await $fetch('/api/messages', { method: 'POST', body: payload }) as any
      msgRes.is_mine = true
      if (!currentMessages.value.find(m => m.id === msgRes.id)) {
        currentMessages.value.push(msgRes)
        scrollToBottom()
      }
      publish('chat', { conversation_id: activeConversation.value.id, message: msgRes })
    } catch (e) {
      showToast('ส่งเสียงไม่สำเร็จ', 'error')
    } finally {
      sending.value = false
    }
  }
  mediaRecorder.stop()
}

async function sendMedia(url: string) {
  showStickerPicker.value = false
  showGifPicker.value = false
  if (!activeConversation.value) return
  sending.value = true
  try {
    const payload = {
      conversation_id: activeConversation.value.id,
      content: '',
      image_url: url
    }
    const res = await $fetch('/api/messages', { method: 'POST', body: payload }) as any
    res.is_mine = true
    if (!currentMessages.value.find(m => m.id === res.id)) {
      currentMessages.value.push(res)
      scrollToBottom()
    }
    publish('chat', { conversation_id: activeConversation.value.id, message: res })
  } catch (e) {
    showToast('ส่งรูปภาพไม่สำเร็จ', 'error')
  } finally {
    sending.value = false
  }
}

const showThemeModal = ref(false)
const showEmojiSelectModal = ref(false)
const confirmUnsendMsg = ref<any>(null)
const reportMsgItem = ref<any>(null)
const reportReason = ref('')

const showInfoPanel = ref(false)


function insertEmoji(emoji: string) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

async function sendQuickEmoji() {
  const emoji = activeConversation.value?.quick_emoji || '👍'
  newMessage.value = emoji
  await sendMessage()
}

async function updateSettings(settings: any) {
  if (!activeConversation.value) return
  const convId = activeConversation.value.id
  const isGroup = activeConversation.value.type === 'group'
  try {
    const res = await $fetch<any>(`/api/messages/conversations/${convId}/settings`, {
      method: 'PUT',
      body: settings
    })
    
    if (settings.theme_color !== undefined) activeConversation.value.theme_color = settings.theme_color
    if (settings.quick_emoji !== undefined) activeConversation.value.quick_emoji = settings.quick_emoji
    if (settings.wallpaper_url !== undefined) activeConversation.value.wallpaper_url = settings.wallpaper_url
    
    const conv = conversations.value.find(c => Number(c.id) === Number(convId))
    if (conv) {
      if (settings.theme_color !== undefined) conv.theme_color = settings.theme_color
      if (settings.quick_emoji !== undefined) conv.quick_emoji = settings.quick_emoji
      if (settings.wallpaper_url !== undefined) conv.wallpaper_url = settings.wallpaper_url
    }

    // Broadcast to all members if it's a group chat, or sync cross-tab
    publish('update_settings', {
      conversation_id: convId,
      settings,
      is_group: isGroup || res?.is_group,
      user_id: user.value?.id
    })
  } catch (e) {
    showToast('อัปเดตการตั้งค่าไม่สำเร็จ', 'error')
  }
}

async function handleWallpaperUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  
  try {
    const formData = new FormData()
    formData.append('file', file, file.name)
    const uploadRes = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const url = (uploadRes as any).url
    await updateSettings({ wallpaper_url: url })
    showToast('เปลี่ยนรูปพื้นหลังสำเร็จ', 'success')
  } catch (e) {
    showToast('อัปโหลดรูปพื้นหลังไม่สำเร็จ', 'error')
  } finally {
    target.value = ''
  }
}

async function removeWallpaper() {
  await updateSettings({ wallpaper_url: '' })
  showToast('ลบรูปพื้นหลังเรียบร้อย', 'success')
}

const messagesContainer = ref<HTMLElement | null>(null)

const hoveredMessageId = ref<number | null>(null)
const activeMenuId = ref<number | null>(null)
const menuOpenUpward = ref(false)
const editingMessage = ref<any>(null)
const showForwardModal = ref(false)
const forwardMessageItem = ref<any>(null)

function toggleMenu(msgId: number, event?: MouseEvent) {
  if (activeMenuId.value === msgId) {
    activeMenuId.value = null
    return
  }
  activeMenuId.value = msgId
  
  if (event && messagesContainer.value) {
    const btn = event.currentTarget as HTMLElement
    const containerRect = messagesContainer.value.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    
    // Only open upwards if not enough space below (< 220px) AND plenty of space above (>= 220px)
    const spaceBelow = containerRect.bottom - btnRect.bottom
    const spaceAbove = btnRect.top - containerRect.top
    menuOpenUpward.value = spaceBelow < 220 && spaceAbove >= 220
  } else {
    menuOpenUpward.value = false
  }
}
// Close menu if clicked outside
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.msg-action-container')) {
      activeMenuId.value = null
    }
  })
}

// Actions
function startEdit(msg: any) {
  editingMessage.value = msg
  newMessage.value = msg.content
  activeMenuId.value = null
}

function unsendMessage(msg: any) {
  activeMenuId.value = null
  confirmUnsendMsg.value = msg
}

async function executeUnsend() {
  if (!confirmUnsendMsg.value) return
  const msg = confirmUnsendMsg.value
  confirmUnsendMsg.value = null
  try {
    await $fetch(`/api/messages/${msg.id}`, { method: 'DELETE' })
    currentMessages.value = currentMessages.value.filter(m => m.id !== msg.id)
    publish('unsend', { conversation_id: msg.conversation_id, message_id: msg.id })
  } catch (e) {
    showToast('ลบไม่สำเร็จ', 'error')
  }
}

async function togglePin(msg: any) {
  activeMenuId.value = null
  const isNowPinned = !msg.is_pinned
  try {
    await $fetch(`/api/messages/${msg.id}/pin`, {
      method: 'PUT',
      body: { is_pinned: isNowPinned }
    })
    msg.is_pinned = isNowPinned
    publish('pin', { conversation_id: msg.conversation_id, message_id: msg.id, is_pinned: isNowPinned })
  } catch (e) {
    showToast('ปักหมุดไม่สำเร็จ', 'error')
  }
}

async function reportMessage(msg: any) {
  activeMenuId.value = null
  openReportModal('message', msg.id)
}

function openForwardModal(msg: any) {
  activeMenuId.value = null
  forwardMessageItem.value = msg
  showForwardModal.value = true
}

async function forwardTo(chat: any) {
  showForwardModal.value = false
  if (!forwardMessageItem.value) return
  try {
    const payload = {
      conversation_id: chat.id,
      content: forwardMessageItem.value.content,
      image_url: forwardMessageItem.value.image_url
    }
    const res = await $fetch('/api/messages', {
      method: 'POST',
      body: payload
    })
    showToast('ส่งต่อสำเร็จ', 'success')
  } catch (e) {
    showToast('ส่งต่อไม่สำเร็จ', 'error')
  }
}

const pinnedMessages = computed(() => {
  return currentMessages.value.filter(m => m.is_pinned)
})

function scrollToMessage(id: number) {
  const el = document.getElementById(`message-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const oldBg = el.style.backgroundColor
    el.style.transition = 'background-color 0.5s'
    el.style.backgroundColor = 'var(--bg-tertiary)'
    setTimeout(() => {
      el.style.backgroundColor = oldBg
    }, 1500)
  }
}



// --- WebSocket ---
let unsubscribeRealtime: (() => void) | null = null

onMounted(async () => {
    initPresence()
    await fetchConversations()
  
  unsubscribeRealtime = subscribe((event) => {
    const data = { type: event.type, ...event.payload }
    
    if (data.type === 'typing_start' && data.conversation_id === activeConversation.value?.id && data.user_id !== user.value?.id) {
      partnerIsTyping.value = true
      if (typingTimeout) clearTimeout(typingTimeout)
      typingTimeout = setTimeout(() => { partnerIsTyping.value = false }, 4000)
    }
    if (data.type === 'typing_stop' && data.conversation_id === activeConversation.value?.id) {
      partnerIsTyping.value = false
    }

    if (data.type === 'read') {
        if (data.user_id !== user.value?.id) {
          if (activeConversation.value && data.conversation_id === activeConversation.value.id) {
            activeConversation.value.other_last_read_at = data.last_read_at
          }
          const conv = conversations.value.find(c => c.id === data.conversation_id)
          if (conv) {
            conv.other_last_read_at = data.last_read_at
          }
        }
      }
      
      if (data.type === 'chat') {
        const msg = data.payload?.message || data.message
        if (!msg) return
        
        const senderId = msg.sender_id || msg.sender?.id
        const isMine = user.value ? Number(senderId) === Number(user.value.id) : false
        
        if (msg.conversation_id !== activeConversation.value?.id) {
          if (!isMine) {
            incrementUnread()
          }
        }

        if (activeConversation.value && msg.conversation_id === activeConversation.value.id) {
          const existing = currentMessages.value.find(m => m.id === msg.id)
          if (!existing) {
            currentMessages.value.push({
              ...msg,
              is_mine: isMine
            })
            scrollToBottom()
            if (!isMine && user.value) {
              $fetch(`/api/messages/${msg.conversation_id}/read`, { method: 'PUT' }).catch(console.error)
              publish('read', { conversation_id: msg.conversation_id, user_id: user.value.id, last_read_at: new Date().toISOString() })
            }
          } else {
            existing.is_mine = isMine
          }
        }
        
        const conv = conversations.value.find(c => c.id === msg.conversation_id)
        if (conv) {
          conv.last_message = {
            content: msg.content,
            image_url: msg.image_url,
            audio_url: msg.audio_url,
            created_at: msg.created_at
          }
          conversations.value = [conv, ...conversations.value.filter(c => c.id !== msg.conversation_id)]
        }
      }
    
    if (data.type === 'unsend' && data.message_id) {
      currentMessages.value = currentMessages.value.filter(m => m.id !== data.message_id)
    }
    if (data.type === 'pin' && data.message_id) {
      const m = currentMessages.value.find(m => m.id === data.message_id)
      if (m) m.is_pinned = data.is_pinned
    }
    if (data.type === 'edit' && data.message_id) {
      const m = currentMessages.value.find(m => m.id === data.message_id)
      if (m) {
        m.content = data.content
        m.is_edited = true
      }
    }
    if (data.type === 'update_settings') {
      const payload = data.payload || data
      const settings = payload.settings || payload
      const convId = payload.conversation_id || settings?.conversation_id
      const isGroup = payload.is_group ?? settings?.is_group
      const senderUserId = payload.user_id || settings?.user_id

      if (isGroup || (senderUserId && user.value && Number(senderUserId) === Number(user.value.id))) {
        const conv = conversations.value.find(c => Number(c.id) === Number(convId))
        if (conv) {
          if (settings.theme_color !== undefined) conv.theme_color = settings.theme_color
          if (settings.quick_emoji !== undefined) conv.quick_emoji = settings.quick_emoji
          if (settings.wallpaper_url !== undefined) conv.wallpaper_url = settings.wallpaper_url
        }
        if (activeConversation.value && Number(activeConversation.value.id) === Number(convId)) {
          if (settings.theme_color !== undefined) activeConversation.value.theme_color = settings.theme_color
          if (settings.quick_emoji !== undefined) activeConversation.value.quick_emoji = settings.quick_emoji
          if (settings.wallpaper_url !== undefined) activeConversation.value.wallpaper_url = settings.wallpaper_url
        }
      }
    }
  })
  
  if (route.query.username) {
    const targetUsername = route.query.username as string
    // Guard: skip if username is invalid/undefined
    if (!targetUsername || targetUsername === 'undefined' || targetUsername === 'null') return
    const existing = conversations.value.find(c => c.other_user?.username === targetUsername)
    if (existing) {
      selectConversation(existing)
    } else {
      try {
        const fetchedUser = await $fetch(`/api/users/${targetUsername}`)
        const tempConv = {
          id: 'temp-' + (fetchedUser as any).id,
          other_user: fetchedUser,
          last_message: null
        }
        activeConversation.value = tempConv
        currentMessages.value = []
      } catch (e) {
        console.error('Failed to fetch user for direct message', e)
      }
    }
  }
})

onUnmounted(() => {
  if (unsubscribeRealtime) unsubscribeRealtime()
})


async function fetchConversations() {
  loadingConversations.value = true
  try {
    const res = await $fetch(`/api/messages/conversations?archived=${showingArchived.value}`)
    conversations.value = res as any[]
    setUnreadCount(res.reduce((sum: number, c: any) => sum + (c.is_muted ? 0 : (c.unread_count || 0)), 0))
    
    // Subscribe to all conversation rooms
    conversations.value.forEach(c => {
      joinRoom(`conversation-${c.id}`)
    })
  } catch (err) {
    console.error(err)
  } finally {
    loadingConversations.value = false
  }
}

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  const q = searchQuery.value.toLowerCase()
  return conversations.value.filter(c => 
    c.other_user?.display_name?.toLowerCase().includes(q) || 
    c.other_user?.username?.toLowerCase().includes(q)
  )
})

async function selectConversation(chat: any) {
  activeConversation.value = chat
  loadingMessages.value = true
  
  if (chat.unread_count > 0) {
    if (!chat.is_muted) totalUnread.value = Math.max(0, totalUnread.value - chat.unread_count)
    chat.unread_count = 0
    $fetch(`/api/messages/${chat.id}/read`, { method: 'PUT' }).catch(console.error)
      publish('read', { conversation_id: chat.id, user_id: user.value?.id, last_read_at: new Date().toISOString() })
  }
  
  try {
    const res = await $fetch(`/api/messages/${chat.id}`)
    currentMessages.value = (res as any[]).map(msg => ({
      ...msg,
      is_mine: user.value ? Number(msg.sender_id || msg.sender?.id) === Number(user.value.id) : false
    }))
    scrollToBottom()
  } catch (err) {
    console.error(err)
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value || !activeConversation.value) return
  
  sending.value = true
  const content = newMessage.value.trim()
  const convId = activeConversation.value.id
  
  try {
    if (editingMessage.value) {
      const msgId = editingMessage.value.id
      const res = await $fetch(`/api/messages/${msgId}`, {
        method: 'PUT',
        body: { content }
      })
      
      const m = currentMessages.value.find(m => m.id === msgId)
      if (m) {
        m.content = content
        m.is_edited = true
      }
      
      publish('edit', { conversation_id: convId, message_id: msgId, content })
      
      editingMessage.value = null
      newMessage.value = ''
      showEmojiPicker.value = false
    } else {
      newMessage.value = '' // clear input quickly
      showEmojiPicker.value = false
      const payload: any = { content: content }
      if (typeof convId === 'string' && convId.startsWith('temp-')) {
        payload.receiver_id = activeConversation.value.other_user.id
      } else {
        payload.conversation_id = convId
      }

      // 1. Save to DB
      const res = await $fetch('/api/messages', {
        method: 'POST',
        body: payload
      })
      
      const msg = res as any
      msg.is_mine = true
      
      // Update active conversation ID if it was temp
      const realConvId = msg.conversation_id
      if (activeConversation.value.id !== realConvId) {
        activeConversation.value.id = realConvId
      }

      // 2. Add to local UI
      if (!currentMessages.value.find(m => m.id === msg.id)) {
         currentMessages.value.push(msg)
         scrollToBottom()
      }
      
      // Update conversation list
      activeConversation.value.last_message = {
        content: msg.content,
        image_url: msg.image_url,
        created_at: msg.created_at
      }
      conversations.value = [activeConversation.value, ...conversations.value.filter(c => c.id !== realConvId && c.id !== convId)]
      
      // Subscribe to the new real room if it was temp
      if (typeof convId === 'string' && convId.startsWith('temp-')) {
        joinRoom(`conversation-${realConvId}`)
      }

      // 3. Broadcast to others via WS
      publish('chat', { conversation_id: realConvId, message: msg })
    }
  } catch (err) {
    console.error(err)
    showToast('ส่งข้อความไม่สำเร็จ', 'error')
  } finally {
    sending.value = false
  }
}

async function handleImageUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const files = Array.from(target.files)
  
  sending.value = true
  showEmojiPicker.value = false
  
  try {
    const uploadedUrls: string[] = []
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file, file.name)
      const uploadRes = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      uploadedUrls.push((uploadRes as any).url)
    }
    
    const convId = activeConversation.value.id
    const image_url_val = uploadedUrls.length === 1 ? uploadedUrls[0] : JSON.stringify(uploadedUrls)
    
    const payload: any = { content: '', image_url: image_url_val }
    if (typeof convId === 'string' && convId.startsWith('temp-')) {
      payload.receiver_id = activeConversation.value.other_user.id
    } else {
      payload.conversation_id = convId
    }

    const msg = await $fetch('/api/messages', {
      method: 'POST',
      body: payload
    }) as any

    msg.is_mine = true
    msg.sender = {
      id: user.value?.id,
      username: user.value?.username,
      display_name: user.value?.display_name,
      avatar_url: user.value?.avatar_url
    }
    
    const realConvId = msg.conversation_id
    if (!currentMessages.value.find(m => m.id === msg.id)) {
       currentMessages.value.push(msg)
       scrollToBottom()
    }
    
    activeConversation.value.last_message = {
      content: msg.content,
      image_url: msg.image_url,
      created_at: msg.created_at
    }
    conversations.value = [activeConversation.value, ...conversations.value.filter(c => c.id !== realConvId && c.id !== convId)]
    
    if (typeof convId === 'string' && convId.startsWith('temp-')) {
      joinRoom(`conversation-${realConvId}`)
    }

    publish('chat', { conversation_id: realConvId, message: msg })
  } catch (err) {
    console.error(err)
    showToast('ส่งภาพไม่สำเร็จ', 'error')
  } finally {
    sending.value = false
    target.value = ''
  }
}

function scrollToBottom()
 {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 50)
}

function formatTimeShort(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(date)
}

// ═══════════════════════════════════════
// GROUP CHAT FUNCTIONS
// ═══════════════════════════════════════

async function loadMutualFollowers() {
  loadingMutualFollowers.value = true
  mutualFollowers.value = []
  selectedMemberIds.value = []
  newGroupName.value = ''
  newGroupAvatarUrl.value = ''
  try {
    const res = await $fetch('/api/users/mutual-followers') as any
    mutualFollowers.value = res.users || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingMutualFollowers.value = false
  }
}

async function loadMutualFollowersForAdd() {
  loadingMutualFollowers.value = true
  selectedAddIds.value = []
  try {
    const currentIds = groupMembers.value.map((m: any) => m.user_id).join(',')
    const res = await $fetch(`/api/users/mutual-followers?exclude=${currentIds}`) as any
    mutualFollowers.value = res.users || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingMutualFollowers.value = false
  }
}

const addableMutualFollowers = computed(() => {
  const memberIds = groupMembers.value.map((m: any) => m.user_id)
  return mutualFollowers.value.filter((f: any) => !memberIds.includes(f.id))
})

function toggleSelectMember(id: number) {
  if (selectedMemberIds.value.includes(id)) {
    selectedMemberIds.value = selectedMemberIds.value.filter(i => i !== id)
  } else {
    selectedMemberIds.value = [...selectedMemberIds.value, id]
  }
}

function toggleSelectAdd(id: number) {
  if (selectedAddIds.value.includes(id)) {
    selectedAddIds.value = selectedAddIds.value.filter(i => i !== id)
  } else {
    selectedAddIds.value = [...selectedAddIds.value, id]
  }
}

async function handleGroupAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.[0]) return
  const formData = new FormData()
  formData.append('file', target.files[0])
  const res = await $fetch('/api/upload', { method: 'POST', body: formData }) as any
  newGroupAvatarUrl.value = res.url
}

async function handleEditGroupAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.[0]) return
  const formData = new FormData()
  formData.append('file', target.files[0])
  const res = await $fetch('/api/upload', { method: 'POST', body: formData }) as any
  editGroupAvatarUrl.value = res.url
}

async function createGroup() {
  if (!newGroupName.value.trim() || selectedMemberIds.value.length === 0) return
  creatingGroup.value = true
  try {
    const res = await $fetch('/api/messages/groups', {
      method: 'POST',
      body: {
        name: newGroupName.value.trim(),
        avatar_url: newGroupAvatarUrl.value || null,
        participant_ids: selectedMemberIds.value
      }
    }) as any
    showCreateGroupModal.value = false
    await fetchConversations()
    const newConv = conversations.value.find((c: any) => c.id === res.conversation_id)
    if (newConv) selectConversation(newConv)
    showToast('สร้างกลุ่มสำเร็จ!', 'success')
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  } finally {
    creatingGroup.value = false
  }
}

async function fetchGroupMembers() {
  if (!activeConversation.value?.id) return
  try {
    const res = await $fetch(`/api/messages/groups/${activeConversation.value.id}/participants`) as any
    groupMembers.value = res.participants || []
  } catch (e) {
    console.error(e)
  }
}

async function setMemberRole(targetUserId: number, role: string) {
  if (!activeConversation.value?.id) return
  try {
    await $fetch(`/api/messages/groups/${activeConversation.value.id}/participants`, {
      method: 'PUT',
      body: { target_user_id: targetUserId, role }
    })
    await fetchGroupMembers()
    showToast(role === 'admin' ? 'แต่งตั้งแอดมินสำเร็จ' : 'ถอดถอนแอดมินสำเร็จ', 'success')
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  }
}

async function kickMember(targetUserId: number) {
  if (!activeConversation.value?.id) return
  try {
    await $fetch(`/api/messages/groups/${activeConversation.value.id}/participants`, {
      method: 'DELETE',
      body: { target_user_id: targetUserId }
    })
    await fetchGroupMembers()
    showToast('เตะออกกลุ่มสำเร็จ', 'success')
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  }
}

async function addMembersToGroup() {
  if (!activeConversation.value?.id || selectedAddIds.value.length === 0) return
  try {
    await $fetch(`/api/messages/groups/${activeConversation.value.id}/participants`, {
      method: 'POST',
      body: { user_ids: selectedAddIds.value }
    })
    showAddMemberModal.value = false
    await fetchGroupMembers()
    showToast(`เพิ่ม ${selectedAddIds.value.length} คนสำเร็จ`, 'success')
    selectedAddIds.value = []
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  }
}

async function saveGroupEdit() {
  if (!activeConversation.value?.id || !editGroupName.value.trim()) return
  try {
    await $fetch(`/api/messages/groups/${activeConversation.value.id}`, {
      method: 'PUT',
      body: { name: editGroupName.value.trim(), avatar_url: editGroupAvatarUrl.value || undefined }
    })
    activeConversation.value.other_user.display_name = editGroupName.value.trim()
    if (editGroupAvatarUrl.value) activeConversation.value.other_user.avatar_url = editGroupAvatarUrl.value
    showEditGroupModal.value = false
    showToast('แก้ไขกลุ่มสำเร็จ', 'success')
    await fetchConversations()
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  }
}

async function leaveGroup() {
  if (!activeConversation.value?.id) return
  if (!confirm('คุณต้องการออกจากกลุ่มนี้ใช่ไหม?')) return
  try {
    await $fetch(`/api/messages/groups/${activeConversation.value.id}/participants`, {
      method: 'DELETE',
      body: { target_user_id: user.value?.id }
    })
    conversations.value = conversations.value.filter((c: any) => c.id !== activeConversation.value?.id)
    activeConversation.value = null
    showToast('ออกจากกลุ่มแล้ว', 'success')
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  }
}

async function deleteGroup() {
  if (!activeConversation.value?.id) return
  if (!confirm('ลบกลุ่มนี้? ข้อความทั้งหมดจะหายไปถาวร')) return
  try {
    await $fetch(`/api/messages/groups/${activeConversation.value.id}`, { method: 'DELETE' })
    conversations.value = conversations.value.filter((c: any) => c.id !== activeConversation.value?.id)
    activeConversation.value = null
    showToast('ลบกลุ่มเรียบร้อย', 'success')
  } catch (e: any) {
    showToast(e?.data?.message || 'เกิดข้อผิดพลาด', 'error')
  }
}



// Open Edit group modal - pre-fill values
watch(showEditGroupModal, (val) => {
  if (val && activeConversation.value) {
    editGroupName.value = activeConversation.value.other_user?.display_name || ''
    editGroupAvatarUrl.value = ''
  }
})

</script>



<style scoped>
/* ══════════════════════════════════════════
   GLOBAL MESSAGES LAYOUT & WRAPPER
══════════════════════════════════════════ */
.messages-page-root {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  font-family: inherit;
}

/* ══════════════════════════════════════════
   LEFT COLUMN: CHAT LIST
══════════════════════════════════════════ */
.chat-list-col {
  width: 290px;
  min-width: 260px;
  max-width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  height: 100%;
  overflow: hidden;
  z-index: 10;
}

.list-header-box {
  padding: 16px 16px 14px;
  border-bottom: 1px solid var(--border-primary);
  background: transparent;
}

.list-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.list-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.header-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.btn-icon-glass {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-icon-glass:hover,
.btn-icon-glass.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
  transform: translateY(-1px);
}

.archive-dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: var(--popover-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  padding: 6px;
  width: 170px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.15);
  z-index: 50;
  animation: fadeInDown 0.2s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--brand);
}

/* Search Bar */
.search-input-wrap {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.chat-search-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 99px;
  padding: 8px 12px 8px 34px;
  font-size: 12.5px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.chat-search-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

/* Conversation Items List */
.conversations-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chat-list-loading,
.chat-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-icon-ring {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--brand-light);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 10px;
}

.chat-list-empty h3 {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.chat-list-empty p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.conversation-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 11px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: transparent;
  border: 1px solid transparent;
}

.conversation-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-primary);
}

.conversation-card.active {
  background: var(--brand-light);
  border-color: var(--brand);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
}

.conv-avatar-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  flex-shrink: 0;
  position: relative;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.conv-avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.conv-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.online-indicator-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 11px;
  height: 11px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid #13131a;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.online-indicator-dot.small {
  width: 9px;
  height: 9px;
  border-width: 1.5px;
}

.online-indicator-dot.large {
  width: 15px;
  height: 15px;
  border-width: 2.5px;
  bottom: 2px;
  right: 2px;
}

.conv-info-col {
  flex: 1;
  min-width: 0;
}

.conv-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
  gap: 6px;
}

.conv-name-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
}

.conv-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-group-tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.09);
  padding: 1px 5px;
  border-radius: 5px;
  flex-shrink: 0;
  line-height: 1.3;
  letter-spacing: 0.2px;
}

.conv-time {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 4px;
  transition: opacity 0.2s ease;
}

.conv-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.conv-snippet {
  font-size: 12.5px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.conv-snippet.voice { color: #818cf8; }
.conv-snippet.media { color: #a78bfa; }

.unread-pill-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 99px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.muted-icon {
  font-size: 11px;
  opacity: 0.6;
}

.conv-options-anchor {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.btn-more-conv {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  box-shadow: var(--card-shadow);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-more-conv:hover {
  background: var(--bg-hover);
  border-color: var(--brand);
  color: var(--brand);
  transform: scale(1.08);
}

.conv-context-menu-fixed {
  position: fixed;
  background: var(--popover-bg);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  padding: 6px;
  width: 190px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: convMenuFadeIn 0.14s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes convMenuFadeIn {
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

.conv-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: transparent;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  transition: background 0.15s;
}

.context-menu-item:hover { background: rgba(255, 255, 255, 0.08); }
.context-menu-item.text-amber { color: #fbbf24; }
.context-menu-item.text-amber:hover { background: rgba(251, 191, 36, 0.12); }
.context-menu-item.text-rose { color: #f87171; }
.context-menu-item.text-rose:hover { background: rgba(248, 113, 113, 0.12); }

/* ══════════════════════════════════════════
   CENTER COLUMN: ACTIVE CHAT THREAD
══════════════════════════════════════════ */
.chat-main-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  min-width: 0;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.chat-custom-wallpaper-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 1;
  opacity: 0.18;
  filter: blur(1.5px);
  transform: scale(1.04);
  transition: all 0.4s ease;
}

.wallpaper-soft-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(10, 10, 16, 0.05) 0%, rgba(10, 10, 16, 0.5) 100%);
}

.customize-option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  transition: all 0.18s ease;
  user-select: none;
}

.customize-option-item:hover {
  background: var(--bg-hover);
  border-color: var(--brand);
  transform: translateY(-1px);
}

.customize-option-item.text-rose {
  color: #f87171;
}

.customize-option-item.text-rose:hover {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.3);
}

.active-chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  min-height: 68px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  z-index: 5;
}

.chat-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.header-avatar-box {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-tertiary);
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  border: 1.5px solid var(--border-primary);
  transition: transform 0.2s;
}

.header-avatar-box:hover {
  transform: scale(1.05);
}

.header-avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.header-user-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.header-user-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-online-status {
  font-size: 11.5px;
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-search-in-thread {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.pinned-messages-strip {
  padding: 7px 20px;
  background: var(--brand-light);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 12.5px;
}

.pinned-messages-strip:hover {
  background: var(--bg-hover);
}

.pinned-icon-badge {
  font-size: 13px;
}

.pinned-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-weight: 600;
}

.btn-close-pinned {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ══════════════════════════════════════════
   MESSAGE THREAD STREAM & BUBBLES
══════════════════════════════════════════ */
.messages-stream-area,
.chat-messages-stream {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messages-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: var(--text-muted);
  font-size: 13.5px;
}

.message-row-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  margin-top: 10px;
}

.message-row-wrapper.has-open-menu {
  z-index: 500 !important;
}

.message-row-wrapper.cluster-tight {
  margin-top: 3px !important;
}

.message-row-wrapper.is-mine {
  align-items: flex-end;
}

.group-sender-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--brand);
  text-decoration: none;
  margin-bottom: 4px;
  margin-left: 40px;
  display: inline-block;
}

.group-sender-name:hover {
  text-decoration: underline;
}

.message-bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 75%;
  position: relative;
  overflow: visible;
}

.message-bubble-row.has-open-menu {
  z-index: 501 !important;
}

.message-bubble-row.is-mine {
  flex-direction: row-reverse;
  margin-left: auto;
}

.msg-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: var(--bg-tertiary);
  margin-bottom: 2px;
}

.msg-avatar-spacer {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  margin-bottom: 2px;
}

.msg-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.msg-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.msg-action-container {
  position: relative;
  display: flex;
  align-items: center;
  opacity: 0;
  z-index: 10;
  flex-shrink: 0;
  order: 10; /* always appear after bubble & avatar */
  transition: opacity 0.15s;
}

/* For own messages - appear before the bubble (via row-reverse it's on the left) */
.message-bubble-row.is-mine .msg-action-container {
  order: -1;
}

.message-bubble-row:hover .msg-action-container,
.msg-action-container.has-open-menu {
  opacity: 1;
}

.msg-action-container.has-open-menu {
  z-index: 502 !important;
}

.btn-msg-options {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.15s;
}

.btn-msg-options:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
  transform: scale(1.1);
}

.msg-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  bottom: auto;
  left: 0;
  right: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-secondary, var(--border-primary));
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  z-index: 9999 !important;
  min-width: 148px;
  overflow: hidden;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  animation: menuFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.msg-dropdown-menu.open-upward {
  top: auto;
  bottom: calc(100% + 6px);
  animation: menuFadeInUp 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

/* For own messages (on the right) — right-align flush to the button so the menu opens inwards to the left */
.msg-dropdown-menu.is-mine {
  left: auto;
  right: 0;
}

@keyframes menuFadeIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes menuFadeInUp {
  from { opacity: 0; transform: translateY(6px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.msg-menu-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: left;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.msg-menu-btn:hover {
  background: var(--bg-hover);
}

.msg-menu-btn.text-rose {
  color: #f87171;
}
.msg-menu-btn.text-rose:hover {
  background: rgba(248, 113, 113, 0.12);
}

.msg-menu-btn.text-amber {
  color: #fbbf24;
}
.msg-menu-btn.text-amber:hover {
  background: rgba(251, 191, 36, 0.12);
}

.message-bubble-card {
  display: inline-block;
  max-width: 100%;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 18px 18px 18px 4px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  box-shadow: var(--card-shadow);
  word-break: break-word;
  transition: transform 0.15s;
}

.message-bubble-card.is-mine {
  border-radius: 18px 18px 4px 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff !important;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

/* Cluster shape for received messages (Left) */
.message-bubble-row.cluster-top .message-bubble-card {
  border-radius: 18px 18px 18px 4px;
}
.message-bubble-row.cluster-middle .message-bubble-card {
  border-radius: 4px 18px 18px 4px;
}
.message-bubble-row.cluster-bottom .message-bubble-card {
  border-radius: 4px 18px 18px 18px;
}
.message-bubble-row.cluster-single .message-bubble-card {
  border-radius: 18px 18px 18px 18px;
}

/* Cluster shape for sent messages (Right) */
.message-bubble-row.is-mine.cluster-top .message-bubble-card {
  border-radius: 18px 18px 4px 18px;
}
.message-bubble-row.is-mine.cluster-middle .message-bubble-card {
  border-radius: 18px 4px 4px 18px;
}
.message-bubble-row.is-mine.cluster-bottom .message-bubble-card {
  border-radius: 18px 4px 18px 18px;
}
.message-bubble-row.is-mine.cluster-single .message-bubble-card {
  border-radius: 18px 18px 18px 18px;
}

/* Emoji only messages */
.message-bubble-card.is-emoji-only {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 4px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.msg-text-span.emoji-big {
  font-size: 38px;
  line-height: 1.15;
  display: inline-block;
  transform-origin: center;
  animation: emojiPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

@keyframes emojiPop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.message-bubble-card.is-media {
  padding: 4px;
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

.message-bubble-card.is-deleted {
  font-style: italic;
  opacity: 0.6;
  border: 1px dashed var(--border-secondary);
  background: var(--bg-hover) !important;
}

.msg-images-grid {
  display: grid;
  gap: 6px;
  max-width: 320px;
  border-radius: 14px;
  overflow: hidden;
  grid-template-columns: 1fr;
}

.msg-images-grid.multi {
  grid-template-columns: repeat(2, 1fr);
}

.msg-attached-img {
  width: 100%;
  max-width: 300px;
  max-height: 300px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  border-radius: 14px;
  border: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
  transition: transform 0.2s;
}

.msg-attached-img:hover {
  transform: scale(1.02);
}

.msg-audio-player {
  max-width: 240px;
  height: 36px;
  display: block;
}

.msg-text-span {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 3px;
  padding: 0 4px;
}

.message-meta-row.is-mine {
  justify-content: flex-end;
}

.read-receipt-tag {
  color: var(--brand);
  font-weight: 700;
  font-size: 11px;
}

.edited-tag {
  opacity: 0.7;
}

/* Typing Indicator */
.typing-indicator-bar {
  padding: 6px 20px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-dots {
  display: inline-flex;
  gap: 3px;
}

.typing-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--brand);
  animation: typing-dot 1.2s infinite ease-in-out;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

/* ══════════════════════════════════════════
   CHAT INPUT COMPOSER DOCK (FIX SQUEEZED BUG)
══════════════════════════════════════════ */
.chat-input-composer-card {
  padding: 10px 16px;
  background: var(--bg-card);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-top: 1px solid var(--border-primary);
  margin-top: auto;
  position: relative;
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
}

.input-notice-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  gap: 8px;
  line-height: 1.4;
}

.input-notice-banner.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

.input-notice-banner.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.composer-action-strip {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.composer-media-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding-bottom: 2px;
}

.btn-composer-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-composer-icon:hover {
  background: var(--bg-hover);
  transform: scale(1.08);
}

.btn-composer-icon.gif-label {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.composer-input-field-wrap {
  flex: 1;
  min-width: 60px; /* Never squeezes text */
  position: relative;
  display: flex;
  flex-direction: column;
}

.editing-banner {
  font-size: 11.5px;
  color: #a5b4fc;
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
}

.btn-cancel-edit {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11.5px;
}

.textarea-relative-box {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.chat-main-textarea {
  width: 100%;
  min-width: 0;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  border-radius: 18px;
  padding: 9px 36px 9px 14px;
  font-size: 13.5px;
  line-height: 1.4;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  resize: none;
  overflow-y: auto;
  min-height: 38px;
  max-height: 110px;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-main-textarea:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px var(--brand-light);
}

.btn-emoji-inside {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-emoji-inside:hover {
  color: var(--brand);
  background: var(--bg-hover);
}

.btn-send-message {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1px;
}

.btn-send-message:hover {
  transform: scale(1.06);
  filter: brightness(1.1);
}

.btn-quick-emoji {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
  margin-bottom: 1px;
}

.btn-quick-emoji:hover {
  transform: scale(1.2);
}

/* Voice Recording Bar */
.recording-active-strip {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 18px;
  padding: 6px 14px;
}

.rec-live-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rec-red-pulse {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: pulse 1s infinite;
}

.rec-timer {
  font-size: 13.5px;
  color: var(--text-primary);
  font-weight: 700;
}

.rec-text {
  font-size: 12px;
  color: var(--text-muted);
}

.rec-buttons-row {
  display: flex;
  gap: 6px;
}

.btn-rec-cancel {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  padding: 3px 6px;
}

.btn-rec-send {
  background: #ef4444;
  border: none;
  color: #fff;
  border-radius: 99px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 700;
  padding: 3px 12px;
}

/* Popover Panels */
.popover-panel {
  position: absolute;
  background: var(--popover-bg);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(24px);
  z-index: 40;
  animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.emoji-panel {
  bottom: 50px;
  right: 0;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.btn-emoji-item {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: transform 0.15s, background 0.15s;
}

.btn-emoji-item:hover {
  background: var(--bg-hover);
  transform: scale(1.2);
}

.sticker-panel {
  bottom: 50px;
  left: 0;
  width: 270px;
  max-height: 220px;
  overflow-y: auto;
  padding: 10px;
}

.stickers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.btn-sticker-item {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 10px;
  aspect-ratio: 1;
  transition: transform 0.15s, background 0.15s;
}

.btn-sticker-item:hover {
  background: var(--bg-hover);
  transform: scale(1.1);
}

.btn-sticker-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gif-panel {
  bottom: 50px;
  left: 30px;
  width: 290px;
  height: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gif-search-box {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-primary);
}

.gif-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 12.5px;
  outline: none;
  box-sizing: border-box;
}

.gifs-grid {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.gif-item {
  width: 100%;
  height: 85px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s;
}

.gif-item:hover {
  transform: scale(1.04);
}

/* ══════════════════════════════════════════
   RIGHT COLUMN: CHAT INFO FLOATING SIDEBAR
══════════════════════════════════════════ */
.chat-info-col {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  max-width: 85vw;
  flex-shrink: 0;
  border-left: 1px solid var(--border-primary);
  background: var(--bg-card);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  z-index: 40;
  animation: slideLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-close-btn {
  display: flex;
  position: absolute;
  top: 14px;
  left: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.info-close-btn:hover {
  background: var(--bg-hover);
  transform: scale(1.05);
}

.sidebar-hero-section {
  padding: 24px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid var(--border-primary);
  position: relative;
  text-align: center;
}

.sidebar-avatar-glow-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;
  border: 2px solid var(--border-primary);
  box-shadow: var(--card-shadow);
}

.sidebar-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
}

.sidebar-user-name {
  font-size: 16.5px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.sidebar-user-handle {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 8px;
}

.sidebar-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 14px;
}

.sidebar-quick-actions {
  display: flex;
  gap: 16px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  transition: color 0.2s;
}

.quick-action-item:hover {
  color: var(--text-primary);
}

.quick-action-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.2s;
}

.quick-action-icon:hover,
.quick-action-icon.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
}

.quick-action-icon.muted {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

/* ══════════════════════════════════════════
   WELCOME EMPTY STAGE
══════════════════════════════════════════ */
.chat-welcome-empty-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.welcome-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  opacity: 0.25;
}

.welcome-orb.glow-1 {
  top: 25%;
  left: 20%;
  width: 280px;
  height: 280px;
  background: #6366f1;
}

.welcome-orb.glow-2 {
  bottom: 25%;
  right: 20%;
  width: 240px;
  height: 240px;
  background: #ec4899;
}

.welcome-icon-box {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  margin-bottom: 18px;
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.2);
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px;
  position: relative;
  z-index: 2;
  letter-spacing: -0.5px;
}

.welcome-desc {
  font-size: 13.5px;
  color: var(--text-muted);
  max-width: 320px;
  margin: 0;
  line-height: 1.5;
  position: relative;
  z-index: 2;
}

/* Animations */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes typing-dot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1.1); }
}

/* Responsive Mobile */
.mobile-back-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
}

@media (max-width: 900px) {
  .chat-list-col {
    width: 100% !important;
    max-width: 100% !important;
  }
  .chat-list-col.hidden-on-mobile {
    display: none !important;
  }
  .chat-main-col.hidden-on-mobile {
    display: none !important;
  }
  .mobile-back-btn {
    display: flex !important;
  }
}

@media (max-width: 600px) {
  .chat-input-composer-card {
    padding: 6px 8px !important;
  }
  .composer-action-strip {
    gap: 3px !important;
  }
  .composer-media-toolbar {
    gap: 1px !important;
  }
  .btn-composer-icon {
    width: 26px !important;
    height: 26px !important;
    padding: 0 !important;
  }
  .btn-composer-icon svg {
    width: 16px !important;
    height: 16px !important;
  }
  .btn-composer-icon.gif-label {
    font-size: 9px !important;
  }
  .composer-input-field-wrap {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  .chat-main-textarea {
    padding: 7px 28px 7px 10px !important;
    font-size: 13px !important;
    min-height: 34px !important;
    border-radius: 16px !important;
    line-height: 1.3 !important;
  }
  .btn-emoji-inside {
    right: 3px !important;
    padding: 3px !important;
  }
  .btn-emoji-inside svg {
    width: 16px !important;
    height: 16px !important;
  }
  .btn-send-message,
  .btn-quick-emoji {
    width: 30px !important;
    height: 30px !important;
    font-size: 17px !important;
    flex-shrink: 0 !important;
  }
  .btn-send-message svg {
    width: 15px !important;
    height: 15px !important;
  }
}
</style>