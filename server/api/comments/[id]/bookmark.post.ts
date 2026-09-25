export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')
  if (!commentId) throw createError({ statusCode: 400, message: 'Invalid comment ID' })
  const db = getDb()
  const [existing] = await db.query<any[]>('SELECT id FROM comment_bookmarks WHERE comment_id = ? AND user_id = ? LIMIT 1', [commentId, user.userId])
  let bookmarked = false
  if (existing && existing.length > 0) {
    await db.query('DELETE FROM comment_bookmarks WHERE comment_id = ? AND user_id = ?', [commentId, user.userId])
    bookmarked = false
  } else {
    await db.query('INSERT IGNORE INTO comment_bookmarks (comment_id, user_id) VALUES (?, ?)', [commentId, user.userId])
    bookmarked = true
  }
  return { success: true, bookmarked }
})
