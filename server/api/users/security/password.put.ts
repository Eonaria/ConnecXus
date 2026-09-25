import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { current_password, new_password } = body

  if (!current_password || !new_password) {
    return { success: false, message: 'กรุณากรอกรหัสผ่านให้ครบถ้วน' }
  }
  if (new_password.length < 8 || !/(?=.*[0-9])(?=.*[a-zA-Z])/.test(new_password)) {
    return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวเลขและตัวอักษร' }
  }

  const db = getDb()

  // 1. Fetch current password hash
  const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [user.userId])
  const currentUser = (users as any)[0]

  if (!currentUser || !currentUser.password_hash) {
    return { success: false, message: 'ไม่พบผู้ใช้นี้ หรือไม่ได้ตั้งรหัสผ่าน' }
  }

  // 2. Verify current password
  const isValid = await bcrypt.compare(current_password, currentUser.password_hash)
  if (!isValid) {
    await db.query('INSERT INTO security_logs (user_id, event_type, status) VALUES (?, ?, ?)', [user.userId, 'PASSWORD_FAILED', 'failed'])
    return { success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }
  }

  // 3. Update to new password
  const newHash = await bcrypt.hash(new_password, 10)
  await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.userId])
  
  // 4. Log
  await db.query('INSERT INTO security_logs (user_id, event_type, status) VALUES (?, ?, ?)', [user.userId, 'PASSWORD_CHANGED', 'success'])

  return { success: true }
})
