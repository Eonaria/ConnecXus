export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const slug = getRouterParam(event, 'slug')
  const inviteId = getRouterParam(event, 'id')
  const db = getDb()

  // Verify community & permission
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
  const isAllowed = Number(user.userId) === Number(community.owner_id) || member?.role === 'owner' || member?.role === 'moderator' || user.role === 'admin'

  if (!isAllowed) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถยกเลิกลิงก์เชิญได้' })
  }

  await db.query(
    'DELETE FROM community_invites WHERE id = ? AND community_id = ?',
    [inviteId, community.id]
  )

  return { success: true }
})
