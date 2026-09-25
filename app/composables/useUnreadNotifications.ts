import { useState } from '#imports'

export const useUnreadNotifications = () => {
  const totalUnreadNotifications = useState('totalUnreadNotifications', () => 0)

  const fetchInitialUnreadNotifications = async () => {
    try {
      const { count } = await $fetch<any>('/api/notifications/unread', {
        headers: { 'Cache-Control': 'no-cache' },
        params: { _t: Date.now() }
      })
      totalUnreadNotifications.value = Math.max(0, Number(count) || 0)
    } catch (e) {
      // ignore
    }
  }

  const decrementUnreadNotifications = (amount = 1) => {
    totalUnreadNotifications.value = Math.max(0, (Number(totalUnreadNotifications.value) || 0) - (Number(amount) || 1))
  }

  const incrementUnread = (amount = 1) => {
    totalUnreadNotifications.value = Math.max(0, (Number(totalUnreadNotifications.value) || 0) + (Number(amount) || 1))
  }

  const clearUnread = () => {
    totalUnreadNotifications.value = 0
  }

  const setUnreadNotificationsCount = (count: number) => {
    totalUnreadNotifications.value = Math.max(0, Number(count) || 0)
  }

  return {
    totalUnreadNotifications,
    fetchInitialUnreadNotifications,
    decrementUnreadNotifications,
    setUnreadNotificationsCount,
    incrementUnread,
    clearUnread
  }
}
