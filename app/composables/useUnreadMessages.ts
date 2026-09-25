export const useUnreadMessages = () => {
  const totalUnread = useState('totalUnread', () => 0)

  async function fetchInitialUnread() {
    try {
      const { unread_count } = await $fetch<any>('/api/messages/unread')
      totalUnread.value = Math.max(0, Number(unread_count) || 0)
    } catch (e) {
      // ignore
    }
  }

  function setUnreadCount(count: number) {
    totalUnread.value = Math.max(0, Number(count) || 0)
  }

  function decrementUnread(amount = 1) {
    totalUnread.value = Math.max(0, (Number(totalUnread.value) || 0) - (Number(amount) || 1))
  }

  function incrementUnread(amount = 1) {
    totalUnread.value = Math.max(0, (Number(totalUnread.value) || 0) + (Number(amount) || 1))
  }

  function incrementUnreadMessages(amount = 1) {
    totalUnread.value = Math.max(0, (Number(totalUnread.value) || 0) + (Number(amount) || 1))
  }

  function clearUnreadMessages() {
    totalUnread.value = 0
  }

  return {
    totalUnread,
    fetchInitialUnread,
    setUnreadCount,
    decrementUnread,
    incrementUnread,
    incrementUnreadMessages,
    clearUnreadMessages
  }
}
