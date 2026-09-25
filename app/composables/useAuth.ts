/**
 * composables/useAuth.ts
 * Global auth state + helper functions
 */

interface User {
  id: number
  username: string
  email: string
  backup_email?: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'moderator' | 'admin'
}

export const useAuth = () => {
  // Global user state — shared across all components
  const user = useState<User | null>('auth:user', () => null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')
  const isMod      = computed(() => user.value?.role === 'moderator' || user.value?.role === 'admin')

  /** Fetch the current user from the server (reads JWT cookie).
   *  Uses useRequestFetch() so that browser cookies are forwarded
   *  even when called during SSR (e.g. global middleware). */
  async function fetchMe() {
    // useRequestFetch() returns a fetch instance that automatically passes
    // the original browser cookies in SSR context, and behaves like $fetch on client.
    const apiFetch = useRequestFetch()
    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me')
      user.value = data.user
      if (data.user && import.meta.client) {
        const { saveAccount } = useSavedAccounts()
        saveAccount(data.user)
      }
    } catch {
      user.value = null
    }
  }

  async function login(identifier: string, password: string) {
    const data = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body:   { identifier, password },
    })
    
    if (data.success === false) {
      throw { data: { message: data.message, data: data.data } }
    }
    
    user.value = data.user
    if (data.user && import.meta.client) {
      const { saveAccount } = useSavedAccounts()
      saveAccount(data.user)
    }
    return data
  }

  /** Register a new account */
  async function register(form: {
    display_name: string
    username: string
    email: string
    password: string
  }) {
    const data = await $fetch<{ success: boolean; user: User }>('/api/auth/register', {
      method: 'POST',
      body:   form,
    })
    if (data.user && import.meta.client) {
      const { saveAccount } = useSavedAccounts()
      saveAccount(data.user)
    }
    return data
  }

  /** Logout — clear server cookie and local state */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    isMod,
    fetchMe,
    login,
    register,
    logout,
  }
}
