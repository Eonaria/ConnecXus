/**
 * server/utils/realtime.ts
 * Server-side WebSocket event broadcaster
 * ใช้จาก API endpoints เพื่อ push events ไปยัง WebSocket clients
 */

export interface RealtimePacket {
  type: string
  payload: any
}

// Global Maps to track connections across Nitro server routes & endpoints
export const activePeers = new Map<string, any>()
export const peerRooms = new Map<string, Set<string>>()
export const onlineUsers = new Map<number, Set<string>>()

/**
 * Broadcast a realtime event to one or more WebSocket rooms
 * @param rooms - room name(s) to broadcast to (e.g. 'global', 'user-1', 'post-42')
 * @param packet - { type, payload } event packet
 */
export function broadcastToRoom(rooms: string | string[], packet: RealtimePacket): void {
  try {
    const roomList = Array.isArray(rooms) ? rooms : [rooms]
    const message = JSON.stringify(packet)
    const isGlobal = roomList.includes('global')

    for (const [peerId, peer] of activePeers.entries()) {
      try {
        const userRooms = peerRooms.get(peerId)
        const isSubscribed = isGlobal || (userRooms && roomList.some(r => userRooms.has(r)))
        
        if (isSubscribed) {
          peer.send(message)
        }
      } catch (err) {
        console.error(`[ws broadcast to peer ${peerId} failed]:`, err)
      }
    }
  } catch (err) {
    console.error('[broadcastToRoom error]', err)
  }
}

/** Broadcast to global room (all connected users) */
export function broadcastGlobal(packet: RealtimePacket): void {
  broadcastToRoom('global', packet)
}

/** Broadcast to a specific user's private room */
export function broadcastToUser(userId: number | string, packet: RealtimePacket): void {
  broadcastToRoom(`user-${userId}`, packet)
}

/** Broadcast to a specific conversation room */
export function broadcastToConversation(conversationId: number | string, packet: RealtimePacket): void {
  broadcastToRoom(`conversation-${conversationId}`, packet)
}

/** Broadcast to a specific post room (live comments/likes) */
export function broadcastToPost(postId: number | string, packet: RealtimePacket): void {
  broadcastToRoom(`post-${postId}`, packet)
}

/** Broadcast to admin channel */
export function broadcastToAdmins(packet: RealtimePacket): void {
  broadcastToRoom('admin-channel', packet)
}
