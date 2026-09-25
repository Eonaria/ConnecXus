import type { ResultSetHeader  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const targetId = getRouterParam(event, 'id')

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID required' })
  }

  if (targetId === '1') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'ไม่สามารถเปลี่ยนยศผู้ก่อตั้งระบบได้' })
  }

  if (user.userId === Number(targetId)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'ไม่สามารถเปลี่ยนยศตัวเองได้' })
  }

  const body = await readBody(event)
  const db = getDb()

  if (body.role) {
    if (!['admin', 'user'].includes(body.role)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
    }
    await db.query<ResultSetHeader>(
      `UPDATE users SET role = ? WHERE id = ?`,
      [body.role, targetId]
    )

    const [targetRows] = await db.query<any[]>('SELECT username, display_name FROM users WHERE id = ?', [targetId])
    const targetUser = targetRows[0]
    const targetLabel = targetUser ? `@${targetUser.username}` : `#${targetId}`

    await db.query(
      `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.userId, 'change_role', 'user', targetId, `เปลี่ยนสิทธิ์ ${targetLabel} เป็น ${body.role}`]
    )
  }

  return { success: true }
})
