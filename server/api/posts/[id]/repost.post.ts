/**
 * POST /api/posts/[id]/repost
 * Quick Repost (ไม่มีข้อความ) หรือ Quote Post (มีข้อความเพิ่ม)
 */
export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const quoteContent = body?.content || null  // Optional quote text

  if (!postId) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const db = getDb()

  // Ensure repost columns/table exist
  try {
    await db.query('ALTER TABLE posts ADD COLUMN repost_of_id INT UNSIGNED DEFAULT NULL')
  } catch {}
  try {
    await db.query('ALTER TABLE posts ADD COLUMN is_repost TINYINT(1) DEFAULT 0')
  } catch {}

  // Check original post exists
  const [origRows] = await db.query(
    'SELECT id, content, user_id FROM posts WHERE id = ? AND is_deleted = 0 LIMIT 1',
    [postId]
  )
  const orig = (origRows as any[])[0]
  if (!orig) {
    throw createError({ statusCode: 404, message: 'ไม่พบโพสต์นี้' })
  }

  // Prevent reposting same post twice (if quick repost with no quote)
  if (!quoteContent) {
    const [existRows] = await db.query(
      'SELECT id FROM posts WHERE user_id = ? AND repost_of_id = ? AND is_repost = 1 AND content = "" AND is_deleted = 0 LIMIT 1',
      [currentUser.userId, postId]
    )
    if ((existRows as any[]).length > 0) {
      // Already reposted — return success silently (idempotent)
      return { success: true, id: (existRows as any[])[0].id, already: true }
    }
  }

  // Create the repost
  const [result] = await db.query(
    `INSERT INTO posts (user_id, content, repost_of_id, is_repost, created_at)
     VALUES (?, ?, ?, 1, NOW())`,
    [currentUser.userId, quoteContent || '', postId]
  )
  const newId = (result as any).insertId

  // Notify original post owner if not self
  if (orig.user_id && orig.user_id !== currentUser.userId) {
    try {
      await db.query(
        `INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (?, ?, 'repost', ?)`,
        [orig.user_id, currentUser.userId, postId]
      )
    } catch {}
  }

  // Get total repost count
  const [countRows] = await db.query(
    'SELECT COUNT(*) as cnt FROM posts WHERE repost_of_id = ? AND is_deleted = 0',
    [postId]
  )
  const repostCount = (countRows as any[])[0]?.cnt || 0

  // Realtime Broadcast
  const packet = {
    type: 'repost',
    payload: {
      post_id: Number(postId),
      action: 'repost',
      repost_count: repostCount,
      source_user_id: currentUser.userId,
      source_username: currentUser.username,
      target_user_id: orig.user_id
    }
  }
  broadcastGlobal(packet)
  broadcastToPost(postId, packet)

  if (orig.user_id && orig.user_id !== currentUser.userId) {
    broadcastToUser(orig.user_id, {
      type: 'notification_update',
      payload: { action: 'new_repost', post_id: Number(postId), source_username: currentUser.username, target_user_id: orig.user_id }
    })
  }

  return { success: true, id: newId, is_quote: !!quoteContent, repost_count: repostCount }
})
