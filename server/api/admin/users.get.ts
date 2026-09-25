import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = getDb()
  await cleanExpiredBans()

  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT 
      u.id, u.username, u.display_name, u.email, u.role, u.avatar_url, u.is_banned, u.suspended_until, u.ban_reason, u.banned_at, u.created_at,
      (SELECT COUNT(*) FROM reports r WHERE r.reported_user_id = u.id) as report_count
    FROM users u 
    ORDER BY u.created_at DESC
  `)

  return { users: rows }
})
