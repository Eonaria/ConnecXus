// POST /api/messages/groups - Create a new group conversation
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const db = getDb()
  const body = await readBody(event)
  const { name, avatar_url, participant_ids } = body

  if (!name || !Array.isArray(participant_ids) || participant_ids.length < 1) {
    throw createError({ statusCode: 400, message: 'ต้องมีชื่อกลุ่มและสมาชิกอย่างน้อย 1 คน' })
  }

  const [result] = await db.query(
    `INSERT INTO conversations (type, name, avatar_url) VALUES ('group', ?, ?)`,
    [name.trim(), avatar_url || null]
  ) as any[]

  const conversationId = result.insertId

  await db.query(
    `INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, 'owner')`,
    [conversationId, user.userId]
  )

  const uniqueIds = [...new Set(participant_ids.map(Number))].filter((id: number) => id !== user.userId)
  for (const uid of uniqueIds) {
    await db.query(
      `INSERT IGNORE INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, 'member')`,
      [conversationId, uid]
    )
    try {
      broadcastToUser(uid, {
        type: 'chat_group_created',
        payload: { conversation_id: conversationId, name: name.trim() }
      })
    } catch {}
  }

  return { success: true, conversation_id: conversationId }
})
