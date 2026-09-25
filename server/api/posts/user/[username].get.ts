/**
 * GET /api/users/[username]/posts
 * Fetch posts by username (authored posts or liked posts)
 */
function formatTimeAgo(dateInput: string | Date | null): string {
  if (!dateInput) return 'เมื่อสักครู่'
  const date = new Date(dateInput)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (isNaN(diffInSeconds) || diffInSeconds < 60) return 'เมื่อสักครู่'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`
  return date.toLocaleDateString('th-TH')
}

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  const query = getQuery(event)
  const type = (query.type as string) || 'posts'

  if (!username) {
    return { posts: [] }
  }

  const currentUser = await getRequestUser(event)
  const currentUserId = currentUser?.userId || 0

  const db = getDb()

  // Find target user ID by username
  const [userRows] = await db.query(
    `SELECT id FROM users WHERE username = ? AND is_banned = 0 LIMIT 1`,
    [username]
  )
  const targetUser = (userRows as any[])[0]

  if (!targetUser) {
    return { posts: [] }
  }

  let sql = ''
  let params: any[] = []

  const isAdmin = currentUser?.role === 'admin' ? 1 : 0

  const visibilitySql = `
    AND (
      p.visibility = 'public' OR p.visibility IS NULL
      OR p.user_id = ?
      OR (
        p.visibility = 'followers'
        AND ? > 0
        AND EXISTS (
          SELECT 1 FROM user_followers uf
          WHERE uf.follower_id = ? AND uf.following_id = p.user_id
        )
      )
      OR (
        p.visibility = 'mutual'
        AND ? > 0
        AND EXISTS (
          SELECT 1 FROM user_followers uf1
          WHERE uf1.follower_id = ? AND uf1.following_id = p.user_id
        )
        AND EXISTS (
          SELECT 1 FROM user_followers uf2
          WHERE uf2.follower_id = p.user_id AND uf2.following_id = ?
        )
      )
    )
  `

  if (type === 'reposts') {
    // Posts and comments reposted by target user
    sql = `SELECT 
             COALESCE(orig.id, p.id) AS id,
             COALESCE(orig.content, p.content) AS content,
             COALESCE(orig.image_url, p.image_url) AS image_url,
             p.created_at AS created_at,
             COALESCE(orig.user_id, p.user_id) AS author_id,
             COALESCE(orig.visibility, p.visibility, 'public') AS visibility,
             ru.display_name AS reposted_by_name,
             COALESCE(ou.display_name, ru.display_name) AS author_display_name,
             COALESCE(ou.username, ru.username) AS author_username,
             COALESCE(ou.avatar_url, ru.avatar_url) AS author_avatar_url,
             c.name AS community_name,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = COALESCE(orig.id, p.id)) AS like_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = COALESCE(orig.id, p.id) AND is_deleted = 0) AS comment_count,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = COALESCE(orig.id, p.id) AND user_id = ?) AS is_user_liked,
             (SELECT COUNT(*) FROM post_bookmarks WHERE post_id = COALESCE(orig.id, p.id) AND user_id = ?) AS is_bookmarked,
             (SELECT COUNT(*) FROM posts WHERE repost_of_id = COALESCE(orig.id, p.id) AND is_deleted = 0) AS repost_count,
             (SELECT COUNT(*) FROM posts WHERE repost_of_id = COALESCE(orig.id, p.id) AND user_id = ? AND is_deleted = 0) AS is_reposted,
             0 AS is_comment,
             NULL AS parent_post_id
           FROM posts p
           JOIN users ru ON ru.id = p.user_id
           LEFT JOIN posts orig ON orig.id = p.repost_of_id AND orig.is_deleted = 0
           LEFT JOIN users ou ON ou.id = orig.user_id
           LEFT JOIN communities c ON c.id = COALESCE(orig.community_id, p.community_id)
           WHERE p.user_id = ? AND p.is_repost = 1 AND p.is_deleted = 0
           ${visibilitySql}

           UNION ALL

           SELECT c.id AS id,
                  c.content AS content,
                  c.image_url AS image_url,
                  cr.created_at AS created_at,
                  c.user_id AS author_id,
                  'public' AS visibility,
                  ru.display_name AS reposted_by_name,
                  u.display_name AS author_display_name,
                  u.username AS author_username,
                  u.avatar_url AS author_avatar_url,
                  NULL AS community_name,
                  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS like_count,
                  0 AS comment_count,
                  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) AS is_user_liked,
                  (SELECT COUNT(*) FROM comment_bookmarks WHERE comment_id = c.id AND user_id = ?) AS is_bookmarked,
                  (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id) AS repost_count,
                  (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id AND user_id = ?) AS is_reposted,
                  1 AS is_comment,
                  c.post_id AS parent_post_id
           FROM comment_reposts cr
           JOIN comments c ON c.id = cr.comment_id AND c.is_deleted = 0
           JOIN users ru ON ru.id = cr.user_id
           JOIN users u ON u.id = c.user_id
           WHERE cr.user_id = ?

           ORDER BY created_at DESC`
    params = [
      currentUserId, currentUserId, currentUserId, targetUser.id,
      currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId,
      currentUserId, currentUserId, currentUserId, targetUser.id
    ]
  } else if (type === 'liked') {
    // Posts and comments liked by target user
    sql = `SELECT p.id, p.content, p.image_url, p.created_at, p.user_id as author_id, p.visibility,
                  NULL as reposted_by_name,
                  u.display_name AS author_display_name,
                  u.username AS author_username,
                  u.avatar_url AS author_avatar_url,
                  c.name AS community_name,
                  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
                  (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count,
                  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_user_liked,
                  (SELECT COUNT(*) FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked,
                  (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND is_deleted = 0) AS repost_count,
                  (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND user_id = ? AND is_deleted = 0) AS is_reposted,
                  0 AS is_comment,
                  NULL AS parent_post_id
           FROM post_likes pl
           JOIN posts p ON p.id = pl.post_id
           JOIN users u ON u.id = p.user_id
           LEFT JOIN communities c ON c.id = p.community_id
           WHERE pl.user_id = ? AND p.is_deleted = 0
           ${visibilitySql}

           UNION ALL

           SELECT c.id, c.content, c.image_url, c.created_at, c.user_id as author_id, 'public' as visibility,
                  NULL as reposted_by_name,
                  u.display_name AS author_display_name,
                  u.username AS author_username,
                  u.avatar_url AS author_avatar_url,
                  NULL AS community_name,
                  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS like_count,
                  0 AS comment_count,
                  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) AS is_user_liked,
                  (SELECT COUNT(*) FROM comment_bookmarks WHERE comment_id = c.id AND user_id = ?) AS is_bookmarked,
                  (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id) AS repost_count,
                  (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id AND user_id = ?) AS is_reposted,
                  1 AS is_comment,
                  c.post_id AS parent_post_id
           FROM comment_likes cl
           JOIN comments c ON c.id = cl.comment_id AND c.is_deleted = 0
           JOIN users u ON u.id = c.user_id
           WHERE cl.user_id = ?

           ORDER BY created_at DESC`
    params = [
      currentUserId, currentUserId, currentUserId, targetUser.id,
      currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId,
      currentUserId, currentUserId, currentUserId, targetUser.id
    ]
  } else if (type === 'replies') {
    // Comments/replies written by target user
    sql = `SELECT c.id, c.content, c.image_url, c.created_at, c.user_id as author_id, 'public' as visibility,
                  NULL as reposted_by_name,
                  u.display_name AS author_display_name,
                  u.username AS author_username,
                  u.avatar_url AS author_avatar_url,
                  NULL AS community_name,
                  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) AS like_count,
                  0 AS comment_count,
                  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = ?) AS is_user_liked,
                  (SELECT COUNT(*) FROM comment_bookmarks WHERE comment_id = c.id AND user_id = ?) AS is_bookmarked,
                  (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id) AS repost_count,
                  (SELECT COUNT(*) FROM comment_reposts WHERE comment_id = c.id AND user_id = ?) AS is_reposted,
                  1 AS is_comment,
                  c.post_id AS parent_post_id
           FROM comments c
           JOIN users u ON u.id = c.user_id
           WHERE c.user_id = ? AND c.is_deleted = 0
           ORDER BY c.created_at DESC`
    params = [
      currentUserId, currentUserId, currentUserId, targetUser.id
    ]
  } else {
    // Posts created by target user
    sql = `SELECT p.id, p.content, p.image_url, p.created_at, p.user_id as author_id, p.visibility,
                  NULL as reposted_by_name,
                  u.display_name AS author_display_name,
                  u.username AS author_username,
                  u.avatar_url AS author_avatar_url,
                  c.name AS community_name,
                  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
                  (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count,
                  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_user_liked,
                  (SELECT COUNT(*) FROM post_bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked,
                  (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND is_deleted = 0) AS repost_count,
                  (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND user_id = ? AND is_deleted = 0) AS is_reposted,
                  0 AS is_comment,
                  NULL AS parent_post_id
           FROM posts p
           JOIN users u ON u.id = p.user_id
           LEFT JOIN communities c ON c.id = p.community_id
           WHERE p.user_id = ? AND p.is_deleted = 0
           ${visibilitySql}
           ORDER BY p.created_at DESC`
    params = [
      currentUserId, currentUserId, currentUserId, targetUser.id,
      currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId
    ]
  }

  const [rows] = await db.query(sql, params)
  const dbPosts = rows as any[]

  const formattedPosts = dbPosts.map((p) => {
    const initials = p.author_display_name ? p.author_display_name.slice(0, 2) : 'ผ'
    return {
      id: p.id,
      author_id: p.author_id,
      author_display_name: p.author_display_name,
      author_username: p.author_username,
      authorInitials: initials,
      author_avatar_url: p.author_avatar_url,
      avatarBg: '#5b46e0',
      time_ago: formatTimeAgo(p.created_at),
      community_name: p.community_name || null,
      visibility: p.visibility || 'public',
      content: p.content,
      image_url: p.image_url || null,
      like_count: Number(p.like_count || 0),
      comment_count: Number(p.comment_count || 0),
      isLiked: Number(p.is_user_liked || 0) > 0,
      isBookmarked: Number(p.is_bookmarked || 0) > 0,
      repost_count: Number(p.repost_count || 0),
      isReposted: Number(p.is_reposted || 0) > 0,
      reposted_by_name: p.reposted_by_name || null,
      is_comment: Boolean(p.is_comment),
      parent_post_id: p.parent_post_id ? Number(p.parent_post_id) : null,
    }
  })

  return { posts: formattedPosts }
})
