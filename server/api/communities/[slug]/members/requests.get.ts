export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const slug = getRouterParam(event, 'slug')
  const db = getDb()

  const [cRows] = await db.query(
    'SELECT id, owner_id FROM communities WHERE slug = ? LIMIT 1',
    [slug]
  )
  const community = (cRows as any[])[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  const [memberRows] = await db.query(
    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
    [community.id, user.userId]
  )
  const member = (memberRows as any[])[0]
  const isAllowed = user.userId === community.owner_id || member?.role === 'owner' || member?.role === 'moderator' || user.role === 'admin'

  if (!isAllowed) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถจัดการคำขอได้' })
  }

  const [reqRows] = await db.query(
    `SELECT cm.id, cm.user_id, u.display_name, u.username, u.avatar_url, cm.joined_at
     FROM community_members cm
     JOIN users u ON u.id = cm.user_id
     WHERE cm.community_id = ? AND cm.status = 'pending'
     ORDER BY cm.joined_at ASC`,
    [community.id]
  )

  return { requests: reqRows as any[] }
})
