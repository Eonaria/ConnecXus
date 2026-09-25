/**
 * GET /api/posts/search?q=...
 * Fetch posts matching a search query
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const userId = user?.userId || 0
  const query = getQuery(event)
  const q = query.q ? String(query.q) : ''

  if (!q.trim()) {
    return { posts: [] }
  }

  try {
    const db = getDb()

    const isAdmin = user?.role === 'admin' ? 1 : 0

    const [rows] = await db.query(
      `SELECT 
        p.id, p.content, p.image_url, p.created_at, p.user_id as author_id, p.community_id, p.is_community_only,
        c.name as community_name, c.slug as community_slug,
        u.display_name as author_display_name,
        u.username as author_username,
        u.avatar_url as author_avatar_url,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) as comment_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_user_liked,
        (SELECT COUNT(*) FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
       FROM posts p
       LEFT JOIN communities c ON p.community_id = c.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.is_deleted = 0 
         AND (u.is_banned = 0 OR u.is_banned IS NULL)
         AND p.content LIKE ?
         AND p.is_community_only = 0
         AND (
           p.community_id IS NULL
           OR
           (
             (c.is_community_only_feed = 0 OR c.is_community_only_feed IS NULL)
             AND
             (
               (c.is_private = 0 AND (c.members_only_feed = 0 OR c.members_only_feed IS NULL))
               OR
               (? > 0 AND (
                 c.owner_id = ?
                 OR ? = 1
                 OR EXISTS (
                   SELECT 1 FROM community_members cm
                   WHERE cm.community_id = c.id
                     AND cm.user_id = ?
                     AND cm.status = 'active'
                 )
               ))
             )
           )
         )
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [userId, userId, `%${q}%`, userId, userId, isAdmin, userId]
    )

    const dbPosts = rows as any[]
    const formatted = dbPosts.map((p) => {
      const initials = p.author_display_name ? p.author_display_name.slice(0, 2) : 'ผใช้'
      return {
        id: p.id,
        author_id: p.author_id,
        author_display_name: p.author_display_name,
        author_username: p.author_username,
        authorInitials: initials,
        author_avatar_url: p.author_avatar_url,
        avatarBg: '#7b6cf6',
        created_at: p.created_at,
        time_ago: timeAgo(p.created_at),
        community_name: p.community_name,
        content: p.content,
        image_url: p.image_url,
        like_count: Number(p.like_count || 0),
        comment_count: Number(p.comment_count || 0),
        isLiked: p.is_user_liked > 0,
        isBookmarked: Number(p.is_bookmarked || 0) > 0,
      }
    })

    return { posts: formatted }
  } catch (e) {
    console.error('Error searching posts:', e)
    return { posts: [] }
  }
})
