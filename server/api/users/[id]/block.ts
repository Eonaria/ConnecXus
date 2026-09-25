import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const targetUserId = getRouterParam(event, 'id')
  
  if (!targetUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Target User ID required' })
  }

  const db = getDb()

  if (event.method === 'POST') {
    // Block user
    try {
      await db.query(
        'INSERT IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)',
        [user.userId, targetUserId]
      )
    } catch (e) {}
    return { success: true, blocked: true }
  } 
  
  if (event.method === 'DELETE') {
    // Unblock user
    await db.query(
      'DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?',
      [user.userId, targetUserId]
    )
    return { success: true, blocked: false }
  }
})
