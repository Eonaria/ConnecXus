/**
 * middleware/auth.ts
 * ป้องกัน route ที่ต้องการ authentication
 * ใช้งาน: definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchMe } = useAuth()

  // ดึงข้อมูลผู้ใช้ถ้ายังไม่มีใน state
  if (!user.value) {
    await fetchMe()
  }

  // ยังไม่ได้ login → redirect ไปหน้า login
  if (!user.value) {
    return navigateTo('/login')
  }
})
