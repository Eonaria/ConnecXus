

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const db = getDb()
  const [logs] = await db.query(
    'SELECT id, event_type, ip_address, user_agent, status, created_at FROM security_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [user.userId]
  )

  return { success: true, logs }
})
