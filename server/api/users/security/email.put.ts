export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { email, backup_email } = body

  const db = getDb()

  // Get current user data from DB
  const [currentUserRows] = await db.query('SELECT email, backup_email FROM users WHERE id = ?', [user.userId])
  const currentUser = (currentUserRows as any[])[0] || {}

  const updates: string[] = []
  const params: any[] = []

  let cleanPrimaryEmail: string | null = null

  if (email !== undefined) {
    const rawEmail = typeof email === 'string' ? email.trim() : ''
    if (rawEmail !== '') {
      if (/[\u0E00-\u0E7F]/.test(rawEmail) || /[^\x00-\x7F]/.test(rawEmail) || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(rawEmail)) {
        throw createError({ statusCode: 400, message: 'อีเมลหลักต้องเป็นรูปแบบอีเมลภาษาอังกฤษและตัวเลขเท่านั้น (ห้ามใช้ภาษาไทย)' })
      }
      const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [rawEmail, user.userId])
      if ((existing as any[]).length > 0) {
        throw createError({ statusCode: 400, message: 'อีเมลหลักนี้ถูกใช้งานโดยบัญชีอื่นแล้ว' })
      }
      cleanPrimaryEmail = rawEmail
    }
    updates.push('email = ?')
    params.push(cleanPrimaryEmail || '')
  }

  const effectivePrimary = (cleanPrimaryEmail !== null ? cleanPrimaryEmail : (currentUser.email || '')).trim().toLowerCase()

  let cleanBackupEmail: string | null = null

  if (backup_email !== undefined) {
    const rawBackup = typeof backup_email === 'string' ? backup_email.trim() : ''
    if (rawBackup !== '') {
      if (/[\u0E00-\u0E7F]/.test(rawBackup) || /[^\x00-\x7F]/.test(rawBackup) || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(rawBackup)) {
        throw createError({ statusCode: 400, message: 'อีเมลสำรองไม่ถูกต้องตามรูปแบบอีเมลสากล' })
      }

      if (effectivePrimary && rawBackup.toLowerCase() === effectivePrimary) {
        throw createError({ statusCode: 400, message: 'อีเมลสำรองต้องไม่ซ้ำกับอีเมลหลักของคุณ' })
      }

      const [existingPrimary] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [rawBackup, user.userId])
      if ((existingPrimary as any[]).length > 0) {
        throw createError({ statusCode: 400, message: 'อีเมลสำรองนี้ถูกใช้งานเป็นอีเมลหลักโดยบัญชีอื่นแล้ว' })
      }
      cleanBackupEmail = rawBackup
    }
    updates.push('backup_email = ?')
    params.push(cleanBackupEmail || null)
  }

  if (updates.length > 0) {
    params.push(user.userId)
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)

    // Try logging security event
    try {
      await db.query(
        `INSERT INTO security_logs (user_id, event_type, status, created_at) VALUES (?, 'EMAIL_CHANGED', 'success', NOW())`,
        [user.userId]
      )
    } catch (e) {}
  }

  return { 
    success: true, 
    email: cleanPrimaryEmail !== null ? cleanPrimaryEmail : currentUser.email, 
    backup_email: cleanBackupEmail !== null ? cleanBackupEmail : (backup_email !== undefined ? null : currentUser.backup_email)
  }
})
