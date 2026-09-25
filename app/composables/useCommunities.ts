/**
 * composables/useCommunities.ts
 * Shared reactive state for communities & join status across all pages
 */

export interface Community {
  id: number
  name: string
  slug: string
  description: string
  icon: string
  bg_color: string
  avatar_url?: string | null
  banner_url?: string | null
  member_count: number
  post_count: number
  is_joined: boolean
  is_private?: boolean
  is_hidden?: boolean
  user_status?: 'active' | 'pending' | 'rejected' | null
  role: string | null
}

export const useCommunities = () => {
  const { user } = useAuth()
  const { openLoginModal } = useLoginModal()
  const communities = useState<Community[]>('communities:list', () => [])
  const loading = useState<boolean>('communities:loading', () => false)

  /** Fetch communities list with join status from server */
  async function fetchCommunities() {
    loading.value = true
    try {
      const data = await $fetch<{ communities: Community[] }>('/api/communities')
      if (data?.communities) {
        communities.value = data.communities
      }
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /** Toggle join status for a community */
  async function toggleJoin(slug: string) {
    if (!user.value) {
      openLoginModal('เข้าสู่ระบบเพื่อเข้าร่วมชุมชนนี้')
      return
    }

    const target = communities.value.find((c) => c.slug === slug)
    
    try {
      const res = await $fetch<any>(`/api/communities/${slug}/join`, { method: 'POST' })
      if (target) {
        target.is_joined = res.is_joined
        target.user_status = res.user_status || (res.is_pending ? 'pending' : (res.is_joined ? 'active' : null))
        if (res.is_joined) {
          target.member_count = (target.member_count || 0) + 1
        }
      }
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  /** Cancel pending join request */
  async function cancelRequest(slug: string) {
    const target = communities.value.find((c) => c.slug === slug)
    try {
      const res = await $fetch<any>(`/api/communities/${slug}/leave`, { method: 'POST' })
      if (target) {
        target.is_joined = false
        target.user_status = null
      }
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  return {
    communities,
    loading,
    fetchCommunities,
    toggleJoin,
    cancelRequest
  }
}
