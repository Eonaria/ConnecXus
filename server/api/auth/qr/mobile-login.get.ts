export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query?.token as string

  if (!token) {
    throw createError({ statusCode: 400, message: 'ไม่พบรหัส QR Token' })
  }

  const session = getQrSession(token)
  if (!session || session.type !== 'mobile_instant' || !session.userId) {
    throw createError({ statusCode: 404, message: 'QR Code หมดอายุหรือไม่ถูกต้อง กรุณาสแกนใหม่อีกครั้ง' })
  }

  const db = getDb()
  const [rows] = await db.query(
    'SELECT id, username, email, display_name, avatar_url, role, is_banned FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  )
  const user = (rows as any[])[0]

  if (!user || user.is_banned) {
    throw createError({ statusCode: 403, message: 'บัญชีนี้ไม่สามารถเข้าสู่ระบบได้หรือถูกระงับ' })
  }

  // Issue JWT cookie on mobile device
  const authToken = await signToken({
    userId: user.id,
    role: user.role,
  })

  setCookie(event, 'auth_token', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Mark session as confirmed for PC status polling
  session.status = 'confirmed'

  // Redirect mobile directly to home feed with success state
  return sendRedirect(event, '/?mobile_login=1', 302)
})
