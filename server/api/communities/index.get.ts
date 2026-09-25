/**
 * GET /api/communities
 * List all communities with member counts and user join status from MySQL
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const userId = user?.userId || 0

  await ensureCommunitiesSeeded()

  try {
    const db = getDb()
    const [rows] = await db.query(
      `SELECT c.id, c.name, c.slug, c.description, c.avatar_url, c.banner_url, c.banner_position_y, c.bg_color, c.is_private, c.is_hidden, c.created_at,
              (SELECT COUNT(*) FROM community_members WHERE community_id = c.id AND status = 'active') AS member_count,
              (SELECT COUNT(*) FROM posts WHERE community_id = c.id AND is_deleted = 0) AS post_count,
              cm.role AS user_role,
              cm.status AS user_status
       FROM communities c
       LEFT JOIN community_members cm ON cm.community_id = c.id AND cm.user_id = ?
       WHERE (c.is_hidden = 0 OR c.is_hidden IS NULL OR cm.status = 'active' OR (c.owner_id = ? AND ? > 0))
       ORDER BY c.id ASC`,
      [userId, userId, userId]
    )

    const dbCommunities = rows as any[]
    if (dbCommunities) {
      const formatted = dbCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon || '🚀',
        bg_color: c.bg_color || '#eef2ff',
        avatar_url: c.avatar_url || null,
        banner_url: c.banner_url || null,
        banner_position_y: c.banner_position_y ?? 50,
        banner_pos_y: c.banner_position_y ?? 50,
        is_private: c.is_private === 1,
        is_hidden: c.is_hidden === 1,
        member_count: c.member_count || 0,
        post_count: c.post_count || 0,
        is_joined: c.user_status === 'active',
        user_status: c.user_status || null,
        role: c.user_role || null,
      }))
      return { communities: formatted }
    }
  } catch (e) {
    // Database query error fallback
  }

  return { communities: [] }
})
