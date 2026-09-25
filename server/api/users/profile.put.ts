/**
 * PUT /api/users/profile
 * Update profile of the authenticated user
 */
export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)
  const body = (await readBody(event)) ?? {}

  const { display_name, bio, banner_url, avatar_url } = body

  const db = getDb()

  // Ensure banner_url column exists in users table
  try {
    await db.query('ALTER TABLE users ADD COLUMN banner_url VARCHAR(500) DEFAULT NULL')
  } catch {}

  const updates: string[] = []
  const params: any[] = []

  if (display_name !== undefined) {
    updates.push('display_name = ?')
    params.push(display_name)
  }

  if (bio !== undefined) {
    updates.push('bio = ?')
    params.push(bio)
  }

  if (banner_url !== undefined) {
    updates.push('banner_url = ?')
    params.push(banner_url)
  }

  if (avatar_url !== undefined) {
    updates.push('avatar_url = ?')
    params.push(avatar_url)
  }

  if (updates.length > 0) {
    params.push(currentUser.userId)
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
  }

  const [rows] = await db.query(
    `SELECT id, username, email, display_name, avatar_url, bio, role, banner_url, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [currentUser.userId]
  )

  const updatedUser = (rows as any[])[0]

  return {
    success: true,
    user: updatedUser,
  }
})
