<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      style="
        position: fixed;
        inset: 0;
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease-out;
      "
      @click.self="close"
    >
      <div
        style="
          background: var(--bg-card, #1e1e24);
          border: 1px solid var(--border-primary, #2d2d35);
          border-radius: 20px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          transform: scale(0.95);
          animation: scaleUp 0.2s ease-out forwards;
        "
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-primary, #fff); margin: 0;">
            {{ title }}
          </h3>
          <button @click="close" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div v-if="pending" style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          กำลังโหลด...
        </div>
        <div v-else-if="users.length === 0" style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          ไม่พบผู้ใช้
        </div>
        <div v-else style="overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 8px;">
          <div v-for="u in users" :key="u.id" style="display: flex; align-items: center; gap: 12px;">
            <NuxtLink :to="`/profile/${u.username}`" @click="close" style="text-decoration: none; flex-shrink: 0;">
              <img v-if="u.avatar_url" :src="u.avatar_url" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
              <div v-else style="width: 40px; height: 40px; border-radius: 50%; background: #3f3f46; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white;">
                {{ u.display_name.charAt(0).toUpperCase() }}
              </div>
            </NuxtLink>
            
            <div style="flex: 1; min-width: 0;">
              <NuxtLink :to="`/profile/${u.username}`" @click="close" style="text-decoration: none;">
                <div style="font-weight: 700; font-size: 15px; color: var(--text-primary, #fff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ u.display_name }}</div>
                <div style="font-size: 13px; color: var(--text-muted, #a1a1aa);">@{{ u.username }}</div>
              </NuxtLink>
            </div>

            <div v-if="authUser?.username !== u.username">
              <button
                @click="toggleFollow(u)"
                style="padding: 6px 16px; border-radius: 9999px; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;"
                :style="u.is_following ? 'background: transparent; border: 1px solid var(--border-primary); color: var(--text-primary);' : 'background: var(--text-primary); color: var(--bg-primary); border: 1px solid var(--text-primary);'"
              >
                {{ u.is_following ? 'เลิกติดตาม' : 'ติดตาม' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  <AppConfirmModal
    :isOpen="isConfirmUnfollowOpen"
    title="เลิกติดตาม"
    :message="`คุณต้องการเลิกติดตาม @${userToUnfollow?.username} ใช่หรือไม่?`"
    confirmText="เลิกติดตาม"
    @confirm="() => { executeToggleFollow(userToUnfollow); isConfirmUnfollowOpen = false }"
    @cancel="isConfirmUnfollowOpen = false"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  title: string
  username: string
  type: 'followers' | 'following'
}>()

const emit = defineEmits(['close'])

const users = ref<any[]>([])
const pending = ref(false)
const { user: authUser } = useAuth()
const toast = useToast()

const isConfirmUnfollowOpen = ref(false)
const userToUnfollow = ref<any>(null)

watch(() => props.isOpen, async (val) => {
  if (val) {
    await fetchUsers()
  } else {
    users.value = []
  }
})

async function fetchUsers() {
  pending.value = true
  try {
    const data = await $fetch<any>(`/api/users/follows`, {
      query: { username: props.username, type: props.type }
    })
    users.value = data.users
  } catch (err) {
    console.error(err)
  } finally {
    pending.value = false
  }
}

function close() {
  emit('close')
}

async function toggleFollow(u: any) {
  if (u.is_following) {
    userToUnfollow.value = u
    isConfirmUnfollowOpen.value = true
  } else {
    await executeToggleFollow(u)
  }
}

async function executeToggleFollow(u: any) {
  try {
    const res = await $fetch<any>('/api/users/follow', {
      method: 'POST',
      body: { username: u.username }
    })
    u.is_following = res.following
    if (!res.following) {
      toast.add({
        title: 'เลิกติดตามแล้ว',
        description: `คุณได้เลิกติดตาม @${u.username} เรียบร้อยแล้ว`,
        icon: 'i-heroicons-user-minus',
        color: 'gray'
      })
    }
  } catch (err: any) {
    toast.add({
      title: 'เกิดข้อผิดพลาด',
      description: err.data?.message || 'ไม่สามารถดำเนินการได้',
      color: 'red'
    })
  }
}
</script>
