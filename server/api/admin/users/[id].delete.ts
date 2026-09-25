import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const targetId = getRouterParam(event, 'id')

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID required' })
  }

  if (targetId === '1') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'ไม่สามารถจัดการบัญชีผู้ก่อตั้งระบบได้' })
  }

  if (user.userId === Number(targetId)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'ไม่สามารถลบบัญชีตัวเองได้' })
  }

  const db = getDb()
  
  const [targetRows] = await db.query<any[]>('SELECT username, display_name FROM users WHERE id = ?', [targetId])
  const targetUser = targetRows[0]
  const targetLabel = targetUser ? `@${targetUser.username}` : `#${targetId}`

  // We'll hard-delete for simplicity
  await db.query('DELETE FROM users WHERE id = ?', [targetId])

  await db.query(
    `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
    [user.userId, 'delete_user', 'user', targetId, `ลบบัญชีผู้ใช้ ${targetLabel} ถาวร`]
  )

  return { success: true }
})
