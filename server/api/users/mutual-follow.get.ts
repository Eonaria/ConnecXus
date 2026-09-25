import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }

  const db = getDb()

  // Get target user ID
  const [userRows] = await db.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [username])
  
  if (userRows.length === 0) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const targetId = userRows[0].id

  if (targetId === currentUser.userId) {
    return { mutual: true }
  }

  // Check mutual follow
  const [mutualCheck] = await db.query<RowDataPacket[]>(`
    SELECT 
      (SELECT COUNT(*) FROM user_followers WHERE follower_id = ? AND following_id = ?) AS i_follow_them,
      (SELECT COUNT(*) FROM user_followers WHERE follower_id = ? AND following_id = ?) AS they_follow_me
  `, [currentUser.userId, targetId, targetId, currentUser.userId])

  const mutual = mutualCheck[0].i_follow_them > 0 && mutualCheck[0].they_follow_me > 0

  return { mutual }
})
