/**
 * GET /api/bookmarks
 * Get all posts and comments bookmarked by the current user.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb()

  // Ensure tables exist
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
    await db.query(`
      CREATE TABLE IF NOT EXISTS comment_bookmarks (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        comment_id INT UNSIGNED NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_comment (user_id, comment_id)
      )
    `)
  } catch {}

  const [rows] = await db.query(
    `SELECT p.id, p.content, p.image_url, p.created_at, pb.created_at AS bookmarked_at,
            u.display_name AS author_display_name,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url,
            c.name AS community_name,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count,
            (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND is_deleted = 0) AS repost_count,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_user_liked,
            (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND user_id = ? AND is_deleted = 0) AS is_reposted,
            1 AS is_bookmarked,
            0 AS is_comment,
            NULL AS parent_post_id
     FROM post_bookmarks pb
     JOIN posts p ON p.id = pb.post_id AND p.is_deleted = 0
     JOIN users u ON u.id = p.user_id
     LEFT JOIN communities c ON c.id = p.community_id
     WHERE pb.user_id = ?

     UNION ALL

     SELECT c.id, c.content, c.image_url, c.created_at, cb.created_at AS bookmarked_at,
            u.display_name AS author_display_name,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url,
            NULL AS community_name,
            (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS like_count,
            0 AS comment_count,
            (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id) AS repost_count,
            (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) AS is_user_liked,
            (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id AND user_id = ?) AS is_reposted,
            1 AS is_bookmarked,
            1 AS is_comment,
            c.post_id AS parent_post_id
     FROM comment_bookmarks cb
     JOIN comments c ON c.id = cb.comment_id AND c.is_deleted = 0
     JOIN users u ON u.id = c.user_id
     WHERE cb.user_id = ?

     ORDER BY bookmarked_at DESC
     LIMIT 100`,
    [user.userId, user.userId, user.userId, user.userId, user.userId, user.userId]
  )

  const posts = (rows as any[]).map((p) => ({
    id: p.id,
    author_display_name: p.author_display_name,
    author_username: p.author_username,
    authorInitials: p.author_display_name ? p.author_display_name.slice(0, 2) : 'ผ',
    author_avatar_url: p.author_avatar_url,
    avatarBg: '#7b6cf6',
    time_ago: 'ไม่กี่นาทีที่แล้ว',
    community_name: p.community_name,
    content: p.content,
    image_url: p.image_url,
    like_count: Number(p.like_count || 0),
    comment_count: Number(p.comment_count || 0),
    repost_count: Number(p.repost_count || 0),
    isLiked: p.is_user_liked > 0,
    isReposted: p.is_reposted > 0,
    isBookmarked: true,
    is_comment: Boolean(p.is_comment),
    parent_post_id: p.parent_post_id ? Number(p.parent_post_id) : null,
  }))

  return { posts }
})
