<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isOpen && savedAccounts.length > 0" class="signin-as-backdrop" @click="close">
        <div class="signin-as-card" @click.stop>
          
          <!-- Card Header -->
          <div class="signin-as-header">
            <div class="header-title-group">
              <div class="header-icon-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h3 class="signin-as-title">Sign in as</h3>
                <span class="signin-as-subtitle">เลือกบัญชีที่บันทึกไว้เพื่อเข้าสู่ระบบ</span>
              </div>
            </div>

            <button @click="close" class="btn-close-circle" title="ปิด">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Accounts List -->
          <div class="accounts-list-container">
            <div
              v-for="acc in savedAccounts"
              :key="acc.id"
              class="account-row-item"
              @click="handleSelect(acc)"
            >
              <!-- Avatar -->
              <div class="account-avatar-wrapper">
                <img v-if="acc.avatar_url" :src="acc.avatar_url" :alt="acc.display_name" class="avatar-img" />
                <div v-else class="avatar-fallback">
                  {{ (acc.display_name || acc.username || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="online-indicator"></div>
              </div>

              <!-- Info -->
              <div class="account-details">
                <div class="name-badge-row">
                  <span class="account-name">{{ acc.display_name || acc.username }}</span>
                  <span v-if="acc.role === 'admin'" class="role-badge admin">Admin</span>
                </div>
                <span class="account-handle">@{{ acc.username }}</span>
              </div>

              <!-- Quick Arrow -->
              <div class="account-select-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="signin-as-footer">
            <button type="button" @click="handleUseAnother" class="btn-other-account">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>ใช้บัญชีอื่น</span>
            </button>

            <button type="button" @click="close" class="btn-pill-close">
              Close
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SavedAccount } from '~/composables/useSavedAccounts'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'select', account: SavedAccount): void
  (e: 'use-another'): void
}>()

const { savedAccounts, loadSavedAccounts } = useSavedAccounts()
const router = useRouter()

const internalOpen = ref(false)

const isOpen = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : internalOpen.value),
  set: (val: boolean) => {
    internalOpen.value = val
    emit('update:modelValue', val)
  }
})

function close() {
  isOpen.value = false
}

function handleSelect(acc: SavedAccount) {
  emit('select', acc)
  close()
}

function handleUseAnother() {
  emit('use-another')
  close()
}

onMounted(() => {
  loadSavedAccounts()
})
</script>

<style scoped>
.signin-as-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
}

.signin-as-card {
  width: 100%;
  max-width: 380px;
  background: rgba(18, 18, 28, 0.94);
  border: 1.5px solid rgba(139, 92, 246, 0.35);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 
    0 24px 50px -10px rgba(0, 0, 0, 0.8),
    0 0 35px rgba(124, 58, 237, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.signin-as-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon-pill {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--brand-light, rgba(99, 102, 241, 0.15));
  border: 1px solid var(--brand, #6366f1);
  color: var(--brand, #818cf8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.signin-as-title {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.3px;
}

.signin-as-subtitle {
  font-size: 11.5px;
  color: #94a3b8;
  display: block;
}

.btn-close-circle {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
  flex-shrink: 0;
}

.btn-close-circle:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* Accounts List */
.accounts-list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-row-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.account-row-item:hover {
  background: rgba(99, 102, 241, 0.14);
  border-color: rgba(139, 92, 246, 0.45);
  transform: translateX(3px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
}

.account-avatar-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(139, 92, 246, 0.5);
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #12121c;
}

.account-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.name-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.account-name {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge.admin {
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 100px;
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  text-transform: uppercase;
}

.account-handle {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-select-arrow {
  color: #64748b;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.account-row-item:hover .account-select-arrow {
  color: #a78bfa;
  transform: translateX(2px);
}

/* Footer Actions */
.signin-as-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-other-account {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #a78bfa;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  padding: 6px 4px;
  font-family: inherit;
}

.btn-other-account:hover {
  color: #c4b5fd;
  text-decoration: underline;
}

.btn-pill-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 18px;
  border-radius: 100px;
  background: rgba(196, 181, 253, 0.22);
  border: 1.5px solid rgba(196, 181, 253, 0.6);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.2);
}

.btn-pill-close:hover {
  background: rgba(196, 181, 253, 0.35);
  border-color: #c4b5fd;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
}

/* Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
