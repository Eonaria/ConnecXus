import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const is_muted = !!body.is_muted
  
  const db = getDb()
  
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )
  if (rows.length === 0) throw createError({ statusCode: 403, message: 'Forbidden' })
  
  await db.query(
    'UPDATE conversation_participants SET is_muted = ? WHERE conversation_id = ? AND user_id = ?',
    [is_muted ? 1 : 0, conversationId, user.userId]
  )
  
  return { success: true, is_muted }
})
