import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  const db = getDb()

  // First, verify the user is a participant and get their deleted_at timestamp
  const [participants] = await db.query<RowDataPacket[]>(
    'SELECT deleted_at FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )

  if (participants.length === 0) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const deletedAt = participants[0]?.deleted_at

  let queryStr = `
    SELECT 
      m.id,
      m.conversation_id,
      m.sender_id,
      m.content,
      m.image_url,
      m.audio_url,
      m.is_pinned,
      m.is_edited,
      m.created_at,
      u.username AS sender_username,
      u.display_name AS sender_display_name,
      u.avatar_url AS sender_avatar_url
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
  `
  
  const queryParams: any[] = [conversationId]

  if (deletedAt) {
    queryStr += ` AND m.created_at > ?`
    queryParams.push(deletedAt)
  }

  queryStr += ` ORDER BY m.created_at ASC`

  const [rows] = await db.query<RowDataPacket[]>(queryStr, queryParams)

  return rows.map(row => ({
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    content: row.content,
    image_url: row.image_url,
    audio_url: row.audio_url,
    is_pinned: Boolean(row.is_pinned),
    is_edited: Boolean(row.is_edited),
    created_at: row.created_at,
    sender: {
      id: row.sender_id,
      username: row.sender_username,
      display_name: row.sender_display_name,
      avatar_url: row.sender_avatar_url
    }
  }))
})
