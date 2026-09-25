/**
 * POST /api/auth/login
 * เข้าสู่ระบบด้วย username หรือ email + password
 */
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body ?? {}

  if (!identifier || !password) {
    throw createError({ statusCode: 400, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' })
  }

  try {
    const db = getDb()

    // ── Find user by username, primary email, or backup email ──
    const cleanId = identifier.trim()
    const [rows] = await db.query(
      `SELECT id, username, email, backup_email, display_name, avatar_url, bio, role, password_hash, is_banned, suspended_until, ban_reason, banned_at
       FROM users
       WHERE (username = ? OR email = ? OR FIND_IN_SET(LOWER(?), LOWER(REPLACE(backup_email, ' ', ''))))
       LIMIT 1`,
      [cleanId, cleanId, cleanId],
    )

    const user = (rows as any[])[0]

    if (!user) {
      return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
    }

    if (user.is_banned) {
      // 1. Check if temporary suspension has expired
      if (user.suspended_until && new Date(user.suspended_until) <= new Date()) {
        await db.query('UPDATE users SET is_banned = 0, suspended_until = NULL, ban_reason = NULL, banned_at = NULL WHERE id = ?', [user.id])
        user.is_banned = 0
        user.suspended_until = null
        user.ban_reason = null
        user.banned_at = null
      } else {
        const isPermanent = !user.suspended_until || new Date(user.suspended_until) > new Date('2099-01-01')
        const banType = isPermanent ? 'permanent' : 'suspended'
        
        let message = ''
        if (isPermanent) {
          message = 'บัญชีของคุณถูกแบนถาวร'
        } else {
          const dateStr = new Date(user.suspended_until).toLocaleString('th-TH', { 
            dateStyle: 'medium', 
            timeStyle: 'short', 
            timeZone: 'Asia/Bangkok'
          })
          message = `บัญชีของคุณถูกระงับชั่วคราว (สิ้นสุด: ${dateStr})`
        }

        return { 
          success: false, 
          message,
          data: { 
            ban: { 
              type: banType, 
              reason: user.ban_reason || 'ละเมิดข้อกำหนดการใช้งานชุมชน', 
              banned_at: user.banned_at,
              until: user.suspended_until 
            } 
          }
        }
      }
    }

    // ── Check password ──
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
    }

    // ── Issue JWT cookie ──
    const token = await signToken({ userId: user.id, role: user.role })
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    // Return user info (omitting hash & ban info)
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        backup_email: user.backup_email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        role: user.role,
      },
    }
  } catch (err: any) {
    if (err.statusCode) throw err // Re-throw Nuxt Errors
    console.error('[LOGIN ERROR]:', err.message || err)
    throw createError({ statusCode: 503, message: 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาเปิด MySQL' })
  }
})
