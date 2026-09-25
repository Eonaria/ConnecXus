<template>
  <div class="post-detail-page-root">
    <!-- Ambient Background Glow -->
    <div class="post-ambient-orbs">
      <div class="orb-top-left" />
      <div class="orb-bottom-right" />
    </div>

    <div class="post-detail-container">
      
      <!-- ══════════════════════════════════════════
           STICKY FROSTED HEADER
      ══════════════════════════════════════════ -->
      <header class="post-sticky-header">
        <button 
          @click="router.back()"
          class="btn-header-back"
          title="ย้อนกลับ"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div class="header-titles">
          <h2 class="header-main-title">โพสต์</h2>
          <span v-if="post" class="header-sub-meta">โดย @{{ post.author_username }}</span>
        </div>
      </header>

      <!-- ══════════════════════════════════════════
           MAIN POST CONTAINER
      ══════════════════════════════════════════ -->
      <div v-if="pending" class="post-loading-state">
        <div class="post-spinner-ring"></div>
        <p>กำลังโหลดโพสต์...</p>
      </div>

      <div v-else-if="error || !post" class="post-empty-state">
        <div class="empty-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>ไม่พบโพสต์ที่คุณต้องการ</h3>
        <p>โพสต์นี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <button @click="router.push('/')" class="btn-return-home">
          กลับสู่หน้าแรก
        </button>
      </div>

      <div v-else class="post-content-card-wrap">
        <!-- PostCard -->
        <PostCard :post="post" disableClick @deleted="router.back()" />
        
        <!-- ══════════════════════════════════════════
             COMMENTS SECTION
        ══════════════════════════════════════════ -->
        <section class="comments-section-wrap">
          
          <div class="comments-header-bar">
            <div class="comments-title-badge">
              <span class="badge-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              <span>ความคิดเห็น</span>
              <span class="comments-count-pill">{{ commentsList.length }}</span>
            </div>
          </div>

          <!-- Guest Login Callout Banner (when not logged in) -->
          <div v-if="!user" class="guest-comment-callout" @click="openLoginModal('เข้าสู่ระบบเพื่อแสดงความคิดเห็น')">
            <div class="guest-callout-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="guest-callout-info">
              <h4>เข้าสู่ระบบเพื่อแสดงความคิดเห็น</h4>
              <p>ร่วมแบ่งปันความคิดเห็นและพูดคุยในโพสต์นี้</p>
            </div>
            <div class="guest-callout-actions" @click.stop>
              <NuxtLink to="/login" class="btn-guest-login">เข้าสู่ระบบ</NuxtLink>
              <NuxtLink to="/register" class="btn-guest-register">สมัครสมาชิก</NuxtLink>
            </div>
          </div>

          <!-- Add Comment Composer Form (when logged in) -->
          <form v-else @submit.prevent="submitComment" class="comment-composer-card">
            <div class="composer-avatar-col">
              <div
                class="composer-avatar-circle"
                :style="`
                  ${user?.avatar_url
                    ? 'background: url(' + user.avatar_url + ') center/cover no-repeat;'
                    : 'background: linear-gradient(135deg, #6366f1, #8b5cf6);'
                  }
                `"
              >
                {{ user?.avatar_url ? '' : (user?.display_name ? user.display_name.slice(0,2) : 'ผ') }}
              </div>
            </div>

            <div class="composer-body-col">
              <!-- Replying To Indicator -->
              <div v-if="replyingTo" class="replying-to-banner">
                <span class="replying-to-text">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  กำลังตอบกลับ <strong>@{{ replyingTo.author_username }}</strong>
                </span>
                <button type="button" @click="cancelReply" class="btn-cancel-reply" title="ยกเลิกการตอบกลับ">✕</button>
              </div>

              <textarea
                ref="commentTextareaRef"
                v-model="commentInput"
                :placeholder="replyingTo ? `ตอบกลับ @${replyingTo.author_username}...` : 'เขียนความคิดเห็นหรือตอบกลับโพสต์นี้...'"
                rows="2"
                class="comment-textarea"
              ></textarea>

              <!-- Media Attachment Preview -->
              <div v-if="previewUrl" class="media-preview-container">
                <video
                  v-if="isVideo(previewUrl)"
                  :src="previewUrl"
                  controls
                  class="preview-media-element"
                ></video>
                <img
                  v-else
                  :src="previewUrl"
                  alt="attachment preview"
                  class="preview-media-element"
                />
                <button
                  @click.prevent="removeImage"
                  class="btn-remove-preview"
                  title="ลบสื่อ"
                >✕</button>
              </div>
              
              <div v-if="uploading" class="uploading-badge">
                <div class="upload-spinner"></div>
                <span>กำลังอัปโหลดไฟล์...</span>
              </div>

              <!-- Composer Action Tools -->
              <div class="composer-actions-bar">
                <div class="composer-tools-left">
                  <button
                    type="button"
                    @click="triggerImagePicker"
                    title="แนบรูปภาพหรือวิดีโอ"
                    class="btn-tool-icon"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                  <input
                    ref="imageInputRef"
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    style="display: none;"
                    @change="handleFileSelected"
                  />
                </div>

                <button
                  type="submit"
                  :disabled="(!commentInput.trim() && !imageUrl) || commentSubmitting"
                  class="btn-submit-comment"
                >
                  <span v-if="!commentSubmitting">ตอบกลับ</span>
                  <span v-else class="loading-submit-content">
                    <div class="spinner-sm"></div>
                    <span>กำลังส่ง...</span>
                  </span>
                </button>
              </div>
            </div>
          </form>

          <!-- Comments Stream List -->
          <div v-if="commentsLoading" class="comments-loading-state">
            <div class="post-spinner-ring"></div>
            <p>กำลังโหลดความคิดเห็น...</p>
          </div>

          <div v-else-if="commentsList.length === 0" class="comments-empty-state">
            <div class="empty-comment-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h4>ยังไม่มีความคิดเห็น</h4>
            <p>ร่วมแบ่งปันความคิดเห็นเป็นคนแรกในโพสต์นี้เลย!</p>
          </div>

          <div v-else class="comments-list-stream">
            <div
              v-for="cmt in commentsList"
              :key="cmt.id"
              class="comment-card-item"
            >
              <!-- Avatar -->
              <NuxtLink :to="`/profile/${cmt.author_username}`" class="comment-avatar-link">
                <div
                  class="comment-avatar-circle"
                  :style="`
                    ${cmt.author_avatar_url
                      ? 'background: url(' + cmt.author_avatar_url + ') center/cover no-repeat;'
                      : 'background: linear-gradient(135deg, #6366f1, #8b5cf6);'
                    }
                  `"
                >
                  {{ cmt.author_avatar_url ? '' : (cmt.authorInitials || 'ผ') }}
                </div>
              </NuxtLink>

              <!-- Comment Body -->
              <div class="comment-body-wrapper">
                <div class="comment-header-row">
                  <div class="comment-author-info">
                    <NuxtLink :to="`/profile/${cmt.author_username}`" class="comment-author-name">
                      {{ cmt.author_name }}
                    </NuxtLink>
                    <span class="comment-author-handle">@{{ cmt.author_username }}</span>
                    <span class="comment-dot">·</span>
                    <span class="comment-time-ago">{{ cmt.time_ago }}</span>
                  </div>

                  <!-- Actions (Report & Delete) -->
                  <div class="comment-actions-menu">
                    <button 
                      v-if="user && user.username !== cmt.author_username"
                      @click="openReportModal('comment', cmt.id, post.community_id)"
                      class="btn-comment-action-icon warning"
                      title="รายงานคอมเมนต์"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                    </button>
                    <button 
                      v-if="user?.role === 'admin' || user?.username === cmt.author_username"
                      @click="deleteComment(cmt.id)"
                      :disabled="cmt.isDeleting"
                      class="btn-comment-action-icon danger"
                      title="ลบคอมเมนต์"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Comment Text Content with Hashtags / Mentions -->
                <div
                  v-if="cmt.content"
                  class="comment-text-wrapper"
                  :class="{ 'is-collapsed': isCommentCollapsible(cmt.content) && !expandedComments.has(cmt.id) }"
                >
                  <p class="comment-text-content">
                    <FormattedText :text="cmt.content" />
                  </p>

                  <div v-if="isCommentCollapsible(cmt.content) && !expandedComments.has(cmt.id)" class="comment-expand-fade">
                    <button @click.stop="toggleCommentExpand(cmt.id)" class="btn-comment-expand" title="กดเพื่อดูเพิ่มเติม">
                      <span>ดูเพิ่มเติม</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>

                  <div v-if="isCommentCollapsible(cmt.content) && expandedComments.has(cmt.id)" class="comment-collapse-action">
                    <button @click.stop="toggleCommentExpand(cmt.id)" class="btn-comment-collapse" title="กดเพื่อย่อลง">
                      <span>ดูน้อยลง</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                  </div>
                </div>
                
                <!-- Comment Media -->
                <div v-if="cmt.image_url" class="comment-media-box">
                  <video 
                    v-if="isVideo(cmt.image_url)"
                    :src="cmt.image_url"
                    controls
                    class="comment-media-element"
                  ></video>
                  <img 
                    v-else
                    :src="cmt.image_url"
                    alt="comment attachment"
                    class="comment-media-element"
                  />
                </div>

                <!-- Comment Action Bar (Reply, Repost, Like, Bookmark) -->
                <div class="post-action-bar comment-action-bar">
                  <!-- 1. Reply -->
                  <button
                    @click.stop="replyToComment(cmt)"
                    class="btn-action-pill comment-action"
                    title="ตอบกลับ"
                  >
                    <div class="action-icon-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                  </button>

                  <!-- 2. Repost -->
                  <button
                    @click.stop="toggleCommentRepost(cmt)"
                    :disabled="cmt.repostLoading"
                    class="btn-action-pill repost-action"
                    :class="{ 'is-active': cmt.isReposted }"
                    title="รีโพสต์"
                  >
                    <div class="action-icon-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <polyline points="17 1 21 5 17 9"/>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                        <polyline points="7 23 3 19 7 15"/>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                      </svg>
                    </div>
                    <span v-if="cmt.repost_count > 0" class="action-count">{{ cmt.repost_count }}</span>
                  </button>

                  <!-- 3. Like -->
                  <button
                    @click.stop="toggleCommentLike(cmt)"
                    :disabled="cmt.likeLoading"
                    class="btn-action-pill like-action"
                    :class="{ 'is-active': cmt.isLiked }"
                    title="ถูกใจ"
                  >
                    <div class="action-icon-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" :fill="cmt.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <span v-if="cmt.like_count > 0" class="action-count">{{ cmt.like_count }}</span>
                  </button>

                  <!-- 4. Bookmark -->
                  <button
                    @click.stop="toggleCommentBookmark(cmt)"
                    :disabled="cmt.bookmarkLoading"
                    class="btn-action-pill bookmark-action"
                    :class="{ 'is-active': cmt.isBookmarked }"
                    title="บุ๊กมาร์ก"
                  >
                    <div class="action-icon-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" :fill="cmt.isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
    
    <!-- Confirm Delete Modal -->
    <AppConfirmModal
      :isOpen="showDeleteModal"
      title="ลบคอมเมนต์"
      message="คุณแน่ใจหรือไม่ว่าต้องการลบคอมเมนต์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      confirmText="ลบ"
      @confirm="executeDeleteComment"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import PostCard from '~/components/post/PostCard.vue'
import AppConfirmModal from '~/components/AppConfirmModal.vue'
import FormattedText from '~/components/FormattedText.vue'
import { useReportModal } from '~/composables/useReportModal'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const toast = useToast()
const { openLoginModal } = useLoginModal()
const { openReportModal } = useReportModal()
const { publish, subscribe, joinRoom, leaveRoom } = useRealtime()

const postId = route.params.id as string

const { data: postData, pending, error } = await useFetch<any>(`/api/posts/${postId}`)
const post = computed(() => postData.value?.post)

const commentsList = ref<any[]>([])
const commentsLoading = ref(true)
const commentInput = ref('')
const commentSubmitting = ref(false)
const replyingTo = ref<any | null>(null)
const commentTextareaRef = ref<HTMLTextAreaElement | null>(null)

const imageInputRef = ref<HTMLInputElement | null>(null)
const imageUrl = ref<string | null>(null)
const previewUrl = ref<string | null>(null)
const uploading = ref(false)

const showDeleteModal = ref(false)
const deleteTargetId = ref<number | null>(null)

// ── Reply to Comment ──
function replyToComment(cmt: any) {
  if (!user.value) {
    openLoginModal('กรุณาเข้าสู่ระบบเพื่อตอบกลับความคิดเห็น')
    return
  }
  replyingTo.value = cmt
  if (!commentInput.value.includes(`@${cmt.author_username}`)) {
    commentInput.value = `@${cmt.author_username} ` + commentInput.value
  }
  nextTick(() => {
    if (commentTextareaRef.value) {
      commentTextareaRef.value.focus()
      commentTextareaRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function cancelReply() {
  if (replyingTo.value && commentInput.value.startsWith(`@${replyingTo.value.author_username} `)) {
    commentInput.value = commentInput.value.replace(`@${replyingTo.value.author_username} `, '')
  }
  replyingTo.value = null
}

// ── Like / Unlike Comment ──
async function toggleCommentLike(cmt: any) {
  if (!user.value) {
    openLoginModal('กรุณาเข้าสู่ระบบเพื่อกดถูกใจความคิดเห็น')
    return
  }
  const wasLiked = cmt.isLiked
  cmt.isLiked = !wasLiked
  cmt.like_count = Math.max(0, (cmt.like_count || 0) + (wasLiked ? -1 : 1))

  try {
    const endpoint = wasLiked
      ? `/api/comments/${cmt.id}/unlike`
      : `/api/comments/${cmt.id}/like`
    const res = await $fetch<any>(endpoint, { method: 'POST' })
    if (res?.like_count !== undefined) {
      cmt.like_count = res.like_count
      cmt.isLiked = res.isLiked
    }
  } catch (err) {
    // Revert on failure
    cmt.isLiked = wasLiked
    cmt.like_count = Math.max(0, (cmt.like_count || 0) + (wasLiked ? 1 : -1))
  }
}

// ── Repost / Unrepost Comment ──
async function toggleCommentRepost(cmt: any) {
  if (!user.value) {
    openLoginModal('กรุณาเข้าสู่ระบบเพื่อรีโพสต์')
    return
  }
  if (cmt.repostLoading) return
  cmt.repostLoading = true
  const wasReposted = cmt.isReposted
  cmt.isReposted = !wasReposted
  cmt.repost_count = Math.max(0, (cmt.repost_count || 0) + (wasReposted ? -1 : 1))

  try {
    const endpoint = wasReposted
      ? `/api/comments/${cmt.id}/unrepost`
      : `/api/comments/${cmt.id}/repost`
    const res = await $fetch<any>(endpoint, { method: 'POST' })
    if (res?.repost_count !== undefined) {
      cmt.repost_count = res.repost_count
      cmt.isReposted = res.isReposted
    }
  } catch (err) {
    cmt.isReposted = wasReposted
    cmt.repost_count = Math.max(0, (cmt.repost_count || 0) + (wasReposted ? 1 : -1))
  } finally {
    cmt.repostLoading = false
  }
}

// ── Bookmark / Unbookmark Comment ──
async function toggleCommentBookmark(cmt: any) {
  if (!user.value) {
    openLoginModal('กรุณาเข้าสู่ระบบเพื่อบันทึกบุ๊กมาร์ก')
    return
  }
  if (cmt.bookmarkLoading) return
  cmt.bookmarkLoading = true
  const prev = cmt.isBookmarked
  cmt.isBookmarked = !prev

  try {
    const res = await $fetch<any>(`/api/comments/${cmt.id}/bookmark`, { method: 'POST' })
    if (res?.bookmarked !== undefined) {
      cmt.isBookmarked = res.bookmarked
    }
  } catch (err) {
    cmt.isBookmarked = prev
  } finally {
    cmt.bookmarkLoading = false
  }
}

// ── Comment Expand / Collapse (ดูเพิ่มเติม / ดูน้อยลง) ──
const expandedComments = ref<Set<number | string>>(new Set())

function isCommentCollapsible(text?: string) {
  if (!text) return false
  const lineCount = (text.match(/\n/g) || []).length + 1
  return lineCount > 5 || text.length > 250
}

function toggleCommentExpand(id: number | string) {
  if (expandedComments.value.has(id)) {
    expandedComments.value.delete(id)
  } else {
    expandedComments.value.add(id)
  }
}

function isVideo(url: string | null) {
  if (!url) return false
  const lower = url.toLowerCase()
  return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.startsWith('data:video/')
}

function checkAuthAndOpen(actionMsg: string) {
  if (!user.value) {
    openLoginModal(`กรุณาเข้าสู่ระบบเพื่อ${actionMsg}`)
    return false
  }
  return true
}

function triggerImagePicker() {
  if (checkAuthAndOpen('แนบรูปภาพหรือวิดีโอ')) {
    imageInputRef.value?.click()
  }
}

function removeImage() {
  imageUrl.value = null
  previewUrl.value = null
  if (imageInputRef.value) imageInputRef.value.value = ''
}

async function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  const formData = new FormData()
  formData.append('file', file, file.name)

  try {
    const res = await $fetch<any>('/api/upload', {
      method: 'POST',
      body: formData,
    })
    if (res.success) {
      imageUrl.value = res.url
    }
  } catch (err: any) {
    try {
      toast.add({
        title: 'อัปโหลดไม่สำเร็จ',
        description: err?.data?.message || 'อัปโหลดไฟล์ไม่สำเร็จ',
        icon: 'i-heroicons-exclamation-circle-solid',
        color: 'red'
      })
    } catch {
      alert(err?.data?.message || 'อัปโหลดไฟล์ไม่สำเร็จ')
    }
    removeImage()
  } finally {
    uploading.value = false
  }
}

async function fetchComments() {
  try {
    const data = await $fetch<any>(`/api/posts/${postId}/comments`)
    commentsList.value = data.comments || []
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

let unsubPost: (() => void) | null = null

onMounted(() => {
  fetchComments()
  
  joinRoom(`post-${postId}`)
  
  unsubPost = subscribe((data) => {
    if (data.payload?.post_id === Number(postId)) {
      if (data.type === 'new_comment') {
        if (data.payload.comment) {
          const newComment = data.payload.comment
          if (!commentsList.value.find(c => c.id === newComment.id)) {
            commentsList.value.push(newComment)
          }
        } else {
          fetchComments()
        }
      }
      
      if (data.type === 'like_post') {
        if (post.value) {
          if (data.payload.like_count !== undefined) {
            post.value.like_count = data.payload.like_count
          } else {
            post.value.like_count = (post.value.like_count || 0) + (data.payload.action === 'like' ? 1 : -1)
          }
        }
      }
      
      if (data.type === 'repost') {
        if (post.value) {
          if (data.payload.repost_count !== undefined) {
            post.value.repost_count = data.payload.repost_count
          } else {
            post.value.repost_count = (post.value.repost_count || 0) + 1
          }
        }
      }

      if (data.type === 'unrepost') {
        if (post.value) {
          if (data.payload.repost_count !== undefined) {
            post.value.repost_count = data.payload.repost_count
          } else {
            post.value.repost_count = Math.max(0, (post.value.repost_count || 0) - 1)
          }
        }
      }
      
      if (data.type === 'comment_deleted') {
        commentsList.value = commentsList.value.filter(c => c.id !== data.payload.comment_id)
        if (post.value) {
          post.value.comment_count = data.payload.comment_count !== undefined
            ? data.payload.comment_count
            : Math.max(0, (post.value.comment_count || 0) - 1)
        }
      }

      if (data.type === 'like_comment' && data.payload?.comment_id) {
        const cmt = commentsList.value.find(c => c.id === data.payload.comment_id)
        if (cmt) {
          if (data.payload.like_count !== undefined) {
            cmt.like_count = data.payload.like_count
          } else if (Number(data.payload?.user_id) !== Number(user.value?.id)) {
            cmt.like_count = Math.max(0, (cmt.like_count || 0) + (data.payload.action === 'like' ? 1 : -1))
          }
        }
      }

      if (data.type === 'repost_comment' && data.payload?.comment_id) {
        const cmt = commentsList.value.find(c => c.id === data.payload.comment_id)
        if (cmt) {
          if (data.payload.repost_count !== undefined) {
            cmt.repost_count = data.payload.repost_count
          } else if (Number(data.payload?.user_id) !== Number(user.value?.id)) {
            cmt.repost_count = Math.max(0, (cmt.repost_count || 0) + (data.payload.action === 'repost' ? 1 : -1))
          }
        }
      }
    }
  })
})

onUnmounted(() => {
  leaveRoom(`post-${postId}`)
  if (unsubPost) unsubPost()
})

async function submitComment() {
  if (!checkAuthAndOpen('แสดงความคิดเห็น')) return
  if ((!commentInput.value.trim() && !imageUrl.value) || commentSubmitting.value) return
  commentSubmitting.value = true
  try {
    const res = await $fetch<any>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: { 
        content: commentInput.value.trim(),
        image_url: imageUrl.value
      },
    })
    commentInput.value = ''
    replyingTo.value = null
    removeImage()
    if (res?.comment && !commentsList.value.find(c => c.id === res.comment.id)) {
      commentsList.value.push(res.comment)
    }
    if (post.value) {
      if (res?.comment_count !== undefined) {
        post.value.comment_count = res.comment_count
      } else {
        post.value.comment_count++
      }
    }
  } catch (err: any) {
    try {
      toast.add({
        title: 'ส่งคอมเมนต์ไม่สำเร็จ',
        description: err?.data?.message || err?.message || 'เกิดข้อผิดพลาดในการส่งความคิดเห็น',
        icon: 'i-heroicons-exclamation-circle-solid',
        color: 'red'
      })
    } catch {
      alert(err?.data?.message || err?.message || 'ส่งคอมเมนต์ไม่สำเร็จ')
    }
  } finally {
    commentSubmitting.value = false
  }
}

function deleteComment(commentId: number) {
  deleteTargetId.value = commentId
  showDeleteModal.value = true
}

async function executeDeleteComment() {
  const commentId = deleteTargetId.value
  if (!commentId) return
  
  showDeleteModal.value = false
  const target = commentsList.value.find(c => c.id === commentId)
  if (target) target.isDeleting = true
  try {
    await $fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    commentsList.value = commentsList.value.filter(c => c.id !== commentId)
    if (post.value) post.value.comment_count = Math.max(0, post.value.comment_count - 1)
  } catch (err: any) {
    try {
      toast.add({
        title: 'ลบคอมเมนต์ไม่สำเร็จ',
        description: err?.data?.message || 'ไม่สามารถลบคอมเมนต์ได้',
        icon: 'i-heroicons-exclamation-circle-solid',
        color: 'red'
      })
    } catch {
      alert(err?.data?.message || 'ไม่สามารถลบคอมเมนต์ได้')
    }
  } finally {
    if (target) target.isDeleting = false
    deleteTargetId.value = null
  }
}
</script>

<style scoped>
/* ══════════════════════════════════════════
   POST DETAIL PAGE ROOT & ATMOSPHERE
══════════════════════════════════════════ */
.post-detail-page-root {
  min-height: 100vh;
  width: 100%;
  position: relative;
  background: var(--bg-primary);
  font-family: inherit;
  padding-bottom: 80px;
}

.post-ambient-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb-top-left {
  position: absolute;
  top: -100px;
  left: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  filter: blur(60px);
}

.orb-bottom-right {
  position: absolute;
  bottom: 10%;
  right: 10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.07) 0%, transparent 70%);
  filter: blur(70px);
}

.post-detail-container {
  max-width: 630px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  z-index: 10;
  border-left: 1px solid var(--border-primary);
  border-right: 1px solid var(--border-primary);
  background: var(--bg-card);
}

/* ══════════════════════════════════════════
   STICKY FROSTED HEADER
══════════════════════════════════════════ */
.post-sticky-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  background: var(--glass-bg);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-bottom: 1px solid var(--border-primary);
}

.btn-header-back {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-header-back:hover {
  background: var(--bg-hover);
  color: var(--brand);
  transform: translateX(-2px);
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.header-main-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.header-sub-meta {
  font-size: 12.5px;
  color: var(--text-muted);
}

/* Loading & Empty States */
.post-loading-state,
.post-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  color: var(--text-muted);
}

.post-spinner-ring {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 14px;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.post-empty-state h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.post-empty-state p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 20px;
}

.btn-return-home {
  padding: 8px 20px;
  border-radius: 99px;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-return-home:hover {
  background: var(--border-secondary);
}

/* ══════════════════════════════════════════
   COMMENTS SECTION WRAPPER
══════════════════════════════════════════ */
.comments-section-wrap {
  display: flex;
  flex-direction: column;
}

.comments-header-bar {
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border-primary);
}

.comments-title-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
}

.badge-icon {
  font-size: 16px;
}

.comments-count-pill {
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--brand-light);
  border: 1px solid rgba(99, 102, 241, 0.3);
  font-size: 12px;
  color: var(--brand);
}

/* Guest Comment Callout */
.guest-comment-callout {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: background 0.2s ease;
}

.guest-comment-callout:hover {
  background: var(--bg-hover);
}

.guest-callout-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--brand-light);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.guest-callout-info {
  flex: 1;
  min-width: 0;
}

.guest-callout-info h4 {
  margin: 0 0 2px 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--text-primary);
}

.guest-callout-info p {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-muted);
}

.guest-callout-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-guest-login {
  padding: 7px 16px;
  border-radius: 99px;
  background: var(--brand-gradient);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
  transition: transform 0.15s, opacity 0.15s;
}

.btn-guest-login:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.btn-guest-register {
  padding: 7px 14px;
  border-radius: 99px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-guest-register:hover {
  background: var(--bg-hover);
}

@media (max-width: 640px) {
  .guest-comment-callout {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .guest-callout-actions {
    width: 100%;
  }
  .btn-guest-login,
  .btn-guest-register {
    flex: 1;
    text-align: center;
  }
}

/* Comment Composer */
.comment-composer-card {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-card);
}

.composer-avatar-col {
  flex-shrink: 0;
}

.composer-avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-primary);
}

.composer-body-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-textarea {
  width: 100%;
  font-size: 15px;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  resize: none;
  min-height: 44px;
  line-height: 1.5;
  box-sizing: border-box;
}

.comment-textarea::placeholder {
  color: var(--text-muted);
}

.media-preview-container {
  position: relative;
  margin-top: 8px;
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  max-width: 320px;
}

.preview-media-element {
  max-width: 100%;
  max-height: 240px;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}

.btn-remove-preview {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s;
}

.btn-remove-preview:hover {
  background: rgba(239, 68, 68, 0.9);
}

.uploading-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--brand);
  margin-top: 4px;
  margin-bottom: 8px;
}

.upload-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.composer-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.btn-tool-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
  transition: background 0.18s, color 0.18s;
}

.btn-tool-icon:hover {
  background: var(--brand-light);
  color: var(--brand);
}

.btn-submit-comment {
  background: var(--brand-gradient);
  color: #fff;
  border: none;
  border-radius: 9999px;
  padding: 7px 18px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-submit-comment:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.btn-submit-comment:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.loading-submit-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ══════════════════════════════════════════
   COMMENTS STREAM LIST
══════════════════════════════════════════ */
.comments-loading-state,
.comments-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: var(--text-muted);
}

.empty-comment-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--brand-light);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.comments-empty-state h4 {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.comments-empty-state p {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 0;
}

.comments-list-stream {
  display: flex;
  flex-direction: column;
}

.comment-card-item {
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-primary);
  transition: background 0.15s;
}

.comment-card-item:hover {
  background: var(--bg-hover);
}

.comment-avatar-link {
  flex-shrink: 0;
  text-decoration: none;
}

.comment-avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--border-primary);
}

.comment-body-wrapper {
  flex: 1;
  min-width: 0;
}

.comment-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-author-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.comment-author-name {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.15s;
}

.comment-author-name:hover {
  color: var(--brand);
}

.comment-author-handle {
  font-size: 12.5px;
  color: var(--text-muted);
}

.comment-dot {
  font-size: 12.5px;
  color: var(--text-muted);
}

.comment-time-ago {
  font-size: 12px;
  color: var(--text-muted);
}

.comment-actions-menu {
  display: flex;
  gap: 2px;
}

.btn-comment-action-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-comment-action-icon.warning {
  color: #f59e0b;
}

.btn-comment-action-icon.warning:hover {
  background: rgba(245, 158, 11, 0.15);
}

.btn-comment-action-icon.danger {
  color: #ef4444;
}

.btn-comment-action-icon.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* Comment Text Content Wrapper */
.comment-text-wrapper {
  position: relative;
  margin-top: 6px;
}

.comment-text-wrapper.is-collapsed {
  max-height: 140px;
  overflow: hidden;
}

.comment-text-content {
  font-size: 14.5px;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Comment Expand Fade */
.comment-expand-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 54px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding-bottom: 2px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--bg-card) 85%);
  pointer-events: none;
}

.btn-comment-expand {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 99px;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-comment-expand:hover {
  background: var(--brand) !important;
  color: #ffffff !important;
  border-color: var(--brand);
  transform: translateY(-1px);
}

.comment-collapse-action {
  margin-top: 4px;
  display: flex;
  justify-content: flex-start;
}

.btn-comment-collapse {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-comment-collapse:hover {
  color: var(--brand);
  background: var(--brand-light);
}

.comment-media-box {
  margin-top: 10px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  max-width: 420px;
}

.comment-media-element {
  width: 100%;
  max-height: 380px;
  display: block;
  object-fit: cover;
}

/* ══════════════════════════════════════════
   REPLYING TO BANNER
══════════════════════════════════════════ */
.replying-to-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brand-light, rgba(123, 108, 246, 0.12));
  border-left: 3px solid var(--brand, #7b6cf6);
  padding: 6px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  animation: fadeIn 0.2s ease-out;
}

.replying-to-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--brand, #7b6cf6);
}

.replying-to-text strong {
  font-weight: 700;
  color: var(--text-primary);
}

.btn-cancel-reply {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  transition: all 0.15s ease;
}

.btn-cancel-reply:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* ══════════════════════════════════════════
   COMMENT ACTION BAR (Matches Main Post)
══════════════════════════════════════════ */
.post-action-bar.comment-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 380px;
  margin-top: 10px;
  padding-top: 2px;
}

.post-action-bar .btn-action-pill {
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

.post-action-bar .action-icon-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

.post-action-bar .action-count {
  font-size: 12.5px;
  font-weight: 600;
  pointer-events: none;
  min-width: 10px;
}

/* Comment/Reply hover */
.post-action-bar .comment-action:hover {
  color: #38bdf8;
}
.post-action-bar .comment-action:hover .action-icon-circle {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  transform: scale(1.08);
}

/* Repost hover & active */
.post-action-bar .repost-action:hover,
.post-action-bar .repost-action.is-active {
  color: #10b981;
}
.post-action-bar .repost-action:hover .action-icon-circle,
.post-action-bar .repost-action.is-active .action-icon-circle {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  transform: scale(1.08);
}

/* Like hover & active */
.post-action-bar .like-action:hover,
.post-action-bar .like-action.is-active {
  color: #f43f5e;
}
.post-action-bar .like-action:hover .action-icon-circle,
.post-action-bar .like-action.is-active .action-icon-circle {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
  transform: scale(1.08);
}

/* Bookmark hover & active */
.post-action-bar .bookmark-action:hover,
.post-action-bar .bookmark-action.is-active {
  color: #6366f1;
}
.post-action-bar .bookmark-action:hover .action-icon-circle,
.post-action-bar .bookmark-action.is-active .action-icon-circle {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
  transform: scale(1.08);
}

@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.35); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 700px) {
  .post-detail-container {
    border-left: none;
    border-right: none;
    max-width: 100%;
  }
}
</style>
