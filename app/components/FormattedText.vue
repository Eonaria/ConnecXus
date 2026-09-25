<template>
  <span class="formatted-text-root">
    <template v-for="(token, index) in tokens" :key="index">
      <!-- Hashtag -->
      <span
        v-if="token.type === 'hashtag'"
        class="cx-hashtag"
        @click.stop="handleHashtagClick(token.value)"
        :title="`ค้นหาโพสต์เกี่ยวกับ ${token.value}`"
      >{{ token.value }}</span>

      <!-- Mention -->
      <span
        v-else-if="token.type === 'mention'"
        class="cx-mention"
        @click.stop="handleMentionClick(token.username)"
        :title="`ดูโปรไฟล์ @${token.username}`"
      >{{ token.value }}</span>

      <!-- URL Link -->
      <a
        v-else-if="token.type === 'link'"
        :href="token.value"
        target="_blank"
        rel="noopener noreferrer"
        class="cx-link"
        @click.stop
      >{{ token.value }}</a>

      <!-- Plain Text -->
      <span v-else>{{ token.value }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

interface Token {
  type: 'text' | 'hashtag' | 'mention' | 'link'
  value: string
  username?: string
}

const tokens = computed<Token[]>(() => {
  if (!props.text) return []

  // Regex pattern matching hashtags (Thai, English, numbers, underscore), mentions (@username), and URLs
  const pattern = /(https?:\/\/[^\s]+)|(#[a-zA-Z0-9_\u0E00-\u0E7F]+)|(@[a-zA-Z0-9_]{3,30})/gu
  const result: Token[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(props.text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        value: props.text.slice(lastIndex, match.index)
      })
    }

    const matchedText = match[0]
    if (matchedText.startsWith('http://') || matchedText.startsWith('https://')) {
      result.push({
        type: 'link',
        value: matchedText
      })
    } else if (matchedText.startsWith('#')) {
      result.push({
        type: 'hashtag',
        value: matchedText
      })
    } else if (matchedText.startsWith('@')) {
      result.push({
        type: 'mention',
        value: matchedText,
        username: matchedText.slice(1)
      })
    }

    lastIndex = pattern.lastIndex
  }

  // Push remaining plain text
  if (lastIndex < props.text.length) {
    result.push({
      type: 'text',
      value: props.text.slice(lastIndex)
    })
  }

  return result
})

function handleHashtagClick(hashtag: string) {
  navigateTo(`/?q=${encodeURIComponent(hashtag)}`)
}

function handleMentionClick(username?: string) {
  if (username) {
    navigateTo(`/profile/${username}`)
  }
}
</script>

<style scoped>
.formatted-text-root {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: inherit;
}

.cx-hashtag {
  color: #818cf8;
  font-weight: 700;
  cursor: pointer;
  display: inline-block;
  padding: 0 3px;
  border-radius: 4px;
  background: rgba(99, 102, 241, 0.08);
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.cx-hashtag:hover {
  color: #c084fc;
  background: rgba(168, 85, 247, 0.18);
  transform: translateY(-1px);
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}

.cx-mention {
  color: #38bdf8;
  font-weight: 700;
  cursor: pointer;
  display: inline-block;
  padding: 0 2px;
  border-radius: 4px;
  transition: all 0.18s ease;
  text-decoration: none;
}

.cx-mention:hover {
  color: #7dd3fc;
  text-decoration: underline;
  background: rgba(56, 189, 248, 0.12);
}

.cx-link {
  color: #60a5fa;
  text-decoration: underline;
  word-break: break-all;
  transition: color 0.15s;
}

.cx-link:hover {
  color: #93c5fd;
}
</style>
