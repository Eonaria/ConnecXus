import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const targetUserId = getRouterParam(event, 'id') || getRouterParam(event, 'userId')
  const body = await readBody(event)
  const newRole = body?.role // 'member' or 'moderator'
  
  if (newRole !== 'member' && newRole !== 'moderator') {
    throw createError({ statusCode: 400, message: 'Invalid role' })
  }

  const user = await requireAuth(event)
  const db = getDb()

  // Get community ID
  const [commRows] = await db.query<RowDataPacket[]>(
    `SELECT c.id FROM communities c WHERE c.slug = ? LIMIT 1`,
    [slug]
  )
  const community = commRows[0]
  if (!community) throw createError({ statusCode: 404, message: 'Community not found' })

  // Check if current user is owner (only owner can promote/demote)
  const [currentMemberRows] = await db.query<RowDataPacket[]>(
    `SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1`,
    [community.id, user.userId]
  )
  const currentMember = currentMemberRows[0]
  if (!currentMember || currentMember.role !== 'owner') {
    throw createError({ statusCode: 403, message: 'Forbidden: Only the owner can change roles' })
  }

  // Prevent modifying the owner's role
  const [targetMemberRows] = await db.query<RowDataPacket[]>(
    `SELECT role FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1`,
    [community.id, targetUserId]
  )
  const targetMember = targetMemberRows[0]
  if (!targetMember) throw createError({ statusCode: 404, message: 'Member not found' })
  if (targetMember.role === 'owner') {
    throw createError({ statusCode: 400, message: 'Cannot modify the owner' })
  }

  // Update role
  await db.query<ResultSetHeader>(
    `UPDATE community_members SET role = ? WHERE community_id = ? AND user_id = ?`,
    [newRole, community.id, targetUserId]
  )

  return { success: true }
})
