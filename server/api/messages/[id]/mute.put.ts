import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  
  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'Conversation ID required' })
  }

  const db = getDb()
  const body = await readBody(event)
  const isMuted = body.is_muted ? 1 : 0

  await db.query(
    'UPDATE conversation_participants SET is_muted = ? WHERE conversation_id = ? AND user_id = ?',
    [isMuted, conversationId, user.userId]
  )

  return { success: true, is_muted: isMuted === 1 }
})
