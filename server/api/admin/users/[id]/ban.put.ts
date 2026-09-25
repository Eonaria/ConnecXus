import type { ResultSetHeader  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const targetId = getRouterParam(event, 'id')

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID required' })
  }

  if (targetId === '1') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'ไม่สามารถระงับบัญชีผู้ก่อตั้งระบบได้' })
  }

  if (user.userId === Number(targetId)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'ไม่สามารถระงับบัญชีตัวเองได้' })
  }

  const body = await readBody(event)
  const db = getDb()

  if (typeof body.is_banned === 'number') {
    let suspendedUntil: Date | null = null
    let bannedAt: Date | null = null

    if (body.is_banned === 1) {
      bannedAt = new Date()
      if (body.ban_duration && body.ban_duration !== 'permanent') {
        suspendedUntil = new Date()
        if (body.ban_duration === '24h') suspendedUntil.setTime(suspendedUntil.getTime() + 24 * 60 * 60 * 1000)
        else if (body.ban_duration === '3d') suspendedUntil.setTime(suspendedUntil.getTime() + 3 * 24 * 60 * 60 * 1000)
        else if (body.ban_duration === '7d') suspendedUntil.setTime(suspendedUntil.getTime() + 7 * 24 * 60 * 60 * 1000)
        else if (body.ban_duration === '30d') suspendedUntil.setTime(suspendedUntil.getTime() + 30 * 24 * 60 * 60 * 1000)
      }
    }

    const reason = (body.is_banned === 1) ? (body.ban_reason || null) : null

    await db.query<ResultSetHeader>(
      `UPDATE users SET is_banned = ?, suspended_until = ?, ban_reason = ?, banned_at = ? WHERE id = ?`,
      [body.is_banned, suspendedUntil, reason, bannedAt, targetId]
    )

    // Fetch target user for log clarity
    const [targetRows] = await db.query<any[]>('SELECT username, display_name FROM users WHERE id = ?', [targetId])
    const targetUser = targetRows[0]
    const targetLabel = targetUser ? `@${targetUser.username}` : `#${targetId}`

    // Insert system log
    const action = body.is_banned ? 'ban_user' : 'unban_user'
    const details = body.is_banned 
      ? `ระงับบัญชี ${targetLabel} ระยะเวลา ${body.ban_duration || 'permanent'} (เหตุผล: ${reason || '-'})` 
      : `ปลดระงับบัญชี ${targetLabel}`
    
    await db.query(
      `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.userId, action, 'user', targetId, details]
    )

    if (body.is_banned === 1) {
      const banPayload = { 
        user_id: Number(targetId), 
        reason: reason || 'BANNED', 
        duration: body.ban_duration || 'permanent',
        banned_at: bannedAt ? bannedAt.toISOString() : null,
        suspended_until: suspendedUntil ? suspendedUntil.toISOString() : null 
      }

      // 1. Broadcast global ban event
      broadcastGlobal({ type: 'user_banned', payload: banPayload })

      // 2. Broadcast direct force logout to that user's channel
      broadcastToUser(targetId, { type: 'force_logout', payload: banPayload })

      // 3. Immediately notify and terminate any active websocket peers for this user
      const peerIds = onlineUsers.get(Number(targetId))
      if (peerIds) {
        for (const pid of peerIds) {
          const peer = activePeers.get(pid)
          if (peer) {
            try {
              peer.send(JSON.stringify({ type: 'force_logout', payload: banPayload }))
              peer.close()
            } catch {}
          }
        }
        onlineUsers.delete(Number(targetId))
      }

      broadcastToAdmins({ type: 'admin_stats_updated', payload: { action: 'ban', user_id: Number(targetId) } })
    } else {
      broadcastGlobal({ type: 'user_unbanned', payload: { user_id: Number(targetId) } })
    }
  }

  return { success: true }
})
