import type { ResultSetHeader, RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const reportId = getRouterParam(event, 'id')

  if (!reportId) {
    throw createError({ statusCode: 400, message: 'Report ID required' })
  }

  const body = await readBody(event)
  const db = getDb()

  // Find the report
  const [reportRows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM reports WHERE id = ? LIMIT 1',
    [reportId]
  )
  const report = reportRows[0]

  if (!report) {
    throw createError({ statusCode: 404, message: 'Report not found' })
  }

  // Check permissions: Either Global Admin, OR Community Mod if report.community_id is present
  let hasPermission = false

  if (user.role === 'admin') {
    hasPermission = true
  } else if (report.community_id) {
    const [memberRows] = await db.query<RowDataPacket[]>(
      "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
      [report.community_id, user.userId]
    )
    const member = memberRows[0]
    if (member && (member.role === 'owner' || member.role === 'moderator')) {
      hasPermission = true
    }
  }

  if (!hasPermission) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // Resolve the report
  await db.query<ResultSetHeader>(
    'UPDATE reports SET status = ?, admin_note = ? WHERE id = ?',
    [body.status || 'resolved', body.adminNote || null, reportId]
  )

  return { success: true }
})
