/**
 * PATCH /api/posts/[id]
 * Edit a post. Only the owner can edit the post content.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Post ID ไม่ถูกต้อง' })
  }

  if (!body.content || body.content.trim() === '') {
    throw createError({ statusCode: 400, message: 'เนื้อหาโพสต์ห้ามว่างเปล่า' })
  }

  const db = getDb()

  // Fetch the post to check ownership
  const [rows] = await db.query(
    'SELECT id, user_id FROM posts WHERE id = ? AND is_deleted = 0',
    [postId]
  )
  const posts = rows as any[]
  if (posts.length === 0) {
    throw createError({ statusCode: 404, message: 'ไม่พบโพสต์นี้' })
  }

  const post = posts[0]
  const isOwner = post.user_id === user.userId

  if (!isOwner) {
    throw createError({ statusCode: 403, message: 'คุณสามารถแก้ไขได้เฉพาะโพสต์ของตนเอง' })
  }

  await db.query('UPDATE posts SET content = ? WHERE id = ?', [body.content.trim(), postId])

  // Broadcast post_updated
  const updatePacket = { type: 'post_updated', payload: { post_id: Number(postId), content: body.content.trim() } }
  broadcastGlobal(updatePacket)
  broadcastToPost(postId, updatePacket)

  return { success: true, content: body.content.trim() }
})
