<template>
  <div
    class="community-card group"
    @click="navigateTo(`/community/${community.slug}`)"
  >
    <!-- Background Banner / Gradient -->
    <div
      class="card-banner"
      :style="community.banner_url ? `background-image: url(${community.banner_url}); background-position: center ${community.banner_position_y ?? community.banner_pos_y ?? 50}%; background-size: cover;` : `background: linear-gradient(135deg, ${community.bg_color || '#5b46e0'} 0%, #0f172a 100%);`"
    >
      <div class="banner-overlay"></div>
    </div>

    <!-- Content Area -->
    <div class="card-content">
      
      <!-- Avatar & Action Header -->
      <div class="card-header">
        <div
          class="card-avatar"
          :style="!community.avatar_url ? { background: community.bg_color || 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}"
        >
          <img v-if="community.avatar_url" :src="community.avatar_url" alt="avatar" />
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>

        <button
          @click.stop="onToggleJoin"
          class="btn-join"
          :class="{ 
            'joined': community.is_joined,
            'pending': community.user_status === 'pending'
          }"
          :title="community.user_status === 'pending' ? 'กดเพื่อยกเลิกคำขอ' : ''"
        >
          <template v-if="community.user_status === 'pending'">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            รออนุมัติ
          </template>
          <template v-else-if="community.is_joined">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            เข้าร่วมแล้ว
          </template>
          <template v-else>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            เข้าร่วม
          </template>
        </button>
      </div>

      <!-- Text Info -->
      <div class="card-body">
        <h3 class="community-name">{{ community.name }}</h3>
        <p class="community-desc">{{ community.description || 'ไม่มีคำอธิบายชุมชน' }}</p>
      </div>

      <!-- Footer Stats -->
      <div class="card-footer">
        <div class="stat-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>{{ (community.member_count || 0).toLocaleString() }} สมาชิก</span>
        </div>
        <div class="stat-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span>{{ (community.post_count || 0).toLocaleString() }} โพสต์</span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         CANCEL PENDING REQUEST CONFIRMATION MODAL
    ══════════════════════════════════════════ -->
    <ClientOnly>
      <Teleport to="body">
        <div
          v-if="showCancelModal"
          class="nexus-modal-overlay"
          @click.stop="showCancelModal = false"
        >
          <div class="nexus-modal-card-small" @click.stop>
            <div class="modal-warning-icon-box amber-glow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <h3 class="modal-card-title">ยกเลิกคำขอเข้าร่วมชุมชน?</h3>
            <p class="modal-card-desc">
              คุณต้องการยกเลิกคำขอเข้าร่วมกลุ่ม <strong>"{{ community.name }}"</strong> ใช่หรือไม่?
            </p>

            <div class="modal-footer-buttons-stack">
              <button 
                @click="confirmCancelRequest" 
                class="btn-modal-confirm-amber"
                :disabled="cancelling"
              >
                <span>{{ cancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกคำขอ' }}</span>
              </button>

              <button 
                @click="showCancelModal = false" 
                class="btn-modal-dismiss"
                :disabled="cancelling"
              >
                คงคำขอไว้
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  community: any
}>()

const emit = defineEmits(['toggle-join'])

const { cancelRequest } = useCommunities()
const toast = useToast()
const showCancelModal = ref(false)
const cancelling = ref(false)

function onToggleJoin() {
  if (props.community.is_joined) return

  // If already pending, prompt confirmation modal to cancel
  if (props.community.user_status === 'pending') {
    showCancelModal.value = true
    return
  }

  emit('toggle-join', props.community.slug)
}

async function confirmCancelRequest() {
  cancelling.value = true
  try {
    await cancelRequest(props.community.slug)
    showCancelModal.value = false
    toast.add({
      title: 'ยกเลิกคำขอเรียบร้อย',
      description: `ยกเลิกคำขอเข้าร่วม ${props.community.name} แล้ว`,
      color: 'primary'
    })
  } catch (err: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err.data?.message || 'ไม่สามารถยกเลิกคำขอได้',
      color: 'red'
    })
  } finally {
    cancelling.value = false
  }
}
</script>

<style scoped>
.community-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: var(--card-shadow);
}

.community-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.15);
  border-color: var(--brand);
}

.card-banner {
  height: 115px;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: var(--bg-tertiary);
  transition: transform 0.4s ease;
}

.community-card:hover .card-banner {
  transform: scale(1.03);
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.card-content {
  padding: 0 20px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: -32px;
  margin-bottom: 12px;
}

.card-avatar {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  border: 3.5px solid var(--bg-card);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: var(--bg-tertiary);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  padding: 7px 16px;
  border-radius: 100px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  font-family: inherit;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-join:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-join.joined {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: none;
  cursor: default;
}
.btn-join.joined:hover {
  transform: none;
  filter: none;
}

.btn-join.pending {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: none;
  cursor: pointer;
}
.btn-join.pending:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

.card-body {
  flex: 1;
  margin-bottom: 14px;
}

.community-name {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px;
  line-height: 1.3;
  transition: color 0.2s;
  letter-spacing: -0.2px;
}

.community-card:hover .community-name {
  color: var(--brand);
}

.community-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 18px;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-primary);
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

/* ── Modal Confirmation Styles ── */
.nexus-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.nexus-modal-card-small {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 22px;
  padding: 28px 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-warning-icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-warning-icon-box.amber-glow {
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.modal-card-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.modal-card-desc {
  font-size: 13.5px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.modal-footer-buttons-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 6px;
}

.btn-modal-confirm-amber {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 11px 20px;
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

.btn-modal-confirm-amber:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-modal-confirm-amber:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-modal-dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 20px;
  border-radius: 12px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-modal-dismiss:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
