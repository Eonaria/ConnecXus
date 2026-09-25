/**
 * POST /api/auth/delete
 * ลบบัญชีผู้ใช้ (Delete Account)
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  if (!user || !user.userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const db = getDb()
  
  try {
    // Delete user from database
    await db.query('DELETE FROM users WHERE id = ?', [user.userId])
    
    // Clear session
    deleteCookie(event, 'auth_token', { path: '/' })
    
    return { success: true, message: 'ลบบัญชีสำเร็จ' }
  } catch (error) {
    console.error('Failed to delete account:', error)
    throw createError({ statusCode: 500, message: 'เกิดข้อผิดพลาดในการลบบัญชี' })
  }
})
