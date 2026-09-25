/**
 * GET /api/communities/:slug/messages
 * Get group chat message history for a community
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  try {
    const db = getDb()
    const [cRows] = await db.query('SELECT id FROM communities WHERE slug = ? LIMIT 1', [slug])
    const community = (cRows as any[])[0]

    if (community) {
      // Find conversation for this community (or group messages)
      const [mRows] = await db.query(
        `SELECT m.id, m.content, m.created_at, u.display_name AS sender_name, u.username AS sender_username
         FROM posts m
         JOIN users u ON u.id = m.user_id
         WHERE m.community_id = ? AND m.is_deleted = 0
         ORDER BY m.created_at ASC
         LIMIT 100`,
        [community.id]
      )

      const dbMsgs = mRows as any[]
      if (dbMsgs) {
        const formatted = dbMsgs.map((m) => ({
          id: m.id,
          sender_name: m.sender_name,
          sender_username: m.sender_username,
          sender_avatar: m.sender_name ? m.sender_name.slice(0, 2) : 'ผใช้',
          avatarBg: '#5b46e0',
          content: m.content,
          created_at: new Date(m.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        }))
        return { messages: formatted }
      }
    }
  } catch (e) {
    console.error('Error fetching community messages:', e)
  }

  return { messages: [] }
})
