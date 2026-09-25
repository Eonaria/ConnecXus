import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  const targetUserId = getRouterParam(event, 'id')

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
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มเท่านั้นที่สามารถแบนสมาชิกได้' })
  }

  // Cannot ban the owner
  if (Number(targetUserId) === community.owner_id) {
    throw createError({ statusCode: 400, message: 'Cannot ban the community owner' })
  }

  // Ban member (set status to 'banned')
  // We use INSERT ON DUPLICATE KEY UPDATE in case they were already kicked but we want to preemptively ban them
  // Actually, we can just UPDATE if they exist, or INSERT if they don't
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO community_members (community_id, user_id, role, status)
     VALUES (?, ?, 'member', 'banned')
     ON DUPLICATE KEY UPDATE status = 'banned'`,
    [community.id, targetUserId]
  )

  return { success: true }
})
