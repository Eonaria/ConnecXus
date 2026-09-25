import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')

  const db = getDb()

  // Verify community exists and user is owner or moderator
  const [commRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM communities WHERE slug = ? LIMIT 1',
    [slug]
  )
  const community = commRows[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  const [memberRows] = await db.query<RowDataPacket[]>(
    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
    [community.id, user.userId]
  )
  const member = memberRows[0]

  const isAllowed = user.userId === community.owner_id || member?.role === 'owner' || member?.role === 'moderator' || user.role === 'admin'
  if (!isAllowed) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถดูรายงานได้' })
  }

  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT 
      r.id,
      r.target_type,
      r.reason,
      r.status,
      r.created_at,
      r.reported_user_id,
      r.reported_post_id,
      r.reported_comment_id,
      reporter.id as reporter_id,
      reporter.username as reporter_username,
      reporter.display_name as reporter_name,
      reporter.avatar_url as reporter_avatar,
      reported.username as reported_username,
      reported.display_name as reported_name,
      reported.avatar_url as reported_avatar,
      p.content as post_content,
      c.content as comment_content
    FROM reports r
    LEFT JOIN users reporter ON r.reporter_id = reporter.id
    LEFT JOIN users reported ON r.reported_user_id = reported.id
    LEFT JOIN posts p ON r.reported_post_id = p.id
    LEFT JOIN comments c ON r.reported_comment_id = c.id
    WHERE r.community_id = ?
    ORDER BY r.created_at DESC
  `, [community.id])

  return { reports: rows }
})
