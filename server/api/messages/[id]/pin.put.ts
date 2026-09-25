import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const messageId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const isPinned = body.is_pinned === true

  const db = getDb()

  // Verify that the user is in the conversation
  const [msgRows] = await db.query<RowDataPacket[]>('SELECT conversation_id FROM messages WHERE id = ?', [messageId])
  if (msgRows.length === 0) {
    throw createError({ statusCode: 404, message: 'Message not found' })
  }
  const convId = msgRows[0]?.conversation_id

  const [partRows] = await db.query<RowDataPacket[]>(
    'SELECT user_id FROM conversation_participants WHERE conversation_id = ?',
    [convId]
  )
  const isParticipant = partRows.some(row => Number(row.user_id) === Number(user.userId))
  
  if (!isParticipant) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  await db.query(
    'UPDATE messages SET is_pinned = ? WHERE id = ?',
    [isPinned ? 1 : 0, messageId]
  )

  return { success: true, message_id: messageId, is_pinned: isPinned, conversation_id: convId }
})
