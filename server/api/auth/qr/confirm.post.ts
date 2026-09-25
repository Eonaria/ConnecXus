export default defineEventHandler(async (event) => {
  const tokenPayload = await requireAuth(event)
  const body = await readBody(event)
  const token = body?.token

  if (!token) {
    throw createError({ statusCode: 400, message: 'Missing token' })
  }

  const session = getQrSession(token)
  if (!session) {
    throw createError({ statusCode: 404, message: 'QR Code หมดอายุหรือไม่มีอยู่ในระบบ' })
  }

  // Fetch full user record
  const db = getDb()
  const [rows] = await db.query(
    'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE id = ? AND is_banned = 0 LIMIT 1',
    [tokenPayload.userId]
  )
  const user = (rows as any[])[0]

  if (!user) {
    throw createError({ statusCode: 404, message: 'ไม่พบผู้ใช้หรือบัญชีถูกระงับ' })
  }

  // Generate new JWT auth token for the desktop session
  const desktopAuthToken = await signToken({
    userId: user.id,
    username: user.username,
    role: user.role
  })

  const success = confirmQrSession(token, user, desktopAuthToken)

  return {
    success,
    message: 'ยืนยันการเข้าสู่ระบบสำเร็จ'
  }
})
