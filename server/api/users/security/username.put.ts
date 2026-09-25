export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const rawUsername = body?.new_username
  const new_username = typeof rawUsername === 'string' ? rawUsername.trim() : ''

  if (!new_username) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุชื่อผู้ใช้ใหม่' })
  }

  // Username validation (alphanumeric and underscores, 3-30 chars, uppercase & lowercase supported)
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(new_username)) {
    throw createError({ statusCode: 400, message: 'ชื่อผู้ใช้ต้องมีความยาว 3-30 ตัวอักษร และประกอบด้วยตัวอักษรภาษาอังกฤษ (A-Z, a-z), ตัวเลข หรือเครื่องหมาย _ เท่านั้น' })
  }

  const db = getDb()

  // Check if username already exists for other users (case-sensitive)
  const [existing] = await db.query('SELECT id, username FROM users WHERE BINARY username = ? AND id != ? LIMIT 1', [new_username, user.userId])
  if ((existing as any[]).length > 0) {
    const row = (existing as any[])[0]
    if (row.username === new_username) {
      throw createError({ statusCode: 400, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' })
    }
  }
  
  await db.query('UPDATE users SET username = ? WHERE id = ?', [new_username, user.userId])
  
  const ip = getRequestHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || 'unknown'
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
  
  await db.query(
    'INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, status) VALUES (?, ?, ?, ?, ?)',
    [user.userId, 'USERNAME_CHANGED', ip, userAgent, 'success']
  )

  // Broadcast to admins in realtime
  broadcastToAdmins({ type: 'admin_user_updated', payload: { userId: user.userId, username: new_username } })
  broadcastGlobal({ type: 'username_changed', payload: { userId: user.userId, username: new_username } })

  return { success: true, message: 'เปลี่ยนชื่อผู้ใช้เรียบร้อยแล้ว' }
})
