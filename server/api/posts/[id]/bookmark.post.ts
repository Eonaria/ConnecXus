/**
 * POST /api/posts/[id]/bookmark
 * Toggle bookmark on a post for the current user.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')

  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Post ID ไม่ถูกต้อง' })
  }

  const db = getDb()

  // Ensure the table exists
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS post_bookmarks (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        post_id INT UNSIGNED NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_post (user_id, post_id)
      )
    `)
  } catch {}

  // Check if already bookmarked
  const [existing] = await db.query(
    'SELECT id FROM post_bookmarks WHERE user_id = ? AND post_id = ?',
    [user.userId, postId]
  )
  const rows = existing as any[]

  if (rows.length > 0) {
    // Remove bookmark
    await db.query('DELETE FROM post_bookmarks WHERE user_id = ? AND post_id = ?', [user.userId, postId])
    return { success: true, bookmarked: false }
  } else {
    // Add bookmark
    await db.query('INSERT INTO post_bookmarks (user_id, post_id) VALUES (?, ?)', [user.userId, postId])
    return { success: true, bookmarked: true }
  }
})
