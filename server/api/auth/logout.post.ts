/**
 * POST /api/auth/logout
 * ออกจากระบบ — ลบ auth cookie
 */
export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  return { success: true }
})
