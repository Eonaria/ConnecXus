/**
 * POST /api/auth/register
 * สมัครสมาชิกใหม่
 */
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password, display_name } = body ?? {}

  // ── Validate input ──
  if (!username || !email || !password || !display_name) {
    throw createError({ statusCode: 400, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    throw createError({ statusCode: 400, message: 'ชื่อผู้ใช้ต้องเป็นตัวอักษร A-Z, a-z, 0-9, _ (3-30 ตัว)' })
  }

  if (/[\u0E00-\u0E7F]/.test(email) || /[^\x00-\x7F]/.test(email) || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    throw createError({ statusCode: 400, message: 'อีเมลต้องเป็นภาษาอังกฤษและตัวเลขเท่านั้น (ห้ามใช้ภาษาไทย)' })
  }

  if (password.length < 8 || !/(?=.*[0-9])(?=.*[a-zA-Z])/.test(password)) {
    throw createError({ statusCode: 400, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวเลขและตัวอักษร' })
  }

  const db = getDb()

  // ── Check duplicate (username is case-sensitive, email is case-insensitive) ──
  const [existing] = await db.query(
    'SELECT id, username, email FROM users WHERE BINARY username = ? OR LOWER(email) = LOWER(?) LIMIT 1',
    [username, email],
  )
  if ((existing as any[]).length > 0) {
    const row = (existing as any[])[0]
    if (row.username && row.username === username) {
      throw createError({ statusCode: 409, message: `ชื่อผู้ใช้ "@${username}" นี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่ออื่น` })
    }
    if (row.email && row.email.toLowerCase() === email.toLowerCase()) {
      throw createError({ statusCode: 409, message: `อีเมล "${email}" นี้ถูกลงทะเบียนไว้แล้ว กรุณาใช้อีเมลอื่น หรือไปที่หน้าเข้าสู่ระบบ` })
    }
    throw createError({ statusCode: 409, message: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว' })
  }

  // ── Hash password ──
  const password_hash = await bcrypt.hash(password, 12)

  // ── Insert user ──
  const [result] = await db.query(
    'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)',
    [username, email, password_hash, display_name],
  )
  const userId = (result as any).insertId

  // Broadcast to admins in realtime
  broadcastToAdmins({ type: 'admin_stats_updated', payload: {} })
  broadcastToAdmins({ type: 'admin_user_updated', payload: { userId, username } })

  return {
    success: true,
    user: {
      id:           userId,
      username,
      email,
      display_name,
      avatar_url:   null,
      role:         'user',
    },
  }
})
