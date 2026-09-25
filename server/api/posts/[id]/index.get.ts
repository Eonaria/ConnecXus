/**
 * GET /api/posts/[id]
 * Fetch a single post by ID
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const userId = user?.userId || 0
  const postId = getRouterParam(event, 'id')

  if (!postId) {
    throw createError({ statusCode: 400, message: 'Post ID is required' })
  }

  const db = getDb()

  const [rows] = await db.query(
    `SELECT p.id, p.content, p.image_url, p.created_at, p.user_id as author_id, p.visibility,
            u.display_name AS author_display_name,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url,
            u.is_banned AS author_is_banned,
            c.name AS community_name,
            c.slug AS community_slug,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_user_liked,
            (SELECT COUNT(*) FROM post_bookmarks WHERE post_id = p.id AND user_id = ? LIMIT 1) AS is_bookmarked,
            (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND is_deleted = 0) AS repost_count,
            (SELECT COUNT(*) FROM posts WHERE repost_of_id = p.id AND user_id = ? AND is_deleted = 0) AS is_reposted
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN communities c ON c.id = p.community_id
     WHERE p.id = ? AND p.is_deleted = 0
     LIMIT 1`,
    [userId, userId, userId, postId]
  )

  const dbPosts = rows as any[]
  if (dbPosts && dbPosts.length > 0) {
    const p = dbPosts[0]
    
    // Check Visibility Permissions
    const visibility = p.visibility || 'public'
    const authorId = p.author_id
    const isOwner = userId > 0 && userId === authorId
    const isAdmin = user?.role === 'admin'
    const isAuthorBanned = Boolean(p.author_is_banned)

    if (isAuthorBanned && !isAdmin) {
      throw createError({ statusCode: 404, message: 'โพสต์นี้ไม่สามารถเข้าถึงได้เนื่องจากบัญชีผู้ใช้ถูกระงับ' })
    }

    if (!isOwner && !isAdmin) {
      if (visibility === 'private') {
        throw createError({ statusCode: 403, message: 'โพสต์นี้ถูกตั้งค่าเป็นส่วนตัว' })
      }
      if (visibility === 'followers') {
        if (!userId) {
          throw createError({ statusCode: 403, message: 'โพสต์นี้แสดงเฉพาะผู้ติดตามของผู้เขียนเท่านั้น' })
        }
        const [fRows] = await db.query(
          'SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = ? LIMIT 1',
          [userId, authorId]
        )
        if ((fRows as any[]).length === 0) {
          throw createError({ statusCode: 403, message: 'โพสต์นี้แสดงเฉพาะผู้ติดตามของผู้เขียนเท่านั้น' })
        }
      }
      if (visibility === 'mutual') {
        if (!userId) {
          throw createError({ statusCode: 403, message: 'โพสต์นี้แสดงเฉพาะเพื่อนที่ติดตามซึ่งกันและกันเท่านั้น' })
        }
        const [mRows] = await db.query(
          `SELECT 1 FROM user_followers uf1
           JOIN user_followers uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
           WHERE uf1.follower_id = ? AND uf1.following_id = ? LIMIT 1`,
          [userId, authorId]
        )
        if ((mRows as any[]).length === 0) {
          throw createError({ statusCode: 403, message: 'โพสต์นี้แสดงเฉพาะเพื่อนที่ติดตามซึ่งกันและกันเท่านั้น' })
        }
      }
    }

    // helper function inside API since timeAgo is not imported easily
    const now = new Date()
    const diff = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / 1000)
    let time_ago = 'เมื่อกี้'
    if (diff > 31536000) time_ago = `${Math.floor(diff / 31536000)} ปีที่แล้ว`
    else if (diff > 2592000) time_ago = `${Math.floor(diff / 2592000)} เดือนที่แล้ว`
    else if (diff > 86400) time_ago = `${Math.floor(diff / 86400)} วันที่แล้ว`
    else if (diff > 3600) time_ago = `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
    else if (diff > 60) time_ago = `${Math.floor(diff / 60)} นาทีที่แล้ว`

    const initials = p.author_display_name ? p.author_display_name.slice(0, 2) : 'ผใช้'
    
    const formatted = {
      id: p.id,
      author_id: p.author_id,
      author_display_name: p.author_display_name,
      author_username: p.author_username,
      authorInitials: initials,
      author_avatar_url: p.author_avatar_url,
      avatarBg: '#7b6cf6',
      created_at: p.created_at,
      time_ago: time_ago,
      community_name: p.community_name,
      community_slug: p.community_slug,
      visibility: visibility,
      content: p.content,
      image_url: p.image_url,
      like_count: Number(p.like_count || 0),
      comment_count: Number(p.comment_count || 0),
      isLiked: p.is_user_liked > 0,
      isBookmarked: Number(p.is_bookmarked || 0) > 0,
      repost_count: Number(p.repost_count || 0),
      isReposted: Number(p.is_reposted || 0) > 0,
    }
    return { post: formatted }
  }

  throw createError({ statusCode: 404, message: 'Post not found' })
})
