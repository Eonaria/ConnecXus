// DELETE /api/messages/groups/[id] - Delete group (owner only)
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const conversationId = getRouterParam(event, 'id')
  const db = getDb()

  const [rows] = await db.query(
    'SELECT role FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  ) as any[]

  if (!rows.length || rows[0].role !== 'owner') {
    throw createError({ statusCode: 403, message: 'เฉพาะเจ้าของกลุ่มเท่านั้นที่ลบกลุ่มได้' })
  }

  await db.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
  await db.query('DELETE FROM conversation_participants WHERE conversation_id = ?', [conversationId])
  await db.query('DELETE FROM conversations WHERE id = ?', [conversationId])

  return { success: true }
})