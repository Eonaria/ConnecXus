/**
 * plugins/fetch.ts
 * Global interceptor for all $fetch calls
 */
export default defineNuxtPlugin((nuxtApp) => {
  globalThis.$fetch = $fetch.create({
    async onResponseError({ response }) {
      // Catch specific "Account Suspended" 403 errors
      if (response.status === 403 && response._data?.statusMessage === 'Account Suspended') {
        const auth = useAuth()
        auth.user.value = null
        
        if (import.meta.client) {
          alert('บัญชีของคุณถูกระงับการใช้งานโดยผู้ดูแลระบบ')
          window.location.href = '/login'
        }
      }
    }
  })
})
