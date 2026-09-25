import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  
  const db = getDb()
  
  // verify participation
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )
  if (rows.length === 0) throw createError({ statusCode: 403, message: 'Forbidden' })
  
  // Set last_read_at to a past date to mark as unread
  await db.query(
    'UPDATE conversation_participants SET last_read_at = "1970-01-01 00:00:00" WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )
  
  return { success: true }
})