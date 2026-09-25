<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-left">
            <div class="header-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h2 class="modal-title">สร้างชุมชนใหม่</h2>
              <p class="modal-subtitle">สร้างพื้นที่และสังคมสำหรับคุณและเพื่อนๆ</p>
            </div>
          </div>

          <button class="btn-close" @click="$emit('close')" title="ปิดหน้าต่าง">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="modal-body">
          
          <!-- LEFT / MAIN: Form Section -->
          <div class="form-section">

            <!-- 1. Visual Customization Card (Banner & Avatar) -->
            <div class="visual-customizer-card">
              
              <!-- Banner Container (Draggable to reposition) -->
              <div 
                class="banner-preview-box"
                :class="{ 'is-draggable': !!form.banner_url, 'is-dragging': isDraggingBanner }"
                :style="form.banner_url 
                  ? { backgroundImage: `url(${form.banner_url})`, backgroundPosition: `center ${form.banner_pos_y}%`, backgroundSize: 'cover' } 
                  : { background: `linear-gradient(135deg, ${form.bg_color || '#6366f1'} 0%, #0f172a 100%)` }"
                @mousedown="handleBannerMouseDown"
                @touchstart.passive="handleBannerTouchStart"
              >
                <!-- Drag Hint Overlay -->
                <div v-if="form.banner_url" class="banner-drag-hint" :class="{ 'active': isDraggingBanner }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="7 10 12 5 17 10"/>
                    <polyline points="7 14 12 19 17 14"/>
                  </svg>
                  <span>{{ isDraggingBanner ? 'กำลังเลื่อนตำแหน่ง...' : 'ลากบนภาพเพื่อเลื่อนตำแหน่ง' }}</span>
                </div>

                <!-- Banner Action Buttons -->
                <div class="banner-actions-row">
                  <button type="button" class="btn-banner-action" @click.stop="triggerBannerUpload">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>{{ form.banner_url ? 'เปลี่ยนภาพหน้าปก' : 'เพิ่มภาพหน้าปก' }}</span>
                  </button>

                  <button 
                    v-if="form.banner_url" 
                    type="button" 
                    class="btn-banner-action btn-danger-action" 
                    @click.stop="removeBanner"
                    title="ลบภาพหน้าปก"
                  >
                    ✕ นำออก
                  </button>
                </div>
              </div>

              <!-- Banner Reposition Slider Control (When banner is uploaded) -->
              <div v-if="form.banner_url" class="banner-reposition-bar">
                <div class="reposition-meta">
                  <div class="reposition-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <line x1="12" y1="3" x2="12" y2="21"/>
                      <polyline points="8 7 12 3 16 7"/>
                      <polyline points="8 17 12 21 16 17"/>
                    </svg>
                    <span>เลื่อนปรับตำแหน่งภาพ (ขึ้น - ลง):</span>
                  </div>
                  <span class="reposition-val-badge">{{ form.banner_pos_y }}%</span>
                </div>

                <div class="reposition-slider-row">
                  <button 
                    type="button" 
                    class="btn-pos-chip" 
                    :class="{ 'active': form.banner_pos_y === 0 }" 
                    @click="form.banner_pos_y = 0"
                  >
                    บนสุด
                  </button>
                  <button 
                    type="button" 
                    class="btn-pos-chip" 
                    :class="{ 'active': form.banner_pos_y === 50 }" 
                    @click="form.banner_pos_y = 50"
                  >
                    ตรงกลาง
                  </button>
                  <button 
                    type="button" 
                    class="btn-pos-chip" 
                    :class="{ 'active': form.banner_pos_y === 100 }" 
                    @click="form.banner_pos_y = 100"
                  >
                    ล่างสุด
                  </button>

                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1"
                    v-model.number="form.banner_pos_y" 
                    class="reposition-range-input"
                    title="เลื่อนปรับตำแหน่งภาพหน้าปก"
                  />
                </div>
              </div>

              <!-- Avatar Row (Completely separated, no overlap) -->
              <div class="avatar-customizer-row">
                <div 
                  class="avatar-preview-circle"
                  :style="!form.avatar_url ? { background: form.bg_color || 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}"
                  @click="triggerAvatarUpload"
                  title="คลิกเพื่อเลือกรูปไอคอนชุมชน"
                >
                  <img v-if="form.avatar_url" :src="form.avatar_url" alt="avatar" />
                  <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <div class="avatar-badge-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>

                <div class="avatar-info-col">
                  <div class="avatar-title-label">ไอคอนโปรไฟล์ชุมชน</div>
                  <div class="avatar-sub-label">ขนาดแนะนำ 400x400 (PNG, JPG, WebP)</div>
                  <div class="avatar-buttons-row">
                    <button type="button" class="btn-small-upload" @click="triggerAvatarUpload">
                      {{ form.avatar_url ? 'เปลี่ยนภาพ' : 'อัปโหลดภาพ' }}
                    </button>
                    <button v-if="form.avatar_url" type="button" class="btn-small-remove" @click="form.avatar_url = ''">
                      นำออก
                    </button>
                  </div>
                </div>
              </div>

              <!-- Hidden File Inputs -->
              <input ref="avatarInputRef" type="file" accept="image/*" class="hidden" @change="handleAvatarSelected" />
              <input ref="bannerInputRef" type="file" accept="image/*" class="hidden" @change="handleBannerSelected" />
            </div>

            <!-- 2. Form Inputs Stack -->
            <div class="form-fields-stack">

              <!-- Community Name -->
              <div class="field-group">
                <label class="field-label">
                  <span>ชื่อชุมชน</span>
                  <span class="required-star">*</span>
                </label>
                <div class="input-container">
                  <input 
                    v-model="form.name" 
                    type="text" 
                    maxlength="50"
                    placeholder="เช่น ชมรมคนรักแมว, ชมรมบอร์ดเกม..." 
                    class="styled-input" 
                  />
                  <span class="char-counter">{{ form.name.length }}/50</span>
                </div>
              </div>

              <!-- Slug / Short Link -->
              <div class="field-group">
                <label class="field-label">
                  <span>URL สั้น (Slug)</span>
                  <span class="required-star">*</span>
                </label>
                <div class="slug-input-container">
                  <span class="slug-tag-prefix">/community/</span>
                  <input 
                    v-model="form.slug" 
                    type="text" 
                    maxlength="40"
                    placeholder="cat-lovers" 
                    class="slug-text-input" 
                  />
                </div>
                <p class="helper-text">ใช้สำหรับลิงก์ทางตรงเพื่อแชร์ให้เพื่อนเข้ากลุ่ม</p>
              </div>

              <!-- Description -->
              <div class="field-group">
                <label class="field-label">
                  <span>คำอธิบายชุมชน</span>
                </label>
                <textarea 
                  v-model="form.description" 
                  rows="3" 
                  maxlength="200"
                  placeholder="บอกให้สมาชิกใหม่รู้ว่าชุมชนนี้มีไว้เพื่อพูดคุยเรื่องอะไร มีกฎเกณฑ์หรือกิจกรรมอะไรบ้าง..." 
                  class="styled-input textarea-input"
                ></textarea>
                <div class="field-bottom-meta">
                  <span class="helper-text">แนะนำให้อธิบายสั้นๆ กระชับเข้าใจง่าย</span>
                  <span class="char-counter">{{ form.description.length }}/200</span>
                </div>
              </div>

              <!-- Theme Color -->
              <div class="field-group">
                <label class="field-label">
                  <span>ธีมสีประจำชุมชน (Theme Color)</span>
                </label>
                <div class="swatches-palette-row">
                  <button
                    v-for="color in themeColors"
                    :key="color"
                    type="button"
                    class="color-swatch-item"
                    :class="{ 'is-selected': form.bg_color === color }"
                    :style="`background-color: ${color};`"
                    @click="form.bg_color = color"
                    :title="color"
                  >
                    <svg v-if="form.bg_color === color" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>

                  <label class="color-custom-picker-btn" title="เลือกสีอื่นๆ">
                    <input type="color" v-model="form.bg_color" class="hidden" />
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </label>
                </div>
              </div>

              <!-- Privacy Setting Card -->
              <div class="privacy-card-box" :class="{ 'private-active': form.is_private }">
                <label class="privacy-toggle-label">
                  <div class="privacy-text-group">
                    <div class="privacy-icon-pill">
                      <svg v-if="form.is_private" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    </div>
                    <div>
                      <div class="privacy-main-title">{{ form.is_private ? 'ชุมชนส่วนตัว (Private Group)' : 'ชุมชนสาธารณะ (Public Group)' }}</div>
                      <div class="privacy-sub-title">{{ form.is_private ? 'สมาชิกต้องได้รับการอนุมัติก่อน จึงจะมองเห็นโพสต์' : 'ทุกคนสามารถค้นพบและเข้าร่วมชุมชนนี้ได้ทันที' }}</div>
                    </div>
                  </div>
                  <input type="checkbox" v-model="form.is_private" class="hidden" />
                  <div class="toggle-pill-switch" :class="{ 'active': form.is_private }">
                    <div class="toggle-pill-knob"></div>
                  </div>
                </label>
              </div>

            </div>

          </div>

          <!-- RIGHT / DESKTOP PREVIEW: Live Preview -->
          <div class="desktop-preview-section">
            <div class="preview-top-badge">
              <span class="live-indicator-dot"></span>
              <span>ตัวอย่างการ์ดแบบเรียลไทม์</span>
            </div>

            <div class="preview-card-frame">
              <CommunityCard :community="previewCommunity" style="pointer-events: none;" />
            </div>

            <p class="preview-bottom-caption">การ์ดจะแสดงในหน้าสำรวจชุมชนตามรูปแบบนี้</p>
          </div>

        </div>

        <!-- Modal Sticky Footer -->
        <div class="modal-footer">
          <div v-if="uploading" class="upload-status-indicator">
            <div class="mini-spinner"></div>
            <span>กำลังอัปโหลดรูปภาพ...</span>
          </div>

          <div class="footer-action-buttons">
            <button type="button" class="btn-action-cancel" @click="$emit('close')">
              ยกเลิก
            </button>

            <button 
              type="button" 
              class="btn-action-submit" 
              @click="submit" 
              :disabled="!isFormValid || loading || uploading"
            >
              <div v-if="loading" class="mini-spinner"></div>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>{{ loading ? 'กำลังสร้างชุมชน...' : 'สร้างชุมชน' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import CommunityCard from '~/components/community/CommunityCard.vue'

const emit = defineEmits(['close', 'created'])

const themeColors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const form = reactive({
  name: '',
  slug: '',
  description: '',
  icon: '',
  bg_color: '#6366f1',
  avatar_url: '',
  banner_url: '',
  banner_pos_y: 50,
  is_private: false
})

const loading = ref(false)
const uploading = ref(false)

const avatarInputRef = ref<HTMLInputElement | null>(null)
const bannerInputRef = ref<HTMLInputElement | null>(null)

// ── Drag to Reposition Banner ──
const isDraggingBanner = ref(false)
let dragStartY = 0
let dragStartPos = 50

function handleBannerMouseDown(e: MouseEvent) {
  if (!form.banner_url) return
  // If clicked directly on the buttons inside the banner, don't drag
  if ((e.target as HTMLElement).closest('.btn-banner-action')) return

  isDraggingBanner.value = true
  dragStartY = e.clientY
  dragStartPos = form.banner_pos_y

  window.addEventListener('mousemove', handleBannerMouseMove)
  window.addEventListener('mouseup', handleBannerMouseUp)
}

function handleBannerMouseMove(e: MouseEvent) {
  if (!isDraggingBanner.value) return
  const deltaY = e.clientY - dragStartY
  // Dragging down shifts image position up (decreases %)
  const newPos = Math.min(100, Math.max(0, Math.round(dragStartPos - (deltaY * 0.5))))
  form.banner_pos_y = newPos
}

function handleBannerMouseUp() {
  isDraggingBanner.value = false
  window.removeEventListener('mousemove', handleBannerMouseMove)
  window.removeEventListener('mouseup', handleBannerMouseUp)
}

function handleBannerTouchStart(e: TouchEvent) {
  if (!form.banner_url || !e.touches[0]) return
  if ((e.target as HTMLElement).closest('.btn-banner-action')) return

  isDraggingBanner.value = true
  dragStartY = e.touches[0].clientY
  dragStartPos = form.banner_pos_y

  window.addEventListener('touchmove', handleBannerTouchMove, { passive: false })
  window.addEventListener('touchend', handleBannerTouchEnd)
}

function handleBannerTouchMove(e: TouchEvent) {
  if (!isDraggingBanner.value || !e.touches[0]) return
  e.preventDefault()
  const deltaY = e.touches[0].clientY - dragStartY
  const newPos = Math.min(100, Math.max(0, Math.round(dragStartPos - (deltaY * 0.5))))
  form.banner_pos_y = newPos
}

function handleBannerTouchEnd() {
  isDraggingBanner.value = false
  window.removeEventListener('touchmove', handleBannerTouchMove)
  window.removeEventListener('touchend', handleBannerTouchEnd)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', handleBannerMouseMove)
  window.removeEventListener('mouseup', handleBannerMouseUp)
  window.removeEventListener('touchmove', handleBannerTouchMove)
  window.removeEventListener('touchend', handleBannerTouchEnd)
})

function removeBanner() {
  form.banner_url = ''
  form.banner_pos_y = 50
}

const isFormValid = computed(() => {
  return form.name.trim().length > 0 && form.slug.trim().length > 0 && !uploading.value
})

watch(() => form.name, (val) => {
  if (!form.slug || form.slug === val.slice(0, -1).toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-')) {
    form.slug = val.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-').replace(/^-+|-+$/g, '')
  }
})

// Preview Object
const previewCommunity = computed(() => ({
  name: form.name.trim() || 'ชื่อชุมชนของคุณ',
  description: form.description.trim() || 'คำอธิบายชุมชนจะแสดงตรงนี้เพื่อบอกให้ผู้คนเข้าใจ...',
  icon: form.icon,
  bg_color: form.bg_color,
  avatar_url: form.avatar_url,
  banner_url: form.banner_url,
  banner_position_y: form.banner_pos_y,
  banner_pos_y: form.banner_pos_y,
  member_count: 1,
  post_count: 0,
  is_joined: false
}))

// Upload Handlers
function triggerAvatarUpload() { avatarInputRef.value?.click() }
function triggerBannerUpload() { bannerInputRef.value?.click() }

async function uploadFile(file: File) {
  uploading.value = true
  const formData = new FormData()
  formData.append('files', file, file.name)
  try {
    const res = await $fetch<any>('/api/upload', { method: 'POST', body: formData })
    return res.success ? res.url : null
  } catch (err: any) {
    alert('อัปโหลดไฟล์ไม่สำเร็จ: ' + (err?.data?.message || err.message))
    return null
  } finally {
    uploading.value = false
  }
}

async function handleAvatarSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    const url = await uploadFile(target.files[0])
    if (url) form.avatar_url = url
  }
  target.value = ''
}

async function handleBannerSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) {
    const url = await uploadFile(target.files[0])
    if (url) {
      form.banner_url = url
      form.banner_pos_y = 50
    }
  }
  target.value = ''
}

// Submit
async function submit() {
  if (!isFormValid.value || loading.value) return
  loading.value = true
  
  try {
    const res = await $fetch('/api/communities', {
      method: 'POST',
      body: {
        ...form,
        banner_position_y: form.banner_pos_y
      }
    })
    emit('created', res)
    emit('close')
  } catch (err: any) {
    const errorMsg = err?.data?.message || err?.data?.statusMessage || err?.message || 'ไม่สามารถสร้างชุมชนได้ กรุณาลองใหม่อีกครั้ง'
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Overlay ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 12, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Modal Container ── */
.modal-container {
  background: var(--bg-card);
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Header ── */
.modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.modal-subtitle {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.btn-close {
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transform: scale(1.05);
}

/* ── Body ── */
.modal-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 99px;
}

/* ── Form Section ── */
.form-section {
  flex: 1;
  min-width: 0;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 1. Visual Customizer Card (Banner + Avatar - NO OVERLAPPING) */
.visual-customizer-card {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
  display: flex;
  flex-direction: column;
}

.banner-preview-box {
  height: 130px;
  position: relative;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  transition: box-shadow 0.2s;
}

.banner-preview-box.is-draggable {
  cursor: grab;
}

.banner-preview-box.is-dragging {
  cursor: grabbing;
  box-shadow: inset 0 0 0 2px var(--brand);
}

.banner-drag-hint {
  position: absolute;
  top: 10px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  padding: 4px 10px;
  border-radius: 99px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
  transition: all 0.2s;
  opacity: 0.85;
}

.banner-drag-hint.active {
  background: var(--brand);
  opacity: 1;
  transform: scale(1.05);
}

.banner-actions-row {
  display: flex;
  gap: 8px;
  z-index: 2;
}

.btn-banner-action {
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(8px);
  padding: 7px 14px;
  border-radius: 99px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-banner-action:hover {
  background: rgba(0, 0, 0, 0.88);
  transform: scale(1.03);
}

.btn-danger-action:hover {
  background: rgba(239, 68, 68, 0.85);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Banner Reposition Slider Bar */
.banner-reposition-bar {
  padding: 10px 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: fadeIn 0.2s ease-out;
}

.reposition-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reposition-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.reposition-val-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--brand);
  background: rgba(99, 102, 241, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.reposition-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-pos-chip {
  padding: 3px 9px;
  border-radius: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  flex-shrink: 0;
}

.btn-pos-chip:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-pos-chip.active {
  background: var(--brand);
  color: #fff;
  border-color: var(--brand);
}

.reposition-range-input {
  flex: 1;
  height: 6px;
  accent-color: var(--brand);
  cursor: pointer;
}

/* Avatar Row */
.avatar-customizer-row {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
}

.avatar-preview-circle {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  border: 2px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.avatar-preview-circle:hover {
  transform: scale(1.05);
}

.avatar-preview-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-badge-icon {
  position: absolute;
  bottom: 0;
  inset-inline: 0;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
}

.avatar-info-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.avatar-title-label {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.avatar-sub-label {
  font-size: 11.5px;
  color: var(--text-muted);
}

.avatar-buttons-row {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-small-upload {
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-small-upload:hover {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand);
}

.btn-small-remove {
  padding: 4px 8px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-small-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 2. Form Fields Stack */
.form-fields-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.required-star {
  color: #ef4444;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.styled-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.styled-input:focus {
  border-color: var(--brand);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.char-counter {
  position: absolute;
  right: 12px;
  font-size: 11px;
  color: var(--text-muted);
  pointer-events: none;
}

/* Slug Input Container */
.slug-input-container {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.slug-input-container:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  background: var(--bg-card);
}

.slug-tag-prefix {
  padding: 10px 0 10px 14px;
  font-size: 13px;
  color: var(--brand);
  font-weight: 700;
  user-select: none;
}

.slug-text-input {
  flex: 1;
  padding: 10px 14px 10px 4px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
}

.helper-text {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.textarea-input {
  resize: vertical;
  min-height: 64px;
  line-height: 1.5;
}

.field-bottom-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.field-bottom-meta .char-counter {
  position: static;
}

/* Swatches Palette */
.swatches-palette-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.color-swatch-item {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.color-swatch-item:hover {
  transform: scale(1.15);
}

.color-swatch-item.is-selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--brand);
  transform: scale(1.1);
}

.color-custom-picker-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px dashed var(--border-secondary);
  background: var(--bg-hover);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.color-custom-picker-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
  transform: scale(1.1);
}

/* Privacy Card Box */
.privacy-card-box {
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
}

.privacy-card-box.private-active {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.04);
}

.privacy-toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  gap: 12px;
}

.privacy-text-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.privacy-icon-pill {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--bg-hover);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.privacy-card-box.private-active .privacy-icon-pill {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.privacy-main-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.privacy-sub-title {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 1px;
}

.toggle-pill-switch {
  width: 42px;
  height: 24px;
  background: var(--border-primary);
  border-radius: 99px;
  position: relative;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.toggle-pill-switch.active {
  background: #ef4444;
}

.toggle-pill-knob {
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-pill-switch.active .toggle-pill-knob {
  left: 21px;
}

/* ── RIGHT COLUMN: Desktop Preview ── */
.desktop-preview-section {
  width: 320px;
  flex-shrink: 0;
  padding: 24px;
  background: var(--bg-tertiary);
  border-left: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.preview-top-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.live-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.preview-card-frame {
  width: 100%;
  max-width: 280px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  transition: transform 0.25s ease;
}

.preview-bottom-caption {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 20px;
  text-align: center;
  line-height: 1.4;
}

/* ── Footer Actions ── */
.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  flex-shrink: 0;
}

.upload-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--brand);
  font-weight: 600;
}

.footer-action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.btn-action-cancel {
  padding: 9px 18px;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  background: var(--bg-hover);
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-action-cancel:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-action-submit {
  padding: 9px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.btn-action-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.btn-action-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hidden {
  display: none;
}

/* ── Responsive Rules (Mobile <= 800px) ── */
@media (max-width: 800px) {
  .desktop-preview-section {
    display: none !important;
  }

  .modal-container {
    max-height: 94vh;
    border-radius: 20px;
  }

  .modal-header {
    padding: 14px 18px;
  }

  .form-section {
    padding: 16px 18px;
    gap: 16px;
  }

  .modal-footer {
    padding: 12px 18px;
  }

  .btn-action-submit {
    padding: 9px 20px;
  }
}
</style>
