/**
 * PUT /api/posts/[id]/visibility
 * Update post visibility (public, followers, mutual, private)
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Post ID ไม่ถูกต้อง' })
  }

  const allowed = ['public', 'followers', 'mutual', 'private']
  const visibility = body?.visibility

  if (!visibility || !allowed.includes(visibility)) {
    throw createError({ statusCode: 400, message: 'ระดับความเป็นส่วนตัวไม่ถูกต้อง (public, followers, mutual, private)' })
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
  if (post.user_id !== user.userId) {
    throw createError({ statusCode: 403, message: 'คุณสามารถเปลี่ยนการมองเห็นได้เฉพาะโพสต์ของตนเอง' })
  }

  await db.query('UPDATE posts SET visibility = ? WHERE id = ?', [visibility, postId])

  // Broadcast realtime event
  const updatePacket = {
    type: 'post_visibility_updated',
    payload: {
      post_id: Number(postId),
      visibility
    }
  }
  try {
    broadcastGlobal(updatePacket)
    broadcastToPost(postId, updatePacket)
  } catch (err) {
    console.error('Broadcast error:', err)
  }

  return { success: true, visibility }
})
