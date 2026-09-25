// GET /api/users/mutual-followers - Get mutual followers for group invite
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = getDb()
  const query = getQuery(event)
  const exclude = query.exclude ? String(query.exclude).split(',').map(Number) : []

  const [rows] = await db.query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url
     FROM user_followers f1
     JOIN user_followers f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
     JOIN users u ON u.id = f1.following_id
     WHERE f1.follower_id = ?
     ORDER BY u.display_name
     LIMIT 100`,
    [user.userId]
  ) as any[]

  const users = (rows as any[]).filter((u: any) => !exclude.includes(u.id))
  return { users }
})