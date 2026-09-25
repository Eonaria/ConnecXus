<template>
  <div v-if="state.isOpen" class="report-modal-overlay" @click.self="closeReportModal">
    <div class="report-modal">
      <div class="modal-header">
        <h3>รายงานปัญหา</h3>
        <button class="close-btn" @click="closeReportModal">
          <i class="ri-close-line"></i>
        </button>
      </div>

      <div class="modal-body">
        <p class="subtitle">กรุณาเลือกเหตุผลที่ต้องการรายงาน {{ targetLabel }}</p>

        <div class="reasons-list">
          <label v-for="reason in reasonsList" :key="reason" class="reason-item">
            <input type="radio" :value="reason" v-model="selectedReason" />
            <span class="custom-radio"></span>
            <span class="reason-text">{{ reason }}</span>
          </label>
        </div>

        <div class="details-section">
          <label>รายละเอียดเพิ่มเติม (บังคับ)</label>
          <textarea 
            v-model="details" 
            placeholder="โปรดอธิบายรายละเอียดเพิ่มเติมเพื่อให้ผู้ดูแลระบบตรวจสอบได้รวดเร็วขึ้น..."
            rows="4"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="nexus-btn btn-outline" @click="closeReportModal" :disabled="isSubmitting">ยกเลิก</button>
        <button class="nexus-btn btn-danger" @click="submitReport" :disabled="isSubmitting || !selectedReason || !details.trim()">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>ส่งรายงาน</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReportModal } from '~/composables/useReportModal'

const { state, closeReportModal } = useReportModal()
const toast = useToast()

const selectedReason = ref('')
const details = ref('')
const isSubmitting = ref(false)

const reasonsList = [
  'เนื้อหาไม่เหมาะสม / อนาจาร',
  'สแปม / โฆษณาขยะ',
  'การกลั่นแกล้ง / คุกคาม (Cyberbullying)',
  'ข้อมูลเท็จ / หลอกลวง (Scam)',
  'ละเมิดลิขสิทธิ์ / ทรัพย์สินทางปัญญา',
  'คำพูดที่สร้างความเกลียดชัง (Hate Speech)',
  'เหตุผลอื่นๆ'
]

const targetLabel = computed(() => {
  switch (state.value.targetType) {
    case 'user': return 'ผู้ใช้นี้'
    case 'post': return 'โพสต์นี้'
    case 'comment': return 'คอมเมนต์นี้'
    case 'message': return 'ข้อความนี้'
    case 'community': return 'ชุมชนนี้'
    default: return 'สิ่งนี้'
  }
})

async function submitReport() {
  if (!selectedReason.value || !details.value.trim()) return

  isSubmitting.value = true
  try {
    const fullReason = `${selectedReason.value} - ${details.value.trim()}`
    
    await $fetch('/api/reports', {
      method: 'POST',
      body: {
        targetType: state.value.targetType,
        targetId: state.value.targetId,
        communityId: state.value.communityId,
        reason: fullReason
      }
    })

    toast.add({
      title: 'ส่งรายงานสำเร็จ',
      description: 'ระบบได้รับรายงานของคุณเรียบร้อยแล้ว ขอบคุณที่ช่วยทำให้ชุมชนของเราน่าอยู่ขึ้น',
      color: 'green'
    })
    closeReportModal()
    
    // Reset form
    selectedReason.value = ''
    details.value = ''
  } catch (error: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: error.data?.message || 'ไม่สามารถส่งรายงานได้ โปรดลองอีกครั้ง',
      color: 'red'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.report-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 12, 24, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.report-modal {
  background: #15182b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: modal-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
}

@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #fff;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 1.5rem;
}

.subtitle {
  color: #94a3b8;
  margin: 0 0 1.25rem 0;
  font-size: 0.95rem;
}

.reasons-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.reason-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.reason-item input[type="radio"] {
  display: none;
}

.custom-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reason-item input[type="radio"]:checked + .custom-radio {
  border-color: #f43f5e;
}

.reason-item input[type="radio"]:checked + .custom-radio::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f43f5e;
}

.reason-text {
  color: #cbd5e1;
  font-size: 0.95rem;
}

.details-section label {
  display: block;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.details-section textarea {
  width: 100%;
  background: #0f111a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.2s;
}

.details-section textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.nexus-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.btn-outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.btn-danger {
  background: #f43f5e;
  border: none;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e11d48;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
