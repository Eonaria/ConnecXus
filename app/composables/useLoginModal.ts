import { ref } from 'vue'

const isOpen = ref(false)
const modalMessage = ref('กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้')

export const useLoginModal = () => {
  const openLoginModal = (message?: string) => {
    if (message) modalMessage.value = message
    isOpen.value = true
  }

  const closeLoginModal = () => {
    isOpen.value = false
    setTimeout(() => {
      modalMessage.value = 'กรุณาเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้'
    }, 300)
  }

  return {
    isOpen,
    modalMessage,
    openLoginModal,
    closeLoginModal
  }
}
