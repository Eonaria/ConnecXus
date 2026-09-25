/**
 * DELETE /api/posts/[id]
 * Soft-delete a post. Only the owner or an admin can delete.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')

  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Post ID ไม่ถูกต้อง' })
  }

  const db = getDb()

  // Fetch the post to check ownership
  const [rows] = await db.query(
    'SELECT id, user_id, community_id FROM posts WHERE id = ? AND is_deleted = 0',
    [postId]
  )
  const posts = rows as any[]
  if (posts.length === 0) {
    throw createError({ statusCode: 404, message: 'ไม่พบโพสต์นี้' })
  }

  const post = posts[0]
  const isOwner = post.user_id === user.userId
  const isAdmin = user.role === 'admin'
  let isCommunityMod = false

  if (post.community_id && !isOwner && !isAdmin) {
    const [modRows] = await db.query(
      `SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1`,
      [post.community_id, user.userId]
    )
    const mod = (modRows as any[])[0]
    if (mod && (mod.role === 'owner' || mod.role === 'moderator')) {
      isCommunityMod = true
    }
  }

  if (!isOwner && !isAdmin && !isCommunityMod) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ลบโพสต์นี้' })
  }

  await db.query('UPDATE posts SET is_deleted = 1 WHERE id = ?', [postId])
  await db.query('DELETE FROM notifications WHERE post_id = ?', [postId])

  if (isAdmin && !isOwner) {
    await db.query(
      `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.userId, 'delete_post', 'post', postId, 'ลบโพสต์ (ผิดกฎ/ถูกรายงาน)']
    )
  }

  // Broadcast post_deleted to global and post room
  const deletePacket = { type: 'post_deleted', payload: { post_id: Number(postId) } }
  broadcastGlobal(deletePacket)
  broadcastToPost(postId, deletePacket)

  return { success: true }
})
