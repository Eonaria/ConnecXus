import type { ResultSetHeader  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  
  const body = await readBody(event)
  const is_suspended = body?.is_suspended ? 1 : 0
  
  let suspendedUntil = null
  if (is_suspended === 1 && body.ban_duration && body.ban_duration !== 'permanent') {
    const now = new Date()
    if (body.ban_duration === '24h') now.setHours(now.getHours() + 24)
    else if (body.ban_duration === '3d') now.setDate(now.getDate() + 3)
    else if (body.ban_duration === '7d') now.setDate(now.getDate() + 7)
    else if (body.ban_duration === '30d') now.setDate(now.getDate() + 30)
    suspendedUntil = now.toISOString().slice(0, 19).replace('T', ' ')
  }

  const reason = (is_suspended === 1) ? (body.ban_reason || null) : null

  const db = getDb()

  await db.query<ResultSetHeader>(
    `UPDATE communities SET is_suspended = ?, suspended_until = ?, suspend_reason = ? WHERE id = ?`,
    [is_suspended, suspendedUntil, reason, id]
  )

  const action = is_suspended ? 'suspend_community' : 'unsuspend_community'
  const details = is_suspended ? `ระงับชุมชนระยะเวลา ${body.ban_duration || 'permanent'} เหตุผล: ${reason || '-'}` : 'ปลดระงับชุมชน'
    
  await db.query(
    `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
    [user.userId, action, 'community', id, details]
  )

  return { success: true }
})
