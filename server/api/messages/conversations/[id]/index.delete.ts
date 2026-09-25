import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  
  const db = getDb()
  
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )
  if (rows.length === 0) throw createError({ statusCode: 403, message: 'Forbidden' })
  
  // Soft delete by setting deleted_at
  await db.query(
    'UPDATE conversation_participants SET deleted_at = NOW() WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )
  
  return { success: true }
})