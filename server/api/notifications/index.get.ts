export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  const db = getDb()

  const [rows] = await db.query(`
    SELECT n.id, n.type, n.is_read, n.created_at, n.post_id, n.community_slug, n.community_name,
           u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url,
           p.content AS post_content
    FROM notifications n
    LEFT JOIN users u ON n.sender_id = u.id
    LEFT JOIN posts p ON n.post_id = p.id
    WHERE n.user_id = ? AND (p.id IS NULL OR p.is_deleted = 0)
    ORDER BY n.created_at DESC
    LIMIT 50
  `, [user.userId])

  const notifications = (rows as any[]).map(row => ({
    id: row.id,
    type: row.type,
    is_read: Boolean(row.is_read),
    created_at: row.created_at,
    post_id: row.post_id,
    community_slug: row.community_slug ?? null,
    community_name: row.community_name ?? null,
    // Flat fields — used directly by the frontend template
    sender_username: row.sender_username ?? null,
    sender_display_name: row.sender_display_name ?? null,
    sender_avatar_url: row.sender_avatar_url ?? null,
    post_content: row.post_content
      ? (row.post_content.length > 50 ? row.post_content.substring(0, 50) + '...' : row.post_content)
      : null,
  }))

  return { notifications }
})
