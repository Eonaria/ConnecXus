import { ref } from 'vue'

type TargetType = 'user' | 'post' | 'comment' | 'message' | 'community'

interface ReportModalState {
  isOpen: boolean
  targetType: TargetType | null
  targetId: number | null
  communityId: number | null
}

const state = ref<ReportModalState>({
  isOpen: false,
  targetType: null,
  targetId: null,
  communityId: null
})

export const useReportModal = () => {
  const openReportModal = (targetType: TargetType, targetId: number, communityId?: number) => {
    state.value = {
      isOpen: true,
      targetType,
      targetId,
      communityId: communityId || null
    }
  }

  const closeReportModal = () => {
    state.value.isOpen = false
    setTimeout(() => {
      state.value = {
        isOpen: false,
        targetType: null,
        targetId: null,
        communityId: null
      }
    }, 300)
  }

  return {
    state,
    openReportModal,
    closeReportModal
  }
}
