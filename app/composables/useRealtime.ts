/**
 * composables/useRealtime.ts
 * Enhanced Real-time system with:
 * - Exponential backoff reconnect
 * - Heartbeat/ping-pong
 * - Room management with re-subscribe on reconnect
 * - User identification
 * - Cross-tab BroadcastChannel sync
 */

type RealtimeCallback = (data: { type: string; payload: any }) => void

const listeners = new Set<RealtimeCallback>()
const activeRooms = new Set<string>()
let ws: WebSocket | null = null
let channel: BroadcastChannel | null = null
let reconnectAttempt = 0
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let isIntentionallyClosed = false

function getReconnectDelay(): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  return Math.min(1000 * Math.pow(2, reconnectAttempt), 30000)
}

function startHeartbeat() {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
    }
  }, 25000)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function notifyListeners(data: { type: string; payload: any }) {
  for (const cb of listeners) {
    try { cb(data) } catch {}
  }
}

function resubscribeAll() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  for (const room of activeRooms) {
    ws.send(JSON.stringify({ type: 'subscribe', room }))
  }
}

let authCache: { id: number, username: string, role: string } | null = null

export const useRealtime = () => {
  // Update authCache every time useRealtime is called (during component setup)
  try {
    const { user } = useAuth()
    if (user.value) {
      authCache = { id: user.value.id, username: user.value.username, role: user.value.role }
    }
  } catch {}

  function init() {
    if (import.meta.server) return
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return

    // 1. Cross-tab BroadcastChannel
    if (!channel && typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('connecxus_realtime')
      channel.onmessage = (event) => {
        if (event.data?.type) notifyListeners(event.data)
      }
    }

    // 2. WebSocket Connection
    isIntentionallyClosed = false
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/_ws`
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        reconnectAttempt = 0
        console.log('[realtime] WebSocket connected')

        // Always join global room
        activeRooms.add('global')

        // Identify user
        try {
          if (authCache?.id) {
            activeRooms.add(`user-${authCache.id}`)
            ws?.send(JSON.stringify({
              type: 'identify',
              payload: {
                user_id: authCache.id,
                username: authCache.username,
                role: authCache.role
              }
            }))
          }
        } catch (err) {
          console.error('[realtime] Identify error:', err)
        }

        resubscribeAll()
        startHeartbeat()
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)
          if (!parsed?.type) return
          // Ignore pong
          if (parsed.type === 'pong') return

          // Instant Real-time Kickout for Banned User
          if (parsed.type === 'force_logout' || parsed.type === 'user_banned') {
            const bannedUserId = parsed.payload?.user_id || parsed.payload?.target_id
            const currentUserId = authCache?.id

            if (currentUserId && (!bannedUserId || Number(bannedUserId) === Number(currentUserId))) {
              console.warn('[REALTIME] Account suspended. Triggering instant force logout...')
              try {
                $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
              } catch {}
              try {
                const { user } = useAuth()
                user.value = null
              } catch {}
              window.location.href = '/login?banned=true'
              return
            }
          }

          notifyListeners(parsed)
          // Also broadcast to other tabs
          if (channel) channel.postMessage(parsed)
        } catch {}
      }

      ws.onerror = () => {
        // Will be handled by onclose
      }

      ws.onclose = () => {
        ws = null
        stopHeartbeat()
        if (!isIntentionallyClosed) {
          const delay = getReconnectDelay()
          reconnectAttempt++
          console.log(`[realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttempt})`)
          reconnectTimer = setTimeout(init, delay)
        }
      }
    } catch {
      ws = null
    }
  }

  function subscribe(cb: RealtimeCallback) {
    listeners.add(cb)
    init()
    return () => listeners.delete(cb)
  }

  function publish(type: string, payload: any) {
    const packet = { type, payload }
    notifyListeners(packet)
    if (channel) channel.postMessage(packet)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(packet))
    }
  }

  function joinRoom(room: string) {
    activeRooms.add(room)
    init()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', room }))
    }
  }

  function identify(userData: { id: number; username: string; role?: string }) {
    authCache = { id: userData.id, username: userData.username, role: userData.role || 'user' }
    activeRooms.add(`user-${userData.id}`)
    init()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'identify',
        payload: {
          user_id: userData.id,
          username: userData.username,
          role: userData.role || 'user'
        }
      }))
      ws.send(JSON.stringify({ type: 'subscribe', room: `user-${userData.id}` }))
    }
  }

  function leaveRoom(room: string) {
    activeRooms.delete(room)
  }

  function disconnect() {
    isIntentionallyClosed = true
    stopHeartbeat()
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    if (ws) { ws.close(); ws = null }
  }

  return { subscribe, publish, joinRoom, leaveRoom, disconnect, init, identify }
}
