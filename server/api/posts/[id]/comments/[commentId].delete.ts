/**
 * DELETE /api/posts/[id]/comments/[commentId]
 * Delete a specific comment. Admins can delete any comment.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const commentId = getRouterParam(event, 'commentId')
  if (!commentId) throw createError({ statusCode: 400, message: 'Missing commentId' })

  const db = getDb()

  const [commentRows] = await db.query(
    'SELECT c.user_id, p.community_id FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.id = ?', 
    [commentId]
  )
  const comment = (commentRows as any[])[0]

  if (!comment) {
    throw createError({ statusCode: 404, message: 'Comment not found' })
  }

  const isOwner = comment.user_id === user.userId
  const isAdmin = user.role === 'admin'
  let isCommunityMod = false

  if (comment.community_id && !isOwner && !isAdmin) {
    const [modRows] = await db.query(
      `SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1`,
      [comment.community_id, user.userId]
    )
    const mod = (modRows as any[])[0]
    if (mod && (mod.role === 'owner' || mod.role === 'moderator')) {
      isCommunityMod = true
    }
  }

  if (!isOwner && !isAdmin && !isCommunityMod) {
    throw createError({ statusCode: 403, message: 'Forbidden: คุณไม่มีสิทธิ์ลบคอมเมนต์นี้' })
  }

  // Delete comment
  await db.query('UPDATE comments SET is_deleted = 1 WHERE id = ?', [commentId])

  const [countRows] = await db.query('SELECT COUNT(*) as cnt FROM comments WHERE post_id = ? AND is_deleted = 0', [comment.post_id])
  const commentCount = (countRows as any[])[0]?.cnt || 0

  if (isAdmin && !isOwner) {
    await db.query(
      `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.userId, 'delete_comment', 'comment', commentId, 'ลบคอมเมนต์ (ผิดกฎ/ถูกรายงาน)']
    )
  }

  // Realtime broadcast
  const deletePacket = {
    type: 'comment_deleted',
    payload: {
      comment_id: Number(commentId),
      post_id: Number(comment.post_id),
      comment_count: commentCount
    }
  }
  broadcastGlobal(deletePacket)
  broadcastToPost(comment.post_id, deletePacket)

  return { success: true, comment_count: commentCount }
})
