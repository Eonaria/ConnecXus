export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')
  if (!commentId) throw createError({ statusCode: 400, message: 'Invalid comment ID' })
  const db = getDb()
  const [commentRows] = await db.query('SELECT id, post_id FROM comments WHERE id = ? AND is_deleted = 0 LIMIT 1', [commentId])
  const comment = (commentRows as any[])[0]
  await db.query('DELETE FROM comment_reposts WHERE comment_id = ? AND user_id = ?', [commentId, user.userId])
  const [[{ count }]] = await db.query<any>('SELECT COUNT(*) as count FROM comment_reposts WHERE comment_id = ?', [commentId])
  if (comment) {
    const packet = { type: 'repost_comment', payload: { comment_id: Number(commentId), post_id: Number(comment.post_id), repost_count: Number(count), user_id: user.userId, action: 'unrepost' } }
    broadcastToPost(String(comment.post_id), packet)
    broadcastGlobal(packet)
  }
  return { success: true, isReposted: false, repost_count: Number(count) }
})
