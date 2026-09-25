export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const username = query.username as string
  const type = query.type as 'followers' | 'following'
  
  if (!username) {
    throw createError({ statusCode: 400, message: 'Username is required' })
  }
  
  const db = getDb()
  const currentUser = await getRequestUser(event)
  
  // First, get the target user ID
  const [userRows] = await db.query<any[]>('SELECT id FROM users WHERE username = ? LIMIT 1', [username])
  if (!userRows.length) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  const targetUserId = userRows[0].id
  
  let sql = ''
  let params: any[] = []
  
  // Current user's follow status subquery
  const isFollowingSubquery = currentUser
    ? `(SELECT COUNT(*) FROM user_followers uf2 WHERE uf2.follower_id = ${currentUser.userId} AND uf2.following_id = u.id LIMIT 1)`
    : '0'
  
  if (type === 'followers') {
    // Get people who follow the target user
    sql = `
      SELECT u.id, u.username, u.display_name, u.avatar_url,
             ${isFollowingSubquery} AS is_following
      FROM user_followers uf
      JOIN users u ON uf.follower_id = u.id
      WHERE uf.following_id = ?
      ORDER BY uf.created_at DESC
    `
    params = [targetUserId]
  } else if (type === 'following') {
    // Get people whom the target user follows
    sql = `
      SELECT u.id, u.username, u.display_name, u.avatar_url,
             ${isFollowingSubquery} AS is_following
      FROM user_followers uf
      JOIN users u ON uf.following_id = u.id
      WHERE uf.follower_id = ?
      ORDER BY uf.created_at DESC
    `
    params = [targetUserId]
  } else {
    throw createError({ statusCode: 400, message: 'Invalid type' })
  }
  
  const [rows] = await db.query<any[]>(sql, params)
  
  return {
    users: rows.map(r => ({
      ...r,
      is_following: !!r.is_following
    }))
  }
})
