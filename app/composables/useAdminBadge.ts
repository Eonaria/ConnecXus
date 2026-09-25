export const useAdminBadge = () => {
  const adminUnresolvedReports = useState('adminUnresolvedReports', () => 0)
  const adminBannedUsers = useState('adminBannedUsers', () => 0)
  const adminUnreadLogs = useState('adminUnreadLogs', () => 0)

  const totalAdminBadge = computed(() => {
    const reports = Number(adminUnresolvedReports.value) || 0
    const banned = Number(adminBannedUsers.value) || 0
    const logs = Number(adminUnreadLogs.value) || 0
    return Math.max(0, reports + banned + logs)
  })

  async function fetchAdminBadge() {
    try {
      const stats = await $fetch<any>('/api/admin/stats', {
        headers: { 'Cache-Control': 'no-cache' },
        params: { _t: Date.now() }
      })
      if (stats) {
        adminUnresolvedReports.value = Math.max(0, Number(stats.unresolvedReports) || 0)
        adminBannedUsers.value = Math.max(0, Number(stats.bannedUsers) || 0)
      }
    } catch {
      // ignore
    }
  }

  function setUnresolvedReports(count: number) {
    adminUnresolvedReports.value = Math.max(0, Number(count) || 0)
  }

  function setBannedUsers(count: number) {
    adminBannedUsers.value = Math.max(0, Number(count) || 0)
  }

  function setUnreadLogs(count: number) {
    adminUnreadLogs.value = Math.max(0, Number(count) || 0)
  }

  function incrementReports(amount = 1) {
    adminUnresolvedReports.value = Math.max(0, (Number(adminUnresolvedReports.value) || 0) + (Number(amount) || 1))
  }

  function decrementReports(amount = 1) {
    adminUnresolvedReports.value = Math.max(0, (Number(adminUnresolvedReports.value) || 0) - (Number(amount) || 1))
  }

  function incrementBanned(amount = 1) {
    adminBannedUsers.value = Math.max(0, (Number(adminBannedUsers.value) || 0) + (Number(amount) || 1))
  }

  function decrementBanned(amount = 1) {
    adminBannedUsers.value = Math.max(0, (Number(adminBannedUsers.value) || 0) - (Number(amount) || 1))
  }

  return {
    adminUnresolvedReports,
    adminBannedUsers,
    adminUnreadLogs,
    totalAdminBadge,
    fetchAdminBadge,
    setUnresolvedReports,
    setBannedUsers,
    setUnreadLogs,
    incrementReports,
    decrementReports,
    incrementBanned,
    decrementBanned
  }
}
