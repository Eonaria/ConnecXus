/**
 * GET /api/auth/me
 * ดึงข้อมูลผู้ใช้ที่ login อยู่ (ใช้ JWT cookie)
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  const tokenPayload = await getRequestUser(event)

  if (!tokenPayload) {
    // Return 200 with null user instead of throwing 401 to prevent console red errors
    return { user: null }
  }

  try {
    const banStatus = await checkAndResolveUserBan(tokenPayload.userId)
    if (banStatus.isBanned) {
      deleteCookie(event, 'auth_token', { path: '/' })
      return { user: null }
    }

    const db = getDb()
    const [rows] = await db.query(
      `SELECT id, username, email, backup_email, display_name, avatar_url, bio, role
       FROM users
       WHERE id = ? AND is_banned = 0
       LIMIT 1`,
      [tokenPayload.userId],
    )

    const user = (rows as any[])[0]

    if (!user) {
      deleteCookie(event, 'auth_token', { path: '/' })
      return { user: null }
    }

    return { user }
  } catch (err: any) {
    // Catch database connection errors gracefully to prevent SSR crash
    console.error('[AUTH ME ERROR]:', err.message || err)
    return { user: null }
  }
})
