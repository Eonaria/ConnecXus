export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  const user = await getRequestUser(event)
  if (!user) {
    return { count: 0 }
  }

  const db = getDb()
  const [rows] = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [user.userId]
  )

  const count = (rows as any[])[0]?.count || 0
  return { count: Number(count) }
})
