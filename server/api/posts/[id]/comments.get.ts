/**
 * GET /api/posts/:id/comments
 * Fetch all comments for a post from MySQL comments table
 */
export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')

  if (!postId) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  // No mock comments anymore

  const user = await getRequestUser(event)
  const userId = user?.userId || 0

  try {
    const db = getDb()

    // Ensure comment_likes table exists
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS comment_likes (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          comment_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_comment_user (comment_id, user_id),
          INDEX idx_comment_likes_cmt (comment_id),
          INDEX idx_comment_likes_usr (user_id)
        )
      `)
    } catch {}

    const [rows] = await db.query(
      `SELECT c.id, c.content, c.image_url, c.created_at, c.user_id as author_id,
              u.display_name AS author_name,
              u.username AS author_username,
              u.avatar_url AS author_avatar_url,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count,
              (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) as is_user_liked,
              (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id) as repost_count,
              (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id AND user_id = ?) as is_user_reposted,
              (SELECT COUNT(*) FROM comment_bookmarks WHERE comment_id = c.id AND user_id = ?) as is_user_bookmarked
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ? AND c.is_deleted = 0 AND (u.is_banned = 0 OR u.is_banned IS NULL)
       ORDER BY c.created_at ASC`,
      [userId, userId, userId, postId]
    )

    const dbComments = rows as any[]
    if (dbComments && dbComments.length > 0) {
      const formatted = dbComments.map((c) => ({
        id: c.id,
        author_id: c.author_id,
        author_name: c.author_name,
        author_username: c.author_username,
        authorInitials: c.author_name ? c.author_name.slice(0, 2) : 'ผใช้',
        author_avatar_url: c.author_avatar_url,
        avatarBg: '#7b6cf6',
        content: c.content,
        image_url: c.image_url,
        created_at: c.created_at,
        time_ago: timeAgo(c.created_at),
        like_count: Number(c.like_count || 0),
        isLiked: Number(c.is_user_liked || 0) > 0,
        repost_count: Number(c.repost_count || 0),
        isReposted: Number(c.is_user_reposted || 0) > 0,
        isBookmarked: Number(c.is_user_bookmarked || 0) > 0,
      }))
      return { comments: formatted, count: formatted.length }
    }
  } catch (e) {
    console.error('Error fetching comments:', e)
  }

  return { comments: [], count: 0 }
})
