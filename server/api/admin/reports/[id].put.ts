import type { ResultSetHeader  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const reportId = parseInt(event.context.params?.id || '0')
  if (!reportId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid report ID' })
  }

  const body = await readBody(event)
  const { status, admin_note } = body

  if (!['pending', 'reviewed', 'resolved'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const db = getDb()
  
  await db.query(
    'UPDATE reports SET status = ?, admin_note = ?, updated_at = NOW() WHERE id = ?',
    [status, admin_note || null, reportId]
  )

  await db.query(
    `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
    [user.userId, 'update_report', 'report', reportId, `อัปเดตสถานะเป็น ${status}`]
  )

  return { success: true, id: reportId, status, admin_note }
})
