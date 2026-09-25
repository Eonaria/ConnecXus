import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  const reportId = getRouterParam(event, 'id')

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
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถจัดการรายงานได้' })
  }

  // Resolve the report
  const [result] = await db.query<ResultSetHeader>(
    "UPDATE reports SET status = 'resolved' WHERE id = ? AND community_id = ?",
    [reportId, community.id]
  )

  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, message: 'Report not found in this community' })
  }

  return { success: true }
})
