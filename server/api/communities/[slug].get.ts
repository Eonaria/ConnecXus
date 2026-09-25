/**
 * GET /api/communities/:slug
 * Fetch details of a single community and its posts
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const user = await getRequestUser(event)
  
  const db = getDb()

  // Fetch community details
  const [commRows] = await db.query(
    `SELECT c.*, u.username as owner_username, u.display_name as owner_name, u.avatar_url as owner_avatar_url 
     FROM communities c 
     LEFT JOIN users u ON c.owner_id = u.id 
     WHERE c.slug = ? LIMIT 1`,
    [slug]
  )
  const community: any = (commRows as any[])[0]
  
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  // Fetch moderators and owner list
  const [modRows] = await db.query(
    `SELECT cm.user_id, cm.role, u.username, u.display_name, u.avatar_url
     FROM community_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.community_id = ? AND cm.role IN ('owner', 'moderator') AND cm.status = 'active'
     ORDER BY CASE WHEN cm.role = 'owner' THEN 1 ELSE 2 END, cm.joined_at ASC`,
    [community.id]
  )
  community.moderators = (modRows as any[]).map(m => ({
    user_id: m.user_id,
    role: m.role,
    username: m.username,
    display_name: m.display_name,
    avatar_url: m.avatar_url
  }))

  // Parse rules
  if (community.rules) {
    try {
      community.rules = typeof community.rules === 'string' ? JSON.parse(community.rules) : community.rules
    } catch {
      community.rules = null
    }
  }

  if (community.is_suspended) {
    let stillSuspended = true
    if (community.suspended_until) {
      const now = new Date()
      const until = new Date(community.suspended_until)
      if (now >= until) {
        stillSuspended = false
        // Auto unsuspend
        await db.query(`UPDATE communities SET is_suspended = 0, suspended_until = NULL, suspend_reason = NULL WHERE id = ?`, [community.id])
        community.is_suspended = 0
        community.suspended_until = null
        community.suspend_reason = null
      }
    }

    if (stillSuspended) {
      if (!user || user.role !== 'admin') {
        throw createError({ 
          statusCode: 403, 
          message: 'Community Suspended', 
          data: { 
            suspended_until: community.suspended_until, 
            suspend_reason: community.suspend_reason 
          }
        })
      }
    }
  }

  // Count members
  const [memberCountRows] = await db.query(
    `SELECT COUNT(*) as count FROM community_members WHERE community_id = ? AND status = 'active'`,
    [community.id]
  )
  community.member_count = (memberCountRows as any[])[0].count

  // Check if current user is joined and their role
  community.is_joined = false
  community.user_role = 'none'
  
  if (user) {
    const [memberRows] = await db.query(
      `SELECT role, status FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1`,
      [community.id, user.userId]
    )
    const member: any = (memberRows as any[])[0]
    if (member && member.status === 'active') {
      community.is_joined = true
      community.user_role = member.role // 'member', 'moderator', 'owner'
      community.user_status = 'active'
    } else if (member && member.status === 'pending') {
      community.user_role = 'pending'
      community.user_status = 'pending'
    } else if (community.owner_id === user.userId) {
       community.is_joined = true
       community.user_role = 'owner'
       community.user_status = 'active'
    }
  }

  // Assign UI defaults
  community.icon = community.icon || '💻'
  community.bg_color = community.bg_color || '#eef2ff'
  community.is_community_only_feed = Boolean(community.is_community_only_feed)
  community.members_only_feed = community.members_only_feed === undefined || community.members_only_feed === null ? true : Boolean(community.members_only_feed)

  // Check private access
  let canViewPosts = true
  community.mutual_access = false

  if (community.is_private && !community.is_joined && user?.role !== 'admin' && user?.userId !== community.owner_id) {
    canViewPosts = false
    
    // Check mutual followers
    if (user && community.owner_id) {
       const [f1] = await db.query('SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ?', [user.userId, community.owner_id])
       const [f2] = await db.query('SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ?', [community.owner_id, user.userId])
       if ((f1 as any[]).length > 0 && (f2 as any[]).length > 0) {
           canViewPosts = true
           community.mutual_access = true
       }
    }
  }

  if (!canViewPosts) {
     community.posts = []
     return { community, requires_join: true }
  }

  // Fetch posts in this community
  const [postRows] = await db.query(
    `SELECT 
        p.id, p.content, p.image_url, p.created_at, p.user_id as author_id,
        u.display_name as author_display_name,
        u.username as author_username,
        u.avatar_url,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id AND user_id = ?) as user_liked
     FROM posts p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.community_id = ? AND p.is_deleted = 0
     ORDER BY p.created_at DESC`,
    [user ? user.userId : 0, community.id]
  )
  
  community.posts = (postRows as any[]).map(p => ({
    id: p.id,
    author_id: p.author_id,
    author_display_name: p.author_display_name,
    author_username: p.author_username,
    author_avatar_url: p.avatar_url,
    authorInitials: p.author_display_name ? p.author_display_name.trim().slice(0, 2) : 'Un',
    avatarBg: '#5b46e0',
    time_ago: new Date(p.created_at).toLocaleString('th-TH'),
    community_name: community.name,
    content: p.content,
    image_url: p.image_url,
    like_count: p.like_count,
    comment_count: p.comment_count,
    isLiked: p.user_liked > 0
  }))

  return { community }
})
