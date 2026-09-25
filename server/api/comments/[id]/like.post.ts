/**
 * POST /api/comments/[id]/like
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')

  if (!commentId) {
    throw createError({ statusCode: 400, message: 'Invalid comment ID' })
  }

  const db = getDb()

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_comment_user (comment_id, user_id),
        INDEX idx_comment_likes_cmt (comment_id),
        INDEX idx_comment_likes_usr (user_id)
      )
    `)
  } catch {}

  const [commentRows] = await db.query(
    'SELECT c.id, c.user_id, c.post_id, u.username FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ? AND c.is_deleted = 0 LIMIT 1',
    [commentId]
  )
  const comment = (commentRows as any[])[0]
  if (!comment) {
    throw createError({ statusCode: 404, message: 'ไม่พบคอมเมนต์นี้' })
  }

  await db.query(
    'INSERT IGNORE INTO comment_likes (comment_id, user_id) VALUES (?, ?)',
    [commentId, user.userId]
  )

  if (comment.user_id && comment.user_id !== user.userId) {
    try {
      await db.query(
        `INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (?, ?, 'like', ?)`,
        [comment.user_id, user.userId, comment.post_id]
      )
      broadcastToUser(comment.user_id, {
        type: 'notification_update',
        payload: {
          action: 'like_comment',
          post_id: Number(comment.post_id),
          source_username: user.username,
          target_user_id: comment.user_id
        }
      })
    } catch {}
  }

  const [[{ count }]] = await db.query<any>(
    'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
    [commentId]
  )

  const packet = {
    type: 'like_comment',
    payload: {
      comment_id: Number(commentId),
      post_id: Number(comment.post_id),
      like_count: Number(count),
      user_id: user.userId,
      action: 'like'
    }
  }
  broadcastToPost(String(comment.post_id), packet)
  broadcastGlobal(packet)

  return { success: true, like_count: Number(count), isLiked: true }
})
