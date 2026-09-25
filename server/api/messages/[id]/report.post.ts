import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const messageId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const reason = body.reason || 'No reason provided'

  const db = getDb()

  // Verify that the user is in the conversation to report it
  const [msgRows] = await db.query<RowDataPacket[]>('SELECT conversation_id FROM messages WHERE id = ?', [messageId])
  if (msgRows.length === 0) {
    throw createError({ statusCode: 404, message: 'Message not found' })
  }
  const convId = msgRows[0]?.conversation_id

  const [partRows] = await db.query<RowDataPacket[]>(
    'SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [convId, user.userId]
  )
  if (partRows.length === 0) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  await db.query(
    'INSERT INTO reports (reporter_id, target_type, reported_message_id, reason, status) VALUES (?, ?, ?, ?, ?)',
    [user.userId, 'message', messageId, reason, 'pending']
  )

  return { success: true, message: 'Report submitted successfully' }
})
