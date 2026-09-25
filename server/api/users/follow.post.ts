/**
 * POST /api/users/[username]/follow
 * ติดตาม หรือ เลิกติดตาม (toggle)
 */
export default defineEventHandler(async (event) => {
  try {
    const currentUser = await requireAuth(event)

    const body = await readBody(event)
    const targetUsername = body?.username
    if (!targetUsername) {
      throw createError({ statusCode: 400, message: 'Missing username in body' })
    }

    const db = getDb()

    // Ensure followers table exists
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_followers (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          follower_id INT UNSIGNED NOT NULL COMMENT 'คนที่กดติดตาม',
          following_id INT UNSIGNED NOT NULL COMMENT 'เจ้าของโปรไฟล์ที่ถูกติดตาม',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_follow (follower_id, following_id),
          CONSTRAINT fk_uf_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_uf_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)
    } catch {}

    // Get target user ID
    const [targetRows] = await db.query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [targetUsername]
    )
    const targets = targetRows as any[]
    if (!targets.length) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }
    const targetId = targets[0].id

    // Cannot follow yourself
    if (targetId === currentUser.userId) {
      throw createError({ statusCode: 400, message: 'ไม่สามารถติดตามตัวเองได้' })
    }

    // Check if already following
    const [existRows] = await db.query(
      'SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ? LIMIT 1',
      [currentUser.userId, targetId]
    )
    const exists = (existRows as any[]).length > 0

    if (exists) {
      // Unfollow
      await db.query(
        'DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?',
        [currentUser.userId, targetId]
      )

      broadcastGlobal({
        type: 'unfollow',
        payload: { source_username: currentUser.username, target_username: targetUsername, target_user_id: targetId }
      })

      return { success: true, following: false }
    } else {
      // Follow
      await db.query(
        'INSERT INTO user_followers (follower_id, following_id) VALUES (?, ?)',
        [currentUser.userId, targetId]
      )
      
      // Notify the target user
      await db.query(
        'INSERT INTO notifications (user_id, sender_id, type) VALUES (?, ?, ?)',
        [targetId, currentUser.userId, 'follow']
      ).catch(e => console.error('Failed to insert follow notification', e))

      // Broadcast new_follower
      broadcastGlobal({
        type: 'new_follower',
        payload: { source_user_id: currentUser.userId, source_username: currentUser.username, target_username: targetUsername, target_user_id: targetId }
      })
      broadcastToUser(targetId, {
        type: 'notification_update',
        payload: { action: 'new_follower', source_username: currentUser.username, target_user_id: targetId }
      })

      return { success: true, following: true }
    }
  } catch (err: any) {
    console.error('FOLLOW ERROR:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal Server Error',
      data: err
    })
  }
})
