/**
 * GET /api/users/suggested
 * Returns a list of suggested users to follow
 */
export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event)
  const currentUserId = currentUser?.userId || 0

  try {
    const db = getDb()
    const [rows] = await db.query(
      `SELECT id, username, display_name, avatar_url
       FROM users
       WHERE is_banned = 0 AND id != ?
       AND id NOT IN (SELECT following_id FROM user_followers WHERE follower_id = ?)
       ORDER BY RAND()
       LIMIT 5`,
      [currentUserId, currentUserId]
    )

    const users = (rows as any[]).map((u) => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name || u.username,
      initials: u.display_name ? u.display_name.slice(0, 2) : u.username.slice(0, 2),
      avatar_url: u.avatar_url || null,
      color: '#7b6cf6',
      is_following: false
    }))

    return { users }
  } catch {
    return { users: [] }
  }
})
