/**
 * plugins/auth.client.ts
 * Run on client startup — restore auth state from server cookie via /api/auth/me
 * This prevents getting logged out on every page refresh.
 */
export default defineNuxtPlugin(async () => {
  const { user, fetchMe } = useAuth()
  // Only fetch if user state is empty (e.g. after a hard refresh)
  if (!user.value) {
    await fetchMe()
  }
})
