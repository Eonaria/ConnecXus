// PUT /api/messages/groups/[id] - Update group name/avatar
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const conversationId = getRouterParam(event, 'id')
  const db = getDb()
  const body = await readBody(event)
  const { name, avatar_url } = body

  const [rows] = await db.query(
    'SELECT role FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  ) as any[]

  if (!rows.length || !['owner', 'admin'].includes(rows[0].role)) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์แก้ไขกลุ่มนี้' })
  }

  const updates: string[] = []
  const params: any[] = []

  if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()) }
  if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url) }

  if (updates.length === 0) throw createError({ statusCode: 400, message: 'ไม่มีข้อมูล' })

  params.push(conversationId)
  await db.query('UPDATE conversations SET ' + updates.join(', ') + ' WHERE id = ?', params)

  return { success: true }
})