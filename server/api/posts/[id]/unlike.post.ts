/**
 * POST /api/posts/:id/unlike
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
    await db.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId])

    const [countRows] = await db.query('SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = ?', [postId])
    const likeCount = (countRows as any[])[0]?.cnt || 0

    const packet = {
      type: 'like_post',
      payload: {
        post_id: Number(postId),
        action: 'unlike',
        like_count: likeCount,
        source_username: user?.username || ''
      }
    }
    broadcastGlobal(packet)
    broadcastToPost(postId, packet)

    return { success: true, is_liked: false, message: 'ยกเลิกการกดถูกใจสำเร็จ' }
  } catch (e: any) {
    return { success: true, is_liked: false, message: 'ยกเลิกการกดถูกใจแล้ว' }
  }
})
