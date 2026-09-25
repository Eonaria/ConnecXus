/**
 * middleware/00.init.global.ts
 * รันทุก route อัตโนมัติ — restore auth state จาก JWT cookie
 * ชื่อขึ้นต้น "00." เพื่อให้รันก่อน middleware อื่น
 */
export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchMe } = useAuth()
  // ถ้า user ยังเป็น null (เช่น refresh หน้า) → ดึงจาก server
  if (!user.value) {
    await fetchMe()
  }
})
