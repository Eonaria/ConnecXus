import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const messageId = getRouterParam(event, 'id')

  const db = getDb()

  // Verify ownership
  const [rows] = await db.query<RowDataPacket[]>('SELECT sender_id FROM messages WHERE id = ?', [messageId])
  if (rows.length === 0) {
    throw createError({ statusCode: 404, message: 'Message not found' })
  }
  if (Number(rows[0]?.sender_id) !== Number(user.userId)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  await db.query('DELETE FROM messages WHERE id = ?', [messageId])

  return { success: true, message_id: messageId }
})
