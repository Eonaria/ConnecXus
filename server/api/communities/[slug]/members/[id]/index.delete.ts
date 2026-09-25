import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  const targetUserId = getRouterParam(event, 'id') || getRouterParam(event, 'userId')

  const db = getDb()

  // Verify community exists
  const [commRows] = await db.query<RowDataPacket[]>(
    'SELECT id, owner_id FROM communities WHERE slug = ? LIMIT 1',
    [slug]
  )
  const community = commRows[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  // Check if current user is owner or moderator
  const [memberRows] = await db.query<RowDataPacket[]>(
    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
    [community.id, user.userId]
  )
  const member = memberRows[0]

  if (!member || member.role !== 'owner') {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มเท่านั้นที่สามารถเตะสมาชิกได้' })
  }

  // Cannot kick the owner
  if (Number(targetUserId) === community.owner_id) {
    throw createError({ statusCode: 400, message: 'Cannot kick the community owner' })
  }

  // Kick member (delete from community_members)
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM community_members WHERE community_id = ? AND user_id = ?",
    [community.id, targetUserId]
  )

  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, message: 'Member not found in this community' })
  }

  return { success: true }
})
