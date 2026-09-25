<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  communitySlug: {
    type: String,
    required: true
  }
})

const { user } = useAuth()
const { subscribe, publish } = useRealtime()
const conversationId = ref<number | null>(null)
const messages = ref<any[]>([])
const newMessage = ref('')
const loading = ref(true)
const error = ref('')
const chatContainer = ref<HTMLElement | null>(null)

let unsubscribe: (() => void) | null = null

const typingUsers = ref(new Map<number, string>()) // userId -> username
const partnerTypingNames = computed(() => [...typingUsers.value.values()])
let myTypingTimer: ReturnType<typeof setTimeout> | null = null

function handleTyping() {
  if (!conversationId.value) return
  publish('typing_start', { conversation_id: conversationId.value, user_id: user.value?.id, username: user.value?.username })
  if (myTypingTimer) clearTimeout(myTypingTimer)
  myTypingTimer = setTimeout(() => {
    publish('typing_stop', { conversation_id: conversationId.value, user_id: user.value?.id })
  }, 3000)
}

async function fetchConversation() {
  try {
    const res = await $fetch<{ conversation_id: number }>(`/api/communities/${props.communitySlug}/chat`)
    conversationId.value = res.conversation_id
    await fetchMessages()
    setupRealtime()
  } catch (err: any) {
    error.value = err.data?.message || 'ไม่สามารถเข้าร่วมห้องแชทได้ (คุณต้องเป็นสมาชิกกลุ่ม)'
  } finally {
    loading.value = false
  }
}

async function fetchMessages() {
  if (!conversationId.value) return
  const data = await $fetch<any[]>(`/api/messages/${conversationId.value}`)
  messages.value = data.map(m => ({
    ...m,
    is_mine: m.sender_id === user.value?.id
  }))
  scrollToBottom()
}

function setupRealtime() {
  unsubscribe = subscribe((event: any) => {
    const data = { type: event.type, ...event.payload }
    if (data.type === 'chat' && data.message.conversation_id === conversationId.value) {
      const msg = data.message
      if (!messages.value.find(m => m.id === msg.id)) {
        messages.value.push({
          ...msg,
          is_mine: msg.sender_id === user.value?.id
        })
        scrollToBottom()
      }
    }
    
    if (data.type === 'typing_start' && data.conversation_id === conversationId.value && data.user_id !== user.value?.id) {
      typingUsers.value.set(data.user_id, data.username || 'ผู้ใช้')
      typingUsers.value = new Map(typingUsers.value)
      setTimeout(() => {
        typingUsers.value.delete(data.user_id)
        typingUsers.value = new Map(typingUsers.value)
      }, 4000)
    }
    if (data.type === 'typing_stop' && data.conversation_id === conversationId.value) {
      typingUsers.value.delete(data.user_id)
      typingUsers.value = new Map(typingUsers.value)
    }
  })
}

async function sendMessage() {
  if (!newMessage.value.trim() || !conversationId.value) return
  
  const content = newMessage.value.trim()
  newMessage.value = ''
  
  try {
    await $fetch('/api/messages', {
      method: 'POST',
      body: {
        conversation_id: conversationId.value,
        content
      }
    })
  } catch (e) {
    console.error('Send error:', e)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function formatTimeShort(dateString: string) {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchConversation()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <div class="community-chat-container">
    <div v-if="loading" style="padding: 24px; text-align: center; color: var(--text-muted);">กำลังโหลดห้องแชท...</div>
    <div v-else-if="error" style="padding: 24px; text-align: center; color: #ef4444;">{{ error }}</div>
    <div v-else class="chat-wrapper">
      <div class="chat-header">
        <h3 style="margin: 0; font-size: 16px;">พูดคุยแบบเรียลไทม์ (Community Chat)</h3>
      </div>
      
      <div class="chat-messages" ref="chatContainer">
        <div v-for="msg in messages" :key="msg.id" :class="['message-row', msg.is_mine ? 'mine' : 'theirs']">
          <div v-if="!msg.is_mine" class="avatar-wrap">
            <img v-if="msg.sender?.avatar_url" :src="msg.sender.avatar_url" class="avatar" />
            <div v-else class="avatar fallback">{{ msg.sender?.display_name?.charAt(0) || msg.sender?.username?.charAt(0) || '?' }}</div>
          </div>
          
          <div class="message-content-wrap">
            <div v-if="!msg.is_mine" class="sender-name">{{ msg.sender?.display_name || msg.sender?.username }}</div>
            <div class="message-bubble" :class="{ mine: msg.is_mine }">
              {{ msg.content }}
            </div>
            <div class="time">{{ formatTimeShort(msg.created_at) }}</div>
          </div>
        </div>
        
        <div v-if="messages.length === 0" style="text-align: center; color: var(--text-muted); margin-top: 40px; font-size: 14px;">
          ยังไม่มีข้อความ... เริ่มต้นทักทายทุกคนในกลุ่มได้เลย!
        </div>
      </div>
      
      <div v-if="partnerTypingNames.length > 0" style="padding: 4px 20px; font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
        <span>{{ partnerTypingNames.join(', ') }} กำลังพิมพ์...</span>
        <span style="display: inline-flex; gap: 2px;">
          <span v-for="i in 3" :key="i" style="width: 4px; height: 4px; border-radius: 50%; background: var(--text-muted); animation: typing-dot 1s infinite;" :style="{ animationDelay: (i-1)*0.2 + 's' }"></span>
        </span>
      </div>
      
      <div class="chat-input-area">
        <input 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          @input="handleTyping"
          type="text" 
          placeholder="พิมพ์ข้อความที่นี่..." 
          class="chat-input"
        />
        <button @click="sendMessage" class="send-btn" :disabled="!newMessage.trim()">ส่ง</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.community-chat-container {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  height: 600px;
  display: flex;
  flex-direction: column;
}
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-surface);
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.message-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.message-row.mine {
  flex-direction: row-reverse;
}
.avatar-wrap .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-wrap .fallback {
  background: var(--brand);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.message-content-wrap {
  max-width: 75%;
  display: flex;
  flex-direction: column;
}
.mine .message-content-wrap {
  align-items: flex-end;
}
.theirs .message-content-wrap {
  align-items: flex-start;
}
.sender-name {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  margin-left: 4px;
}
.message-bubble {
  padding: 12px 16px;
  border-radius: 4px 16px 16px 16px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}
.message-bubble.mine {
  border-radius: 16px 4px 16px 16px;
  background: linear-gradient(135deg, rgba(123, 108, 246, 0.9), rgba(99, 102, 241, 0.9));
  color: white;
}
.time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  margin-left: 4px;
}
.mine .time {
  margin-left: 0;
  margin-right: 4px;
}
.chat-input-area {
  padding: 16px;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-surface);
  display: flex;
  gap: 12px;
}
.chat-input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus {
  border-color: var(--brand);
}
.send-btn {
  background: var(--brand);
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.send-btn:not(:disabled):hover {
  opacity: 0.9;
}

@keyframes typing-dot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}
</style>
