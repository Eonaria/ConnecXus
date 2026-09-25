/**
 * server/routes/_ws.ts
 * Enhanced WebSocket Gateway with:
 * - Per-peer room subscription tracking
 * - Presence tracking (online users)
 * - Heartbeat/ping-pong
 * - Ban check on connect
 * - Admin channel support
 * - Server-side broadcast hook
 */



function safeSend(peer: any, msg: string) {
  try {
    if (!peer) return
    const res = peer.send(msg)
    if (res && typeof res.catch === 'function') {
      res.catch(() => {})
    }
  } catch {}
}

function safePublish(peer: any, room: string, msg: string) {
  try {
    if (!peer) return
    const res = peer.publish(room, msg)
    if (res && typeof res.catch === 'function') {
      res.catch(() => {})
    }
  } catch {}
}

function addPeerToRoom(peerId: string, room: string, peer: any) {
  if (!peerRooms.has(peerId)) peerRooms.set(peerId, new Set())
  const rooms = peerRooms.get(peerId)!
  if (!rooms.has(room)) {
    rooms.add(room)
    try {
      const res = peer.subscribe(room)
      if (res && typeof res.catch === 'function') {
        res.catch(() => {})
      }
    } catch {}
  }
}

function removePeerFromAll(peerId: string) {
  peerRooms.delete(peerId)
  activePeers.delete(peerId)
}

export default defineWebSocketHandler({
  open(peer) {
    console.log('[ws] Peer connected:', peer.id)
    activePeers.set(peer.id, peer)
    peerRooms.set(peer.id, new Set())
    // Always join global room
    addPeerToRoom(peer.id, 'global', peer)
    const countPayload = JSON.stringify({ type: 'online_count_updated', payload: { count: onlineUsers.size } })
    safeSend(peer, countPayload)
  },

  async message(peer, message) {
    let data: any
    try {
      data = JSON.parse(message.text())
    } catch {
      return
    }

    const type = data.type
    const payload = data.payload || data

    // ── Heartbeat ──────────────────────────────────────────
    if (type === 'ping') {
      safeSend(peer, JSON.stringify({ type: 'pong', timestamp: Date.now() }))
      return
    }

    // ── Room Subscription ──────────────────────────────────
    if (type === 'subscribe') {
      if (data.room) addPeerToRoom(peer.id, data.room, peer)
      if (data.conversation_id) addPeerToRoom(peer.id, `conversation-${data.conversation_id}`, peer)
      if (data.user_id) addPeerToRoom(peer.id, `user-${data.user_id}`, peer)
      if (data.global) addPeerToRoom(peer.id, 'global', peer)
      return
    }

    // ── Presence: User Identify ────────────────────────────
    if (type === 'identify') {
      const userId = payload.user_id
      if (userId) {
        // Check ban status (auto-unbans if expired)
        try {
          const banStatus = await checkAndResolveUserBan(userId)
          if (banStatus.isBanned) {
            safeSend(peer, JSON.stringify({ type: 'error', code: 'BANNED', message: 'บัญชีของคุณถูกระงับ' }))
            try { peer.close() } catch {}
            return
          }
        } catch {}

        // Track online user
        const isFirstConnection = !onlineUsers.has(userId)
        if (isFirstConnection) onlineUsers.set(userId, new Set())
        onlineUsers.get(userId)!.add(peer.id)

        // Auto-join user room
        addPeerToRoom(peer.id, `user-${userId}`, peer)

        // If admin, join admin channel
        if (payload.role === 'admin') {
          addPeerToRoom(peer.id, 'admin-channel', peer)
        }

        // Broadcast presence to global ONLY if it's their first connection
        if (isFirstConnection) {
          safePublish(peer, 'global', JSON.stringify({
            type: 'user_online',
            payload: { user_id: userId, username: payload.username }
          }))
          // Send updated count to everyone
          const countPayload = JSON.stringify({ type: 'online_count_updated', payload: { count: onlineUsers.size } })
          safePublish(peer, 'global', countPayload)
          safeSend(peer, countPayload)
        }
      }
      return
    }

    // ── Ban Check for All Broadcasts ──────────────────────
    const senderId = payload.sender_id || payload.user_id
    if (senderId) {
      try {
        const db = getDb()
        const [rows] = await db.query('SELECT is_banned FROM users WHERE id = ?', [senderId])
        if ((rows as any[])[0]?.is_banned) {
          safeSend(peer, JSON.stringify({ type: 'error', code: 'BANNED', message: 'Account Suspended' }))
          try { peer.close() } catch {}
          return
        }
      } catch {}
    }

    // ── Chat Messages ──────────────────────────────────────
    if (['chat', 'edit_message', 'unsend', 'pin', 'update_settings', 'read', 'typing_start', 'typing_stop'].includes(type) && payload.conversation_id) {
      safePublish(peer, `conversation-${payload.conversation_id}`, message.text())
    }

    // ── Post Room Events ───────────────────────────────────
    if (['new_comment', 'comment_deleted', 'like_post', 'repost', 'unrepost'].includes(type) && payload.post_id) {
      safePublish(peer, `post-${payload.post_id}`, message.text())
    }

    // ── Social / Global Events ─────────────────────────────
    if (['new_post', 'post_deleted', 'post_updated', 'user_banned', 'trends_updated'].includes(type)) {
      safePublish(peer, 'global', message.text())
    }

    // ── User-targeted Notifications ────────────────────────
    if (['like_post', 'new_follower', 'new_comment', 'repost', 'notification_update', 'notification_received'].includes(type) && payload.target_user_id) {
      safePublish(peer, `user-${payload.target_user_id}`, message.text())
    }

    // ── Also push social events to global for feed updates ─
    if (['like_post', 'new_comment', 'comment_deleted', 'repost', 'unrepost', 'new_follower', 'unfollow', 'notification_update', 'notification_received'].includes(type)) {
      safePublish(peer, 'global', message.text())
    }

    // ── Community Events ───────────────────────────────────
    if (['community_member_joined', 'community_member_left', 'community_updated'].includes(type) && payload.community_slug) {
      safePublish(peer, `community-${payload.community_slug}`, message.text())
      safePublish(peer, 'global', message.text())
    }

    // ── Admin Channel Events ───────────────────────────────
    if (['new_report', 'report_resolved', 'admin_stats_updated'].includes(type)) {
      safePublish(peer, 'admin-channel', message.text())
    }
  },

  close(peer) {
    console.log('[ws] Peer disconnected:', peer.id)
    // Find which user this peer belonged to and clean up presence
    for (const [userId, peerSet] of onlineUsers.entries()) {
      if (peerSet.has(peer.id)) {
        peerSet.delete(peer.id)
        if (peerSet.size === 0) {
          onlineUsers.delete(userId)
          // Broadcast offline to global
          try {
            safePublish(peer, 'global', JSON.stringify({
              type: 'user_offline',
              payload: { user_id: userId }
            }))
          } catch {}
        }
        break
      }
    }
    removePeerFromAll(peer.id)
    try {
      safePublish(peer, 'global', JSON.stringify({ type: 'online_count_updated', payload: { count: onlineUsers.size } }))
    } catch {}
  },

  error(peer, error) {
    console.warn('[ws] Peer error:', peer.id, (error as any)?.message || error)
  }
})
