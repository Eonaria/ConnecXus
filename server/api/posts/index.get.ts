/**
 * GET /api/posts
 * Fetch posts for the main feed with real comment counts and like counts
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const userId = user?.userId || 0

  try {
    const db = getDb()

    // Ensure bookmarks table exists
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

    const query = getQuery(event)
    const tab = query.tab ? String(query.tab) : 'foryou'
    const isAdmin = user?.role === 'admin' ? 1 : 0

    let followingCondition = ''
    if (tab === 'following' && userId > 0) {
      followingCondition = ` AND (
        p.user_id = ?
        OR p.user_id IN (SELECT following_id FROM user_followers WHERE follower_id = ?)
        OR (p.community_id IS NOT NULL AND p.community_id IN (SELECT community_id FROM community_members WHERE user_id = ? AND status = 'active'))
      )`
    }

    const [rows] = await db.query(
      `SELECT 
        p.id as feed_row_id,
        p.is_repost,
        CASE WHEN p.is_repost = 1 THEN u.display_name ELSE NULL END as reposted_by_name,
        COALESCE(orig.id, p.id) as id,
        COALESCE(orig.content, p.content) as content,
        COALESCE(orig.image_url, p.image_url) as image_url,
        COALESCE(orig.created_at, p.created_at) as created_at,
        COALESCE(orig.user_id, p.user_id) as author_id,
        COALESCE(orig.community_id, p.community_id) as community_id,
        COALESCE(orig.is_community_only, p.is_community_only) as is_community_only,
        COALESCE(orig.visibility, p.visibility) as visibility,
        COALESCE(orig_c.name, c.name) as community_name,
        COALESCE(orig_c.slug, c.slug) as community_slug,
        COALESCE(orig_u.display_name, u.display_name) as author_display_name,
        COALESCE(orig_u.username, u.username) as author_username,
        COALESCE(orig_u.avatar_url, u.avatar_url) as author_avatar_url,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = COALESCE(orig.id, p.id)) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = COALESCE(orig.id, p.id) AND is_deleted = 0) as comment_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = COALESCE(orig.id, p.id) AND user_id = ?) as is_user_liked,
        (SELECT COUNT(*) FROM post_bookmarks WHERE post_id = COALESCE(orig.id, p.id) AND user_id = ?) as is_bookmarked,
        (SELECT COUNT(*) FROM posts WHERE repost_of_id = COALESCE(orig.id, p.id) AND is_deleted = 0) as repost_count,
        (SELECT COUNT(*) FROM posts WHERE repost_of_id = COALESCE(orig.id, p.id) AND user_id = ? AND is_deleted = 0) as is_reposted
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN communities c ON p.community_id = c.id
       LEFT JOIN posts orig ON orig.id = p.repost_of_id AND orig.is_deleted = 0
       LEFT JOIN users orig_u ON orig_u.id = orig.user_id
       LEFT JOIN communities orig_c ON orig.community_id = orig_c.id
        WHERE p.is_deleted = 0
          AND (p.is_repost = 0 OR orig.id IS NOT NULL)
          AND (u.is_banned = 0 OR u.is_banned IS NULL)
          AND (orig_u.is_banned = 0 OR orig_u.is_banned IS NULL OR orig_u.id IS NULL)
          AND COALESCE(orig.is_community_only, p.is_community_only) = 0
          AND (
            -- 1. General posts without a community
            COALESCE(orig.community_id, p.community_id) IS NULL
            OR
            -- 2. Community posts that are allowed on Home feed
            (
              (COALESCE(orig_c.is_community_only_feed, c.is_community_only_feed) = 0 OR COALESCE(orig_c.is_community_only_feed, c.is_community_only_feed) IS NULL)
              OR
              (
                (COALESCE(orig_c.is_community_only_feed, c.is_community_only_feed) = 1 AND (COALESCE(orig_c.members_only_feed, c.members_only_feed) = 1 OR COALESCE(orig_c.members_only_feed, c.members_only_feed) IS NULL))
                AND (? > 0 AND (
                  COALESCE(orig_c.owner_id, c.owner_id) = ?
                  OR ? = 1
                  OR EXISTS (
                    SELECT 1 FROM community_members cm
                    WHERE cm.community_id = COALESCE(orig.community_id, p.community_id)
                      AND cm.user_id = ?
                      AND cm.status = 'active'
                  )
                ))
              )
            )
          )
          -- 3. Post Audience Visibility Filter
          AND (
            COALESCE(orig.visibility, p.visibility) = 'public' OR COALESCE(orig.visibility, p.visibility) IS NULL
            OR COALESCE(orig.user_id, p.user_id) = ?
            OR (
              COALESCE(orig.visibility, p.visibility) = 'followers'
              AND ? > 0
              AND EXISTS (
                SELECT 1 FROM user_followers uf
                WHERE uf.follower_id = ? AND uf.following_id = COALESCE(orig.user_id, p.user_id)
              )
            )
            OR (
              COALESCE(orig.visibility, p.visibility) = 'mutual'
              AND ? > 0
              AND EXISTS (
                SELECT 1 FROM user_followers uf1
                WHERE uf1.follower_id = ? AND uf1.following_id = COALESCE(orig.user_id, p.user_id)
              )
              AND EXISTS (
                SELECT 1 FROM user_followers uf2
                WHERE uf2.follower_id = COALESCE(orig.user_id, p.user_id) AND uf2.following_id = ?
              )
            )
          )
          ${followingCondition}
        ORDER BY p.created_at DESC
        LIMIT 50`,
      tab === 'following' && userId > 0
        ? [
            userId, userId, userId, 
            userId, userId, isAdmin, userId, 
            userId, userId, userId, userId, userId, userId, 
            userId, userId, userId
          ]
        : [
            userId, userId, userId, 
            userId, userId, isAdmin, userId, 
            userId, userId, userId, userId, userId, userId
          ]
    )

    const dbPosts = rows as any[]
    if (dbPosts) {
      const seen = new Set<number>()
      const formatted = []
      for (const p of dbPosts) {
        const targetId = Number(p.id)
        if (seen.has(targetId)) continue
        seen.add(targetId)

        const initials = p.author_display_name ? p.author_display_name.slice(0, 2) : 'ผใช้'
        formatted.push({
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
          community_slug: p.community_slug,
          community_id: p.community_id,
          is_community_only: Boolean(p.is_community_only),
          visibility: p.visibility || 'public',
          content: p.content,
          image_url: p.image_url,
          reposted_by_name: p.reposted_by_name || null,
          like_count: Number(p.like_count || 0),
          comment_count: Number(p.comment_count || 0),
          isLiked: p.is_user_liked > 0,
          isBookmarked: Number(p.is_bookmarked || 0) > 0,
          repost_count: Number(p.repost_count || 0),
          isReposted: Number(p.is_reposted || 0) > 0,
        })
      }
      return { posts: formatted }
    }
  } catch (e) {
    console.error('Error fetching posts:', e)
  }

  return { posts: [] }
})
