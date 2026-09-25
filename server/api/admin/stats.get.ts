/**
 * GET /api/admin/stats
 * Get overall system statistics for the admin dashboard.
 */
export default defineEventHandler(async (event) => {
  // Only admins can access
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = getDb()
  await cleanExpiredBans()

  const query = getQuery(event)
  const lastSeenBanned = Number(query.lastSeenBanned) || 0
  const lastSeenReports = Number(query.lastSeenReports) || 0

  // Aggregate stats using parallel queries
  const [[usersCountResult], [bannedCountResult], [postsTodayResult], [unresolvedReportsResult]] = await Promise.all([
    db.query('SELECT COUNT(*) as count FROM users'),
    db.query('SELECT COUNT(*) as count FROM users WHERE is_banned = 1'),
    db.query('SELECT COUNT(*) as count FROM posts WHERE DATE(created_at) = CURDATE()'),
    db.query('SELECT COUNT(*) as count FROM reports WHERE status = ?', ['pending'])
  ])

  const totalUsers = (usersCountResult as any[])[0].count
  const bannedUsers = (bannedCountResult as any[])[0].count
  const postsToday = (postsTodayResult as any[])[0].count
  const unresolvedReports = (unresolvedReportsResult as any[])[0].count
  const onlineCount = onlineUsers.size

  let newBannedCount = 0
  let newReportsCount = 0

  if (lastSeenBanned > 0) {
    const isoBanned = new Date(lastSeenBanned).toISOString()
    const [[newBannedRes]] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_banned = 1 AND (updated_at > ? OR created_at > ?)',
      [isoBanned, isoBanned]
    ) as any
    newBannedCount = (newBannedRes as any[])[0]?.count || 0
  } else {
    newBannedCount = bannedUsers
  }

  if (lastSeenReports > 0) {
    const isoReports = new Date(lastSeenReports).toISOString()
    const [[newReportsRes]] = await db.query(
      'SELECT COUNT(*) as count FROM reports WHERE status = ? AND created_at > ?',
      ['pending', isoReports]
    ) as any
    newReportsCount = (newReportsRes as any[])[0]?.count || 0
  } else {
    newReportsCount = unresolvedReports
  }

  return {
    totalUsers,
    bannedUsers,
    postsToday,
    unresolvedReports,
    newBannedCount,
    newReportsCount,
    onlineCount
  }
})
