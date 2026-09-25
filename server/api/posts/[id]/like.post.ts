/**
 * POST /api/posts/:id/like
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const postId = getRouterParam(event, 'id')

  if (!postId) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const userId = user?.userId || 1

  try {
    const db = getDb()
    const [pRows] = await db.query('SELECT id, user_id FROM posts WHERE id = ? LIMIT 1', [postId])
    const post = (pRows as any[])[0]

    if (post) {
      await db.query(
        'INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [post.id, userId]
      )

      const postOwnerId = post.user_id
      if (postOwnerId && postOwnerId !== userId) {
        await db.query(
          `INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (?, ?, 'like', ?)`,
          [postOwnerId, userId, post.id]
        ).catch(e => console.error('Failed to insert like notification', e))
      }

      // Get current like count
      const [countRows] = await db.query('SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = ?', [postId])
      const likeCount = (countRows as any[])[0]?.cnt || 0

      // Get source username
      const sourceUsername = user?.username || ''

      // Broadcast to global and post room
      const packet = {
        type: 'like_post',
        payload: {
          post_id: Number(postId),
          action: 'like',
          like_count: likeCount,
          source_username: sourceUsername,
          source_user_id: userId,
          target_user_id: postOwnerId
        }
      }
      broadcastGlobal(packet)
      broadcastToPost(postId, packet)
      if (postOwnerId && postOwnerId !== userId) {
        broadcastToUser(postOwnerId, {
          type: 'notification_update',
          payload: { action: 'new_like', post_id: Number(postId), source_username: sourceUsername, target_user_id: postOwnerId }
        })
      }
    }

    return { success: true, is_liked: true, message: 'บันทึกการกดถูกใจสำเร็จ' }
  } catch (e: any) {
    return { success: true, is_liked: true, message: 'กดถูกใจแล้ว' }
  }
})
