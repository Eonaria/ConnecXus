<template>
  <div class="composer-root-card" :class="{ 'has-open-dropdown': showAudienceDropdown }">
    <!-- User Avatar -->
    <div class="composer-avatar-wrapper">
      <div
        class="composer-avatar-circle"
        :style="user?.avatar_url
          ? `background-image: url(${user.avatar_url});`
          : 'background: linear-gradient(135deg, #6366f1, #8b5cf6);'
        "
      >
        <span v-if="!user?.avatar_url">{{ userAvatarText }}</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="composer-content-box">
      <div @click="focusInput" class="composer-textarea-container">
        <textarea
          ref="inputRef"
          v-model="content"
          placeholder="มีอะไรเกิดขึ้นบ้าง? เล่าให้ทุกคนฟัง..."
          class="composer-textarea"
          rows="1"
          @input="autoResize"
          :readonly="!user"
          @click="checkAuthAndOpen('โพสต์ข้อความ')"
          @keydown.ctrl.enter="submitPost"
        />
      </div>

      <!-- Multi-Media / GIF / Video Preview Grid -->
      <div v-if="mediaList.length > 0" class="composer-media-grid-wrap">
        <div class="composer-media-header">
          <span class="media-count-badge" :class="{ 'is-over-limit': mediaList.length > MAX_MEDIA_LIMIT }">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>แนบสื่อ {{ mediaList.length }} รายการ</span>
          </span>
          <span v-if="mediaList.some(m => m.isGif)" class="gif-order-notice">
            * GIF จะแสดงเป็นรูปแรกเสมอ
          </span>
        </div>

        <div
          class="composer-previews-container"
          :class="{
            'is-single': mediaList.length === 1,
            'is-multiple': mediaList.length > 1
          }"
        >
          <div
            v-for="(item, index) in mediaList"
            :key="item.id"
            class="composer-preview-item"
            :class="{ 'is-gif-item': item.isGif }"
          >
            <video
              v-if="item.isVideo"
              :src="item.previewUrl"
              controls
              class="composer-preview-media"
            ></video>
            <img
              v-else
              :src="item.previewUrl"
              alt="Preview"
              class="composer-preview-media"
            />
            
            <!-- GIF Badge -->
            <span v-if="item.isGif" class="composer-gif-badge">GIF #1</span>

            <!-- Remove Button -->
            <button
              type="button"
              @click.stop="removeMediaItem(index)"
              class="btn-remove-preview"
              :title="`ลบรายการที่ ${index + 1}`"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Uploading progress indicator -->
      <div v-if="uploading" class="composer-upload-badge">
        <div class="upload-spinner"></div>
        <span>กำลังอัปโหลดสื่อ ({{ uploadingCount }} ไฟล์)...</span>
      </div>

      <!-- Bottom Toolbar -->
      <div class="composer-bottom-bar">
        <!-- Media Action Buttons -->
        <div class="composer-actions-left">
          <!-- Image / Video Picker -->
          <button
            @click="triggerImagePicker"
            title="แนบรูปภาพหรือวิดีโอ"
            class="composer-tool-btn"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span class="tool-label-text">รูปภาพ</span>
          </button>

          <!-- GIF Picker -->
          <button
            @click="triggerGifPicker"
            title="เลือกไฟล์ GIF"
            class="composer-tool-btn gif-btn"
          >
            <span class="gif-pill-text">GIF</span>
          </button>

          <!-- Quick Emoji Trigger -->
          <div class="emoji-picker-container">
            <button
              type="button"
              @click.stop="toggleEmojiPicker"
              title="ใส่อีโมจิ"
              class="composer-tool-btn"
              :class="{ 'is-active': showEmojiPicker }"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </button>
          </div>

          <!-- Hidden File Inputs -->
          <input
            ref="imageInputRef"
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            style="display: none;"
            @change="handleFileSelected"
          />
          <input
            ref="gifInputRef"
            type="file"
            accept="image/gif"
            style="display: none;"
            @change="handleGifSelected"
          />
        </div>

        <!-- Post Action Right -->
        <div class="composer-actions-right">
          <!-- Audience Selector Pill -->
          <div class="composer-audience-wrapper" @click.stop>
            <button
              type="button"
              @click="showAudienceDropdown = !showAudienceDropdown"
              class="btn-audience-selector"
              :class="`audience-${selectedVisibility}`"
              title="กำหนดกลุ่มเป้าหมายของโพสต์"
            >
              <!-- 🌐 Public -->
              <svg v-if="selectedVisibility === 'public'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <!-- 👥 Followers -->
              <svg v-else-if="selectedVisibility === 'followers'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <!-- 🤝 Mutual -->
              <svg v-else-if="selectedVisibility === 'mutual'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <!-- 🔒 Private -->
              <svg v-else-if="selectedVisibility === 'private'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>{{ getAudienceLabel(selectedVisibility) }}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="chevron-down">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Audience Dropdown Menu -->
            <div v-if="showAudienceDropdown" class="audience-popover-menu">
              <button
                type="button"
                class="audience-menu-item"
                :class="{ 'is-active': selectedVisibility === 'public' }"
                @click="selectedVisibility = 'public'; showAudienceDropdown = false"
              >
                <div class="aud-item-icon green">🌐</div>
                <div class="aud-item-info">
                  <div class="aud-item-title">สาธารณะ</div>
                  <div class="aud-item-sub">ทุกคนมองเห็นได้</div>
                </div>
              </button>
              <button
                type="button"
                class="audience-menu-item"
                :class="{ 'is-active': selectedVisibility === 'followers' }"
                @click="selectedVisibility = 'followers'; showAudienceDropdown = false"
              >
                <div class="aud-item-icon blue">👥</div>
                <div class="aud-item-info">
                  <div class="aud-item-title">คนที่ติดตามฉัน</div>
                  <div class="aud-item-sub">ผู้ติดตามทั้งหมด</div>
                </div>
              </button>
              <button
                type="button"
                class="audience-menu-item"
                :class="{ 'is-active': selectedVisibility === 'mutual' }"
                @click="selectedVisibility = 'mutual'; showAudienceDropdown = false"
              >
                <div class="aud-item-icon purple">🤝</div>
                <div class="aud-item-info">
                  <div class="aud-item-title">เพื่อนที่ติดตามกัน</div>
                  <div class="aud-item-sub">ติดตามซึ่งกันและกัน</div>
                </div>
              </button>
              <button
                type="button"
                class="audience-menu-item"
                :class="{ 'is-active': selectedVisibility === 'private' }"
                @click="selectedVisibility = 'private'; showAudienceDropdown = false"
              >
                <div class="aud-item-icon red">🔒</div>
                <div class="aud-item-info">
                  <div class="aud-item-title">เฉพาะฉัน</div>
                  <div class="aud-item-sub">ปิดเป็นส่วนตัว</div>
                </div>
              </button>
            </div>
          </div>

          <span v-if="content.length > 0" class="char-counter" :class="{ 'near-limit': content.length > 240 }">
            {{ 280 - content.length }}
          </span>

          <button
            @click="submitPost"
            :disabled="(!content.trim() && mediaList.length === 0) || loading || uploading || isSubmitting"
            class="btn-submit-post"
          >
            <span v-if="!loading && !isSubmitting">โพสต์</span>
            <span v-else class="loading-dots">กำลังโพสต์...</span>
            <svg v-if="!loading && !isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           EXPANDABLE FULL EMOJI TRAY (400+ Emojis)
      ══════════════════════════════════════════ -->
      <transition name="tray-slide">
        <div v-if="showEmojiPicker" class="composer-emoji-tray">
          <!-- Header: Search Bar + Close -->
          <div class="emoji-tray-header">
            <div class="emoji-search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                v-model="emojiSearch"
                type="text"
                placeholder="ค้นหาอิโมจิ (ยิ้ม, หัวใจ, แมว, food, fire...)"
                class="emoji-search-input"
              />
              <button v-if="emojiSearch" @click="emojiSearch = ''" class="btn-clear-emoji-search" type="button">✕</button>
            </div>
            <button @click="showEmojiPicker = false" class="btn-close-emoji-tray" type="button" title="ปิดแท็บอิโมจิ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="18" x2="18" y2="6"></line>
              </svg>
            </button>
          </div>

          <!-- Category Navigation Tabs -->
          <div v-if="!emojiSearch.trim()" class="emoji-categories-nav">
            <button
              v-for="cat in emojiCategories"
              :key="cat.id"
              type="button"
              @click="activeEmojiCategory = cat.id"
              class="btn-emoji-cat"
              :class="{ 'is-active': activeEmojiCategory === cat.id }"
              :title="cat.name"
            >
              <span class="cat-icon">{{ cat.icon }}</span>
              <span class="cat-name-label">{{ cat.name }}</span>
            </button>
          </div>

          <!-- Emoji Scrollable Grid -->
          <div class="emoji-scroll-body">
            <div v-if="displayedEmojiList.length > 0" class="emoji-items-grid">
              <button
                v-for="em in displayedEmojiList"
                :key="em"
                type="button"
                @click="insertEmoji(em)"
                class="btn-quick-emoji-item"
              >
                {{ em }}
              </button>
            </div>
            <div v-else class="emoji-not-found">
              <span>ไม่พบอิโมจิที่ตรงกับ "{{ emojiSearch }}"</span>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  communityId?: number | null
  communityName?: string | null
  isCommunityOnlyDefault?: boolean
}>(), {
  communityId: null,
  communityName: null,
  isCommunityOnlyDefault: false
})

const { user } = useAuth()
const { openLoginModal } = useLoginModal()
const emit = defineEmits(['posted'])

const content = ref('')
const loading = ref(false)
const uploading = ref(false)
const isCommunityOnly = ref(props.isCommunityOnlyDefault)
const showEmojiPicker = ref(false)

watch(() => props.isCommunityOnlyDefault, (val) => {
  isCommunityOnly.value = val
})
const activeEmojiCategory = ref('popular')
const emojiSearch = ref('')

const emojiCategories = [
  { id: 'popular', name: 'ยอดนิยม', icon: '✨' },
  { id: 'smileys', name: 'อารมณ์', icon: '😀' },
  { id: 'gestures', name: 'ท่าทาง', icon: '👋' },
  { id: 'hearts', name: 'หัวใจ', icon: '💖' },
  { id: 'animals', name: 'สัตว์', icon: '🐶' },
  { id: 'food', name: 'อาหาร', icon: '🍔' },
  { id: 'travel', name: 'ท่องเที่ยว', icon: '🚀' },
  { id: 'objects', name: 'สิ่งของ', icon: '💡' },
  { id: 'flags', name: 'สัญลักษณ์', icon: '🇹🇭' },
]

const emojiData: Record<string, string[]> = {
  popular: [
    '😀', '😂', '🤣', '😍', '🥰', '😎', '🤔', '😭', '🥺', '😡', '🔥', '✨', '🚀', '❤️', '💖', '👍',
    '👏', '🎉', '💡', '💯', '🙏', '👀', '🥳', '🤩', '😻', '🤝', '💪', '🤤', '☕', '🌟', '✌️', '🙌',
    '🎈', '💸', '🏆', '💥', '🌹', '🍕', '🍻', '☀️', '💎', '👑', '🌈', '⚡', '😇', '😋', '😜', '🤫'
  ],
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '☺️', '😊', '😇', '🙂', '🙃', '😉',
    '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
    '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
    '😢', '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
    '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠', '🤥', '😶', '😐', '😑', '😬', '🫨', '😯', '😦',
    '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕',
    '🤑', '🤠', '😈', '👿', '🤡', '💩', '👻', '💀', '👽', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼'
  ],
  gestures: [
    '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫸', '🫷', '🫳', '🫴', '👌', '🤌', '🤏', '✌️', '🤞',
    '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛',
    '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
    '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦', '👶', '👧', '🧒',
    '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲'
  ],
  hearts: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓',
    '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '💯', '✨', '⭐', '🌟',
    '💫', '💥', '💢', '💦', '💨', '🔥', '⚡', '🌈', '☀️', '⛅', '🌧️', '❄️', '⛄', '🎆', '🎇', '🧨',
    '🎈', '🎏', '🎀', '🎁', '🔮', '🧿', '🪄', '🔔', '🔕', '💬', '💭', '🗯️', '♠️', '♥️', '♦️', '♣️'
  ],
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🌲', '🌳', '🌴', '🌵', '🌾',
    '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌸', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱',
    '🪴', '🌊', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐢'
  ],
  food: [
    '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥',
    '🥝', '🍅', '🥑', '🥦', '🌶️', '🌽', '🥕', '🥔', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳',
    '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘',
    '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍢', '🍧', '🍨', '🍦', '🍰', '🎂',
    '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🥛', '☕', '🍵', '🧋', '🧃', '🥤', '🍺', '🍻', '🍷'
  ],
  travel: [
    '🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚜', '🚲', '🛵', '🏍️', '🚨', '✈️',
    '🛫', '🛬', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛳️', '⚓', '🚧', '🚦', '⛽', '🗺️', '🗼', '🏰',
    '🏟️', '🎡', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏕️', '🏠', '🏢', '🏬', '🏦', '🏨', '🏫', '🏥', '⛺'
  ],
  objects: [
    '📱', '💻', '⌨️', '🖥️', '🖨️', '📷', '📹', '🎥', '🔍', '🔬', '🔭', '📡', '⏰', '⏳', '🔋', '🔌',
    '💡', '🔦', '🏮', '💰', '💵', '💳', '💎', '🔑', '🔒', '🔓', '📦', '✉️', '📝', '📁', '📊', '📈',
    '📌', '📎', '✂️', '🧰', '🔫', '💣', '🛡️', '🎮', '🕹️', '🎲', '🎯', '🎨', '🎬', '🎤', '🎧', '🎼',
    '🎹', '🎸', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🥊', '⚽', '🏀', '🏈', '⚾', '🎾', '🎱', '🛹'
  ],
  flags: [
    '🇹🇭', '🇯🇵', '🇰🇷', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇨🇳', '🇦🇺', '🇮🇹', '🇨🇦', '🇧🇷', '🇷🇺', '🇮🇳', '🇸🇬', '🇲🇾',
    '🇻🇳', '🇵🇭', '🇮🇩', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '⚠️', '⛔', '🚫', '❓', '❗', '🆗',
    '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'
  ]
}

const emojiKeywordMap: Record<string, string> = {
  '😀': 'ยิ้ม ดีใจ หัวเราะ smile happy laugh grin',
  '😃': 'ยิ้ม ดีใจ smile happy',
  '😄': 'ยิ้ม ดีใจ laugh happy',
  '😁': 'ยิ้ม ยิงฟัน grin happy',
  '😆': 'หัวเราะ ขำ laugh',
  '😅': 'เหงื่อตก ยิ้ม sweat smile',
  '😂': 'หัวเราะ น้ำตาไหล ขำ joy laugh cry',
  '🤣': 'ขำกลิ้ง ตลก rofl laugh',
  '🥹': 'ซึ้งใจ น้ำตาคลอ proud cry',
  '😍': 'รัก ชอบ ตาหัวใจ love heart eyes',
  '🥰': 'รัก อบอุ่น ฟิน in love hearts',
  '😘': 'จุ๊บ ส่งจูบ kiss love',
  '😎': 'เท่ คูล แว่นกันแดด cool sunglasses',
  '🤔': 'คิด สงสัย think question',
  '😭': 'ร้องไห้ เสียใจ cry sad sob',
  '🥺': 'อ้อน ขอร้อง plead puppy eyes',
  '😡': 'โกรธ โมโห angry rage',
  '🤬': 'ด่า โกรธมาก curse swear',
  '🤯': 'หัวระเบิด ตะลึง mind blown shock',
  '🥵': 'ร้อน hot sweat',
  '🥶': 'หนาว เย็น cold freeze',
  '😱': 'ตกใจ กลัว scream fear',
  '😴': 'นอน ง่วง sleep tired',
  '🤤': 'หิว น้ำลายไหล drool hungry',
  '🥳': 'ฉลอง ปาร์ตี้ party celebrate',
  '🤑': 'เงิน รวย money rich',
  '💩': 'อึ ขี้ poop',
  '🔥': 'ไฟ ร้อนแรง ฮอต fire hot lit',
  '✨': 'วิ้ง ประกาย สวย sparkle shine star',
  '🚀': 'จรวด พุ่ง บิน rocket launch speed',
  '❤️': 'หัวใจ สีแดง รัก heart red love',
  '💖': 'หัวใจ ประกาย รัก sparkle heart love',
  '💔': 'อกหัก เสียใจ broken heart sad',
  '👍': 'ไลค์ ดี เยี่ยม like thumbs up good',
  '👎': 'ไม่ดี แย่ dislike thumbs down bad',
  '👏': 'ปรบมือ เก่ง clap applaud bravo',
  '🎉': 'ฉลอง ปาร์ตี้ party celebrate popper',
  '💡': 'ความคิด หลอดไฟ ไอเดีย idea bulb light',
  '💯': 'ร้อย เต็ม perfect 100 hundred',
  '🙏': 'ไหว้ ขอบคุณ สาธุ pray please thank',
  '👀': 'ตา มอง ดู eyes look see',
  '😻': 'แมวรัก cat love',
  '🐶': 'หมา สุนัข dog puppy',
  '🐱': 'แมว cat kitten',
  '☕': 'กาแฟ coffee drink cafe',
  '🍔': 'เบอร์เกอร์ burger food',
  '🍕': 'พิซซ่า pizza food',
  '🍻': 'เบียร์ ชนแก้ว cheers beer drink',
  '🇹🇭': 'ไทย ประเทศไทย thailand thai flag',
}

const displayedEmojiList = computed(() => {
  const search = emojiSearch.value.trim().toLowerCase()
  if (!search) {
    return emojiData[activeEmojiCategory.value] || emojiData.popular
  }

  // Search through all emojis
  const all = Object.values(emojiData).flat()
  const unique = Array.from(new Set(all))

  return unique.filter((em) => {
    if (em.includes(search)) return true
    const keywords = emojiKeywordMap[em] || ''
    return keywords.toLowerCase().includes(search)
  })
})

const inputRef = ref<HTMLTextAreaElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const gifInputRef = ref<HTMLInputElement | null>(null)

interface MediaItem {
  id: string
  url: string
  previewUrl: string
  isGif: boolean
  isVideo: boolean
}

const MAX_MEDIA_LIMIT = 30
const mediaList = ref<MediaItem[]>([])
const uploadingCount = ref(0)

const userAvatarText = computed(() => {
  if (user.value?.display_name) return user.value.display_name.trim().slice(0, 2)
  return 'ผ'
})

function checkAuthAndOpen(actionMsg: string) {
  if (!user.value) {
    openLoginModal(`กรุณาเข้าสู่ระบบเพื่อ${actionMsg}`)
    if (inputRef.value) inputRef.value.blur()
    return false
  }
  return true
}

function focusInput() {
  if (checkAuthAndOpen('โพสต์ข้อความ')) {
    inputRef.value?.focus()
  }
}

function autoResize() {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 260) + 'px'
  }
}

function toggleEmojiPicker() {
  if (checkAuthAndOpen('ใส่อีโมจิ')) {
    showEmojiPicker.value = !showEmojiPicker.value
  }
}

function insertEmoji(em: string) {
  if (inputRef.value) {
    const start = inputRef.value.selectionStart || content.value.length
    const end = inputRef.value.selectionEnd || content.value.length
    content.value = content.value.substring(0, start) + em + content.value.substring(end)
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.selectionStart = inputRef.value.selectionEnd = start + em.length
        inputRef.value.focus()
      }
      autoResize()
    })
  } else {
    content.value += em
    autoResize()
  }
}

function triggerImagePicker() {
  if (checkAuthAndOpen('แนบรูปภาพหรือวิดีโอ')) {
    imageInputRef.value?.click()
  }
}

function triggerGifPicker() {
  if (checkAuthAndOpen('ส่ง GIF')) {
    gifInputRef.value?.click()
  }
}

function reorderMedia() {
  // Requirement: "เวลาส่ง GIF พร้อมกับภาพ GIF ต้องขึ้นหน้าแรกก่อนเสมอ"
  mediaList.value.sort((a, b) => {
    if (a.isGif && !b.isGif) return -1
    if (!a.isGif && b.isGif) return 1
    return 0
  })
}

function removeMediaItem(index: number) {
  mediaList.value.splice(index, 1)
  if (mediaList.value.length === 0) {
    if (imageInputRef.value) imageInputRef.value.value = ''
    if (gifInputRef.value) gifInputRef.value.value = ''
  }
}

function checkVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = function() {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = function() {
      URL.revokeObjectURL(video.src)
      reject('ไฟล์วิดีโอไม่ถูกต้อง')
    }
    video.src = URL.createObjectURL(file)
  })
}

async function uploadFiles(files: FileList | File[], isGif = false) {
  const fileArray = Array.from(files)
  if (fileArray.length === 0) return

  const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB (ป้องกันเว็บทำงานหนักเกินไป)
  const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20 MB สำหรับรูปภาพ
  const FACEBOOK_MAX_VIDEO_DURATION = 240 * 60 // 240 mins (มาตรฐาน Facebook)

  const validFiles: File[] = []
  for (const f of fileArray) {
    if (f.type.startsWith('video/')) {
      if (f.size > MAX_VIDEO_SIZE) {
        alert(`วิดีโอ "${f.name}" มีขนาดเกิน 100MB (ขนาดใหญ่เกินไปอาจทำให้ระบบทำงานหนัก)`)
        continue
      }
      try {
        const duration = await checkVideoDuration(f)
        if (duration > FACEBOOK_MAX_VIDEO_DURATION) {
          alert(`วิดีโอ "${f.name}" มีความยาวเกิน 240 นาที (ตามมาตรฐาน Facebook)`)
          continue
        }
      } catch (e) {
        alert(`วิดีโอ "${f.name}" ไม่สามารถอ่านข้อมูลได้`)
        continue
      }
    } else if (f.type.startsWith('image/')) {
      if (f.size > MAX_IMAGE_SIZE) {
        alert(`รูปภาพ "${f.name}" มีขนาดเกิน 20MB`)
        continue
      }
    }
    validFiles.push(f)
  }

  if (validFiles.length === 0) {
    if (imageInputRef.value) imageInputRef.value.value = ''
    if (gifInputRef.value) gifInputRef.value.value = ''
    return
  }

  const remainingSlots = MAX_MEDIA_LIMIT - mediaList.value.length
  if (remainingSlots <= 0) {
    alert(`สามารถส่งรูปภาพได้สูงสุด ${MAX_MEDIA_LIMIT} ภาพต่อโพสต์`)
    return
  }

  let toUpload = validFiles
  if (validFiles.length > remainingSlots) {
    alert(`คุณเลือกรูปภาพ/วิดีโอเกินจำนวนที่กำหนด ระบบสามารถแนบได้สูงสุด ${MAX_MEDIA_LIMIT} ไฟล์ต่อโพสต์ (เลือกเพิ่มได้อีก ${remainingSlots} ไฟล์)`)
    toUpload = validFiles.slice(0, remainingSlots)
  }

  uploading.value = true
  uploadingCount.value = toUpload.length

  try {
    const formData = new FormData()
    toUpload.forEach(f => {
      formData.append('files', f, f.name)
    })

    const res = await $fetch<{ success: boolean; url: string; urls?: string[] }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (res.success) {
      const urls = res.urls && res.urls.length > 0 ? res.urls : [res.url]
      urls.forEach((uploadedUrl, i) => {
        const f = toUpload[i]
        const fname = (f?.name || uploadedUrl).toLowerCase()
        const itemIsGif = isGif || fname.endsWith('.gif')
        const itemIsVideo = fname.endsWith('.mp4') || fname.endsWith('.webm') || fname.endsWith('.mov')
        
        mediaList.value.push({
          id: `${Date.now()}-${Math.random()}`,
          url: uploadedUrl,
          previewUrl: uploadedUrl,
          isGif: itemIsGif,
          isVideo: itemIsVideo
        })
      })

      // Ensure GIF is always in first position
      reorderMedia()
    }
  } catch (err: any) {
    alert('อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  } finally {
    uploading.value = false
    uploadingCount.value = 0
    if (imageInputRef.value) imageInputRef.value.value = ''
    if (gifInputRef.value) gifInputRef.value.value = ''
  }
}

function handleFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  uploadFiles(input.files, false)
}

function handleGifSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  uploadFiles(input.files, true)
}

const showAudienceDropdown = ref(false)
const selectedVisibility = ref<'public' | 'followers' | 'mutual' | 'private'>('public')

function getAudienceLabel(vis: string) {
  switch (vis) {
    case 'followers': return 'ผู้ติดตาม'
    case 'mutual': return 'เพื่อน'
    case 'private': return 'เฉพาะฉัน'
    default: return 'สาธารณะ'
  }
}

onMounted(() => {
  const handleOutsideClick = () => {
    if (showAudienceDropdown.value) {
      showAudienceDropdown.value = false
    }
  }
  window.addEventListener('click', handleOutsideClick)
  onUnmounted(() => {
    window.removeEventListener('click', handleOutsideClick)
  })
})

const isSubmitting = ref(false)

async function submitPost() {
  if (!checkAuthAndOpen('โพสต์ข้อความ')) return
  const hasContent = Boolean(content.value.trim())
  const hasMedia = mediaList.value.length > 0
  if ((!hasContent && !hasMedia) || loading.value || uploading.value || isSubmitting.value) return
  
  if (mediaList.value.length > MAX_MEDIA_LIMIT) {
    alert(`ไม่สามารถโพสต์ได้: สามารถส่งรูปภาพได้สูงสุด ${MAX_MEDIA_LIMIT} ภาพต่อโพสต์ กรุณาลดจำนวนภาพก่อนโพสต์`)
    return
  }

  isSubmitting.value = true
  loading.value = true
  try {
    reorderMedia()
    const urls = mediaList.value.map(m => m.url).filter(Boolean)
    const payload = {
      content: content.value.trim(),
      image_url: urls.length === 1 ? urls[0] : (urls.length > 1 ? urls : null),
      is_community_only: Boolean(props.isCommunityOnlyDefault),
      visibility: selectedVisibility.value
    }
    content.value = ''
    mediaList.value = []
    if (inputRef.value) inputRef.value.style.height = 'auto'
    
    emit('posted', payload)
  } finally {
    setTimeout(() => {
      isSubmitting.value = false
      loading.value = false
    }, 600)
  }
}
</script>

<style scoped>
.composer-root-card {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  gap: 14px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: background 0.2s;
  position: relative;
  z-index: 25;
  overflow: visible;
}

.composer-root-card.has-open-dropdown {
  z-index: 45;
}

.composer-root-card:focus-within {
  background: var(--bg-card);
}

.composer-avatar-wrapper {
  flex-shrink: 0;
}

.composer-avatar-circle {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.composer-avatar-circle:hover {
  transform: scale(1.05);
  border-color: var(--brand);
}

.composer-content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.composer-textarea-container {
  padding: 6px 0 10px;
  cursor: text;
  min-height: 48px;
}

.composer-textarea {
  width: 100%;
  border: none;
  outline: none;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-primary);
  background: transparent;
  font-family: inherit;
  resize: none;
  overflow-y: auto;
  min-height: 38px;
  line-height: 1.5;
  box-sizing: border-box;
}

.composer-textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.75;
  font-weight: 400;
}

/* Multi-Media Grid Preview */
.composer-media-grid-wrap {
  margin-bottom: 14px;
}

.composer-media-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.media-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: var(--brand-light, rgba(99, 102, 241, 0.12));
  color: var(--brand, #6366f1);
  border-radius: 99px;
  font-weight: 700;
}

.gif-order-notice {
  font-size: 11.5px;
  color: #10b981;
  font-weight: 600;
}

.composer-previews-container {
  display: grid;
  gap: 8px;
  border-radius: 16px;
  overflow: hidden;
}

.composer-previews-container.is-single {
  grid-template-columns: 1fr;
  max-height: 480px;
}

.composer-previews-container.is-multiple {
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  max-height: 380px;
  overflow-y: auto;
  padding: 4px;
  background: var(--bg-tertiary, rgba(0, 0, 0, 0.05));
  border: 1px solid var(--border-primary);
}

.composer-preview-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.composer-previews-container.is-single .composer-preview-item {
  aspect-ratio: auto;
  max-height: 480px;
}

.composer-preview-item:hover {
  border-color: var(--brand);
}

.composer-preview-item.is-gif-item {
  border-color: #10b981;
}

.composer-preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.composer-previews-container.is-single .composer-preview-media {
  object-fit: contain;
  max-height: 480px;
}

.composer-gif-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 6px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.btn-remove-preview {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(15, 15, 20, 0.8);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2;
}

.btn-remove-preview:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.15);
}

.composer-tool-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.composer-upload-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--brand);
  font-weight: 600;
  margin-bottom: 10px;
}

.upload-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Bottom Toolbar */
.composer-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-primary);
  padding-top: 12px;
  margin-top: 4px;
}

.composer-actions-left {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.composer-tool-btn {
  height: 34px;
  padding: 0 10px;
  border-radius: 99px;
  background: var(--brand-light);
  border: 1px solid rgba(99, 102, 241, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--brand);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.composer-tool-btn:hover {
  background: var(--brand);
  border-color: var(--brand);
  color: #ffffff;
  transform: translateY(-1px);
}

.tool-label-text {
  font-size: 12px;
}

.composer-tool-btn.gif-btn {
  padding: 0 12px;
}

.gif-pill-text {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.composer-tool-btn.is-active {
  background: var(--brand);
  border-color: var(--brand);
  color: #ffffff;
}

.emoji-picker-container {
  position: relative;
}

/* ══════════════════════════════════════════
   EXPANDABLE EMOJI TRAY
══════════════════════════════════════════ */
.composer-emoji-tray {
  width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04);
}

.emoji-tray-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emoji-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  padding: 6px 10px;
  transition: border-color 0.2s;
}

.emoji-search-box:focus-within {
  border-color: var(--brand);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.emoji-search-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-primary);
  font-size: 13.5px;
  font-family: inherit;
}

.emoji-search-input::placeholder {
  color: var(--text-muted);
  font-size: 12.5px;
}

.btn-clear-emoji-search {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 4px;
  font-size: 13px;
  font-weight: bold;
}

.btn-close-emoji-tray {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.btn-close-emoji-tray:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: scale(1.05);
}

.emoji-categories-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.emoji-categories-nav::-webkit-scrollbar {
  height: 3px;
}

.emoji-categories-nav::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 99px;
}

.btn-emoji-cat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-emoji-cat:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.btn-emoji-cat.is-active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
}

.cat-icon {
  font-size: 14px;
}

.cat-name-label {
  font-size: 12px;
}

.emoji-scroll-body {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.emoji-scroll-body::-webkit-scrollbar {
  width: 5px;
}

.emoji-scroll-body::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 99px;
}

.emoji-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 4px;
}

.btn-quick-emoji-item {
  height: 38px;
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-quick-emoji-item:hover {
  background: var(--bg-card);
  transform: scale(1.25);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-quick-emoji-item:active {
  transform: scale(0.95);
}

.emoji-not-found {
  padding: 24px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13.5px;
}

/* Transition */
.tray-slide-enter-active,
.tray-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tray-slide-enter-from,
.tray-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
}

.composer-actions-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Audience Selector Dropdown */
.composer-audience-wrapper {
  position: relative;
  z-index: 100;
}

.btn-audience-selector {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 99px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-audience-selector:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.btn-audience-selector.audience-public {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.08);
}

.btn-audience-selector.audience-followers {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.08);
}

.btn-audience-selector.audience-mutual {
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.08);
}

.btn-audience-selector.audience-private {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}

.chevron-down {
  opacity: 0.7;
}

.audience-popover-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 9999;
  width: 230px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 3px;
  animation: fadeIn 0.15s ease;
}

.audience-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s ease;
  width: 100%;
}

.audience-menu-item:hover {
  background: var(--bg-hover);
}

.audience-menu-item.is-active {
  background: rgba(99, 102, 241, 0.12);
}

.aud-item-icon {
  font-size: 16px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aud-item-info {
  flex: 1;
  min-width: 0;
}

.aud-item-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.aud-item-sub {
  font-size: 10.5px;
  color: var(--text-muted);
}

.btn-community-only-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 99px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-community-only-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-secondary);
}

.btn-community-only-toggle.is-active {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.4);
  color: #06b6d4;
}

.char-counter {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.char-counter.near-limit {
  color: #f59e0b;
}

.btn-submit-post {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 8px 20px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-submit-post:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  filter: brightness(1.08);
}

.btn-submit-post:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-submit-post:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

/* ══════════════════════════════════════════
   MOBILE RESPONSIVE TWEAKS (<= 520px)
══════════════════════════════════════════ */
@media (max-width: 520px) {
  .composer-root-card {
    padding: 12px 12px 14px;
    gap: 10px;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
  }

  .composer-avatar-circle {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }

  .composer-bottom-bar {
    gap: 6px;
    box-sizing: border-box;
    width: 100%;
  }

  .composer-actions-left {
    gap: 4px;
    flex-shrink: 0;
  }

  .tool-label-text {
    display: none;
  }

  .composer-tool-btn {
    height: 32px;
    padding: 0 8px;
  }

  .composer-tool-btn.gif-btn {
    padding: 0 8px;
  }

  .composer-actions-right {
    gap: 6px;
    flex-shrink: 0;
  }

  .btn-audience-selector {
    padding: 4px 7px;
    font-size: 11px;
    height: 32px;
    gap: 4px;
  }

  .btn-audience-selector span {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-community-only-toggle {
    padding: 4px 7px;
    font-size: 11px;
    height: 32px;
  }

  .btn-submit-post {
    padding: 6px 13px;
    font-size: 13px;
    height: 32px;
    gap: 4px;
  }
}
</style>
