export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const notificationId = getRouterParam(event, 'id')
  if (!notificationId) {
    throw createError({ statusCode: 400, message: 'Invalid notification ID' })
  }

  const db = getDb()

  await db.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [notificationId, user.userId]
  )

  try {
    broadcastToUser(user.userId, { type: 'notification_update', payload: { notification_id: notificationId } })
  } catch {}

  return { success: true }
})
