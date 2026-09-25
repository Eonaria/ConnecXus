export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')
  if (!commentId) throw createError({ statusCode: 400, message: 'Invalid comment ID' })
  const db = getDb()
  const [commentRows] = await db.query('SELECT c.id, c.user_id, c.post_id FROM comments c WHERE c.id = ? AND c.is_deleted = 0 LIMIT 1', [commentId])
  const comment = (commentRows as any[])[0]
  if (!comment) throw createError({ statusCode: 404, message: 'äÁè¾º¤ÍÁàÁ¹µì¹Õé' })
  await db.query('INSERT IGNORE INTO comment_reposts (comment_id, user_id) VALUES (?, ?)', [commentId, user.userId])
  
  if (comment.user_id && comment.user_id !== user.userId) {
    try {
      await db.query(
        `INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (?, ?, 'repost', ?)`,
        [comment.user_id, user.userId, comment.post_id]
      )
      broadcastToUser(comment.user_id, {
        type: 'notification_update',
        payload: {
          action: 'new_repost',
          post_id: Number(comment.post_id),
          source_username: user.username,
          target_user_id: comment.user_id
        }
      })
    } catch {}
  }

  const [[{ count }]] = await db.query<any>('SELECT COUNT(*) as count FROM comment_reposts WHERE comment_id = ?', [commentId])
  const packet = { type: 'repost_comment', payload: { comment_id: Number(commentId), post_id: Number(comment.post_id), repost_count: Number(count), user_id: user.userId, action: 'repost' } }
  broadcastToPost(String(comment.post_id), packet)
  broadcastGlobal(packet)
  return { success: true, isReposted: true, repost_count: Number(count) }
})
