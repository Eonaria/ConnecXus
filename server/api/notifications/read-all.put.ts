export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb()
  await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [user.userId])
  try {
    broadcastToUser(user.userId, { type: 'notification_update', payload: { unread_count: 0 } })
  } catch {}
  return { success: true }
})