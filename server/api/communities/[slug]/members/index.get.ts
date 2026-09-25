import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const user = await getRequestUser(event)
  
  const db = getDb()

  // Get community ID and info
  const [commRows] = await db.query<RowDataPacket[]>(
    `SELECT c.id, c.is_private, c.owner_id FROM communities c WHERE c.slug = ? LIMIT 1`,
    [slug]
  )
  const community = commRows[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  let isJoined = false
  let isOwner = false
  let isMod = false
  let isAdmin = user?.role === 'admin'

  if (user) {
    const [memberRows] = await db.query<RowDataPacket[]>(
      `SELECT role, status FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1`,
      [community.id, user.userId]
    )
    const currentMember = memberRows[0]
    isJoined = currentMember && currentMember.status === 'active'
    isOwner = Number(user.userId) === Number(community.owner_id) || currentMember?.role === 'owner'
    isMod = currentMember?.role === 'moderator'
  }

  // If private community and user is not member/owner/mod/admin, require membership
  if (community.is_private && !isJoined && !isOwner && !isMod && !isAdmin) {
    throw createError({ statusCode: 403, message: 'ชุมชนนี้เป็นชุมชนปิด เฉพาะสมาชิกเท่านั้นที่สามารถดูรายชื่อสมาชิกได้' })
  }

  // Fetch all active members
  const [members] = await db.query<RowDataPacket[]>(
    `SELECT 
      cm.user_id, cm.role, cm.joined_at,
      u.username, u.display_name, u.avatar_url
     FROM community_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.community_id = ? AND cm.status = 'active'
     ORDER BY 
       CASE 
         WHEN cm.role = 'owner' THEN 1 
         WHEN cm.role = 'moderator' THEN 2 
         ELSE 3 
       END, 
       cm.joined_at ASC`,
    [community.id]
  )

  return { members }
})
