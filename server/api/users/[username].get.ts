/**
 * GET /api/users/[username]
 * Fetch a user's profile by username — with real follower/following counts and is_following status
 */
export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'กรุณาระบุ username',
    })
  }

  const db = getDb()

  // Ensure columns exist
  try { await db.query('ALTER TABLE users ADD COLUMN banner_url VARCHAR(500) DEFAULT NULL') } catch {}

  // Ensure followers table exists
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_followers (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        follower_id INT UNSIGNED NOT NULL,
        following_id INT UNSIGNED NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_follow (follower_id, following_id)
      )
    `)
  } catch {}

  const currentUser = await getRequestUser(event)
  const currentUserId = currentUser?.userId || 0

  const [userRows] = await db.query(
    `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.bio, u.role, u.banner_url, u.created_at, u.is_banned,
            (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_deleted = 0) AS post_count,
            (SELECT COUNT(*) FROM user_followers WHERE following_id = u.id) AS follower_count,
            (SELECT COUNT(*) FROM user_followers WHERE follower_id = u.id) AS following_count,
            (SELECT COUNT(*) FROM user_followers WHERE follower_id = ? AND following_id = u.id LIMIT 1) AS is_following
     FROM users u
     WHERE u.username = ?
     LIMIT 1`,
    [currentUserId, username]
  )

  const user = (userRows as any[])[0]

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'ไม่พบผู้ใช้นี้',
    })
  }

  const isOwnProfile = currentUser
    ? (currentUser.username === user.username || Number(currentUser.userId) === Number(user.id))
    : false

  const isBanned = Boolean(user.is_banned)

  const userData = {
    id: user.id,
    username: user.username,
    email: isBanned ? '' : user.email,
    display_name: user.display_name,
    avatar_url: isBanned ? null : user.avatar_url,
    bio: isBanned ? null : user.bio,
    role: user.role,
    banner_url: isBanned ? null : user.banner_url,
    created_at: user.created_at,
    is_banned: isBanned,
    post_count: isBanned ? 0 : Number(user.post_count || 0),
    follower_count: isBanned ? 0 : Number(user.follower_count || 0),
    following_count: isBanned ? 0 : Number(user.following_count || 0),
    is_following: isBanned ? false : Number(user.is_following || 0) > 0,
    is_own_profile: isOwnProfile,
  }

  return {
    ...userData,
    user: userData,
  }
})
