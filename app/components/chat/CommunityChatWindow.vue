<template>
  <div
    style="
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #edf0f7;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      height: 540px;
      overflow: hidden;
    "
  >
    <!-- Chat Header -->
    <div
      style="
        padding: 16px 20px;
        background: #fafbff;
        border-bottom: 1px solid #edf0f7;
        display: flex;
        align-items: center;
        justify-content: space-between;
      "
    >
      <div style="display: flex; align-items: center; gap: 12px;">
        <div
          style="
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
          "
          :style="{ background: communityBg || '#eef2ff' }"
        >
          {{ communityIcon || '💬' }}
        </div>
        <div>
          <div style="font-size: 15px; font-weight: 700; color: #1a1d2e;">
            ห้องแชทกลุ่ม: {{ communityName }}
          </div>
          <div style="font-size: 12px; color: #00b894; font-weight: 600; display: flex; align-items: center; gap: 5px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #00b894; display: inline-block; animation: cx-pulse 1.5s ease-in-out infinite;"></span>
            ออนไลน์กำลังพูดคุย (Real-time Live Chat)
          </div>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesBox"
      style="
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: #f9fafd;
      "
    >
      <div v-if="messages.length === 0" style="text-align: center; color: #9ba3c0; padding: 40px 0; font-size: 14px;">
        ยังไม่มีข้อความในกลุ่มนี้ เริ่มต้นทักทายสมาชิกเป็นคนแรกเลย!
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        style="display: flex; gap: 10px;"
        :style="isSelf(msg) ? 'flex-direction: row-reverse;' : 'flex-direction: row;'"
      >
        <!-- Sender Avatar -->
        <div
          style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            flex-shrink: 0;
          "
          :style="{ background: msg.avatarBg || '#7b6cf6' }"
        >
          {{ msg.sender_avatar || 'ผ' }}
        </div>

        <!-- Message Body -->
        <div style="max-width: 70%;">
          <div
            style="font-size: 11px; color: #9ba3c0; margin-bottom: 3px;"
            :style="isSelf(msg) ? 'text-align: right;' : 'text-align: left;'"
          >
            {{ msg.sender_name }} &nbsp;·&nbsp; {{ msg.created_at }}
          </div>

          <div
            style="
              padding: 10px 16px;
              border-radius: 16px;
              font-size: 14px;
              line-height: 1.5;
              word-break: break-word;
            "
            :style="
              isSelf(msg)
                ? 'background: var(--brand); color: #ffffff; border-bottom-right-radius: 4px;'
                : 'background: #ffffff; color: #1a1d2e; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;'
            "
          >
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input Bar -->
    <form
      @submit.prevent="sendMessage"
      style="
        padding: 14px 20px;
        background: #ffffff;
        border-top: 1px solid #edf0f7;
        display: flex;
        align-items: center;
        gap: 10px;
      "
    >
      <input
        v-model="inputContent"
        type="text"
        placeholder="พิมพ์ข้อความพูดคุยในกลุ่ม..."
        class="cx-input"
        style="border-radius: 20px; padding: 10px 18px; background: #f6f7fb;"
      />

      <button
        type="submit"
        :disabled="!inputContent.trim() || sending"
        style="
          background: var(--brand);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        "
        :style="!inputContent.trim() || sending ? 'opacity: 0.5; cursor: not-allowed;' : 'box-shadow: 0 4px 12px rgba(123, 108, 246, 0.4);'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  slug: { type: String, required: true },
  communityName: { type: String, default: 'กลุ่มชุมชน' },
  communityIcon: { type: String, default: '💬' },
  communityBg: { type: String, default: '#eef2ff' },
})

const { user } = useAuth()
const messages = ref<any[]>([])
const inputContent = ref('')
const sending = ref(false)
const messagesBox = ref<HTMLElement | null>(null)

const { subscribe, publish } = useRealtime()
let unsubscribeRealtime: (() => void) | null = null

function isSelf(msg: any) {
  if (user.value && msg.sender_username === user.value.username) return true
  return msg.sender_username === 'panupong'
}

async function loadMessages() {
  try {
    const res = await $fetch<{ messages: any[] }>(`/api/communities/${props.slug}/messages`)
    if (res?.messages) {
      messages.value = res.messages
      scrollToBottom()
    }
  } catch (err) {
    console.error(err)
  }
}

async function sendMessage() {
  if (!inputContent.value.trim() || sending.value) return
  const text = inputContent.value.trim()
  inputContent.value = ''
  sending.value = true

  try {
    const res = await $fetch<{ success: boolean; message: any }>(`/api/communities/${props.slug}/messages`, {
      method: 'POST',
      body: { content: text },
    })

    if (res?.message) {
      if (!messages.value.some((m) => m.id === res.message.id)) {
        messages.value.push(res.message)
      }
      scrollToBottom()

      // Broadcast message to all connected clients
      publish('GROUP_CHAT_MESSAGE', { slug: props.slug, message: res.message })
    }
  } catch (err) {
    console.error(err)
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesBox.value) {
      messagesBox.value.scrollTop = messagesBox.value.scrollHeight
    }
  })
}

onMounted(() => {
  loadMessages()

  // Subscribe to real-time chat messages
  unsubscribeRealtime = subscribe((event) => {
    if (event.type === 'GROUP_CHAT_MESSAGE' && event.payload?.slug === props.slug) {
      const incomingMsg = event.payload.message
      if (!messages.value.some((m) => m.id === incomingMsg.id)) {
        messages.value.push(incomingMsg)
        scrollToBottom()
      }
    }
  })
})

onUnmounted(() => {
  if (unsubscribeRealtime) unsubscribeRealtime()
})
</script>
