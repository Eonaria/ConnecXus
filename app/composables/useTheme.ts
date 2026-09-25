/**
 * useTheme composable
 * Manages light/dark theme.
 * - Server: reads from 'cx-theme' cookie (set by client JS below)
 * - Client: reads from localStorage AND syncs to cookie so SSR can read it
 * This prevents SSR/CSR hydration mismatch.
 */
export function useTheme() {
  // useCookie is isomorphic — works on both server and client
  // The server can read it from the request cookie header
  const themeCookie = useCookie<'light' | 'dark'>('cx-theme', {
    default: () => 'dark',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  const theme = useState<'light' | 'dark'>('app-theme', () => themeCookie.value ?? 'dark')

  // Apply on client immediately when composable is used
  if (import.meta.client) {
    applyTheme(theme.value)
  }

  function applyTheme(t: 'light' | 'dark') {
    if (!import.meta.client) return
    document.documentElement.setAttribute('data-theme', t)
  }

  function setTheme(t: 'light' | 'dark') {
    theme.value = t
    themeCookie.value = t
    if (import.meta.client) {
      applyTheme(t)
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const isDark = computed(() => theme.value === 'dark')

  // Watch for changes (client only)
  watch(theme, (val) => {
    applyTheme(val)
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
