import { useState } from '#imports'

export const useUnreadNotifications = () => {
  const totalUnreadNotifications = useState('totalUnreadNotifications', () => 0)

  const fetchInitialUnreadNotifications = async () => {
    try {
      const { count } = await $fetch<any>('/api/notifications/unread')
      totalUnreadNotifications.value = count
    } catch (e) {
      console.error('Failed to fetch unread notifications count', e)
    }
  }

  const decrementUnreadNotifications = () => {
    if (totalUnreadNotifications.value > 0) {
      totalUnreadNotifications.value--
    }
  }

  const setUnreadNotificationsCount = (count: number) => {
    totalUnreadNotifications.value = count
  }
  
  const clearUnread = () => {
    totalUnreadNotifications.value = 0
  }
  
  const incrementUnread = () => {
    totalUnreadNotifications.value++
  }

  return {
    totalUnreadNotifications,
    fetchInitialUnreadNotifications,
    decrementUnreadNotifications,
    setUnreadNotificationsCount,
    clearUnread,
    incrementUnread
  }
}
