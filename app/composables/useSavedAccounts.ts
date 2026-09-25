/**
 * composables/useSavedAccounts.ts
 * Manages locally remembered/saved accounts for instant account switching and selection.
 */

export interface SavedAccount {
  id: number
  username: string
  display_name: string
  avatar_url: string | null
  email?: string
  role?: 'user' | 'moderator' | 'admin' | string
  last_login: number
}

export function useSavedAccounts() {
  const savedAccounts = useState<SavedAccount[]>('cx:saved_accounts', () => [])

  function loadSavedAccounts(): SavedAccount[] {
    if (!import.meta.client) return []
    try {
      const raw = localStorage.getItem('cx_saved_accounts')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          savedAccounts.value = parsed.sort((a, b) => (b.last_login || 0) - (a.last_login || 0))
          return savedAccounts.value
        }
      }
    } catch {
      // ignore
    }
    savedAccounts.value = []
    return []
  }

  function saveAccount(acc: {
    id: number
    username: string
    display_name?: string
    avatar_url?: string | null
    email?: string
    role?: string
  }) {
    if (!import.meta.client || !acc || !acc.username) return
    try {
      const current = loadSavedAccounts()
      const existingIdx = current.findIndex(
        (a) => a.id === acc.id || a.username.toLowerCase() === acc.username.toLowerCase()
      )
      const entry: SavedAccount = {
        id: acc.id,
        username: acc.username,
        display_name: acc.display_name || acc.username,
        avatar_url: acc.avatar_url || null,
        email: acc.email || '',
        role: acc.role || 'user',
        last_login: Date.now(),
      }

      if (existingIdx >= 0) {
        current[existingIdx] = { ...current[existingIdx], ...entry }
      } else {
        current.unshift(entry)
      }

      // Store up to 8 saved accounts
      const trimmed = current.slice(0, 8)
      savedAccounts.value = trimmed
      localStorage.setItem('cx_saved_accounts', JSON.stringify(trimmed))
    } catch {
      // ignore
    }
  }

  function removeAccount(idOrUsername: number | string) {
    if (!import.meta.client) return
    try {
      const current = loadSavedAccounts()
      const filtered = current.filter(
        (a) => a.id !== idOrUsername && a.username.toLowerCase() !== String(idOrUsername).toLowerCase()
      )
      savedAccounts.value = filtered
      localStorage.setItem('cx_saved_accounts', JSON.stringify(filtered))
    } catch {
      // ignore
    }
  }

  function clearAllSavedAccounts() {
    if (!import.meta.client) return
    savedAccounts.value = []
    localStorage.removeItem('cx_saved_accounts')
  }

  return {
    savedAccounts,
    loadSavedAccounts,
    saveAccount,
    removeAccount,
    clearAllSavedAccounts,
  }
}
