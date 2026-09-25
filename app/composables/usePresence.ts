/**
 * composables/usePresence.ts
 * Tracks which users are currently online via WebSocket presence events
 * Usage:
 *   const { isOnline, onlineCount } = usePresence()
 *   isOnline(userId) // returns true if user is online
 */

const onlineUserIds = ref(new Set<number>())

export const usePresence = () => {
  const { subscribe } = useRealtime()

  function initPresence() {
    if (import.meta.server) return
    subscribe((event) => {
      if (event.type === 'user_online' && event.payload?.user_id) {
        onlineUserIds.value = new Set([...onlineUserIds.value, event.payload.user_id])
      }
      if (event.type === 'user_offline' && event.payload?.user_id) {
        const next = new Set(onlineUserIds.value)
        next.delete(event.payload.user_id)
        onlineUserIds.value = next
      }
    })
  }

  function isOnline(userId: number | undefined | null): boolean {
    if (!userId) return false
    return onlineUserIds.value.has(userId)
  }

  const onlineCount = computed(() => onlineUserIds.value.size)

  return { isOnline, onlineCount, initPresence, onlineUserIds }
}
