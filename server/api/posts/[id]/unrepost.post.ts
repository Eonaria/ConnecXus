/**
 * POST /api/posts/[id]/unrepost
 */
export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  if (!postId) throw createError({ statusCode: 400, message: 'Invalid post ID' })
  const db = getDb()
  const [existRows] = await db.query(
    `SELECT id FROM posts WHERE user_id = ? AND repost_of_id = ? AND is_repost = 1 AND content = "" AND is_deleted = 0 LIMIT 1`,
    [currentUser.userId, postId]
  )
  const repost = (existRows as any[])[0]
  if (repost) {
    await db.query(`UPDATE posts SET is_deleted = 1 WHERE id = ?`, [repost.id])

    const [countRows] = await db.query(
      'SELECT COUNT(*) as cnt FROM posts WHERE repost_of_id = ? AND is_deleted = 0',
      [postId]
    )
    const repostCount = (countRows as any[])[0]?.cnt || 0

    const packet = {
      type: 'unrepost',
      payload: {
        post_id: Number(postId),
        action: 'unrepost',
        repost_count: repostCount,
        user_id: currentUser.userId,
        source_username: currentUser.username
      }
    }
    broadcastGlobal(packet)
    broadcastToPost(postId, packet)

    return { success: true, message: 'unreposted', repost_count: repostCount }
  }
  return { success: true, message: 'not found' }
})