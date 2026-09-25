import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'Conversation ID required' })
  }

  const db = getDb()

  await db.query(
    'UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )

  try {
    broadcastToUser(user.userId, { type: 'chat_read', payload: { conversation_id: conversationId, user_id: user.userId } })
    broadcastToConversation(conversationId, { type: 'read', payload: { conversation_id: conversationId, user_id: user.userId, last_read_at: new Date().toISOString() } })
  } catch {}

  return { success: true }
})
