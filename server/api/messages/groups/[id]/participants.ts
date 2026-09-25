// GET/POST/PUT/DELETE /api/messages/groups/[id]/participants
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const conversationId = getRouterParam(event, 'id')
  const db = getDb()
  const method = event.method

  // Check if user is in group
  const [myRows] = await db.query(
    'SELECT role FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  ) as any[]

  if (!myRows.length) {
    throw createError({ statusCode: 403, message: 'คุณไม่ได้อยู่ในกลุ่มนี้' })
  }

  const myRole = myRows[0].role

  // GET - List all participants
  if (method === 'GET') {
    const [participants] = await db.query(
      'SELECT cp.user_id, cp.role, cp.joined_at, u.username, u.display_name, u.avatar_url FROM conversation_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.conversation_id = ? ORDER BY FIELD(cp.role, "owner", "admin", "member"), u.display_name',
      [conversationId]
    ) as any[]
    return { participants }
  }

  // POST - Add members
  if (method === 'POST') {
    const body = await readBody(event)
    const { user_ids } = body
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      throw createError({ statusCode: 400, message: 'ต้องระบุ user_ids' })
    }
    for (const uid of user_ids) {
      await db.query(
        'INSERT IGNORE INTO conversation_participants (conversation_id, user_id, role) VALUES (?, ?, "member")',
        [conversationId, uid]
      )
    }
    return { success: true }
  }

  // PUT - Change role (owner only)
  if (method === 'PUT') {
    if (myRole !== 'owner') throw createError({ statusCode: 403, message: 'เฉพาะเจ้าของกลุ่มเท่านั้น' })
    const body = await readBody(event)
    const { target_user_id, role } = body
    if (!target_user_id || !['admin', 'member'].includes(role)) {
      throw createError({ statusCode: 400, message: 'ข้อมูลไม่ถูกต้อง' })
    }
    // Cannot change owner role
    const [targetRows] = await db.query(
      'SELECT role FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, target_user_id]
    ) as any[]
    if (targetRows[0]?.role === 'owner') throw createError({ statusCode: 403, message: 'ไม่สามารถเปลี่ยนสิทธิ์เจ้าของกลุ่มได้' })

    await db.query(
      'UPDATE conversation_participants SET role = ? WHERE conversation_id = ? AND user_id = ?',
      [role, conversationId, target_user_id]
    )
    return { success: true }
  }

  // DELETE - Leave or kick
  if (method === 'DELETE') {
    const body = await readBody(event)
    const target_user_id = body?.target_user_id || user.userId

    if (target_user_id === user.userId) {
      // Leaving group
      if (myRole === 'owner') throw createError({ statusCode: 400, message: 'เจ้าของกลุ่มต้องลบกลุ่มแทนการออก' })
      await db.query('DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?', [conversationId, user.userId])
      return { success: true }
    }

    // Kicking someone else
    const [targetRows] = await db.query(
      'SELECT role FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, target_user_id]
    ) as any[]

    const targetRole = targetRows[0]?.role
    if (!targetRole) throw createError({ statusCode: 404, message: 'ไม่พบผู้ใช้ในกลุ่ม' })
    if (targetRole === 'owner') throw createError({ statusCode: 403, message: 'ไม่สามารถเตะเจ้าของกลุ่มได้' })
    if (myRole === 'admin' && targetRole === 'admin') throw createError({ statusCode: 403, message: 'แอดมินไม่สามารถเตะแอดมินด้วยกันได้' })
    if (myRole === 'member') throw createError({ statusCode: 403, message: 'สมาชิกทั่วไปไม่สามารถเตะผู้อื่นได้' })

    await db.query('DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?', [conversationId, target_user_id])
    return { success: true }
  }

  throw createError({ statusCode: 405, message: 'Method not allowed' })
})