import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const db = getDb()
  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT 
      l.id, l.action, l.target_type, l.target_id, l.details, l.created_at,
      u.display_name as admin_name,
      u.username as admin_username,
      tu.username as target_username,
      tu.display_name as target_display_name,
      tu.avatar_url as target_avatar_url,
      tc.name as target_community_name,
      tc.slug as target_community_slug
    FROM system_logs l
    JOIN users u ON l.admin_id = u.id
    LEFT JOIN users tu ON l.target_type = 'user' AND l.target_id = tu.id
    LEFT JOIN communities tc ON l.target_type = 'community' AND l.target_id = tc.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `)

  return rows
})
