/**
 * server/utils/banManager.ts
 * Automatic Ban & Suspension Expiration Management
 */
import { getDb } from './db'
import { broadcastGlobal, broadcastToAdmins } from './realtime'

export interface BanCheckResult {
  isBanned: boolean
  banType?: 'permanent' | 'suspended'
  reason?: string
  bannedAt?: string | null
  suspendedUntil?: string | null
}

/**
 * Scan database and automatically unban any accounts or communities whose suspension has expired
 */
export async function cleanExpiredBans(): Promise<number> {
  try {
    const db = getDb()

    // 1. Unban expired users
    const [expiredUsers] = await db.query<any[]>(
      `SELECT id, username, display_name, suspended_until
       FROM users
       WHERE is_banned = 1 AND suspended_until IS NOT NULL AND suspended_until <= NOW()`
    )

    if (expiredUsers && expiredUsers.length > 0) {
      for (const u of expiredUsers) {
        await db.query(
          `UPDATE users
           SET is_banned = 0, suspended_until = NULL, ban_reason = NULL, banned_at = NULL
           WHERE id = ?`,
          [u.id]
        )

        // Log system auto-unban
        try {
          await db.query(
            `INSERT INTO system_logs (admin_id, action, target_type, target_id, details)
             VALUES (1, 'unban_user', 'user', ?, ?)`,
            [u.id, `ระบบปลดระงับอัตโนมัติเนื่องจากครบกำหนดระยะเวลา (@${u.username})`]
          )
        } catch {}

        // Broadcast real-time unban event
        broadcastGlobal({
          type: 'user_unbanned',
          payload: { user_id: u.id, username: u.username, reason: 'EXPIRED' }
        })
      }

      broadcastToAdmins({
        type: 'admin_stats_updated',
        payload: { action: 'auto_unban_users', count: expiredUsers.length }
      })
    }

    // 2. Unsuspend expired communities
    const [expiredCommunities] = await db.query<any[]>(
      `SELECT id, name, slug
       FROM communities
       WHERE is_suspended = 1 AND suspended_until IS NOT NULL AND suspended_until <= NOW()`
    )

    if (expiredCommunities && expiredCommunities.length > 0) {
      for (const c of expiredCommunities) {
        await db.query(
          `UPDATE communities
           SET is_suspended = 0, suspended_until = NULL, suspend_reason = NULL
           WHERE id = ?`,
          [c.id]
        )

        try {
          await db.query(
            `INSERT INTO system_logs (admin_id, action, target_type, target_id, details)
             VALUES (1, 'unsuspend_community', 'community', ?, ?)`,
            [c.id, `ระบบปลดระงับชุมชนอัตโนมัติเนื่องจากครบกำหนดระยะเวลา (${c.name})`]
          )
        } catch {}

        broadcastGlobal({
          type: 'community_updated',
          payload: { community_id: c.id, community_slug: c.slug, is_suspended: 0 }
        })
      }

      broadcastToAdmins({
        type: 'admin_stats_updated',
        payload: { action: 'auto_unsuspend_communities', count: expiredCommunities.length }
      })
    }

    return (expiredUsers?.length || 0) + (expiredCommunities?.length || 0)
  } catch (err) {
    console.error('[cleanExpiredBans error FULL]:', err)
    return 0
  }
}

/**
 * Check and resolve ban status for a specific user ID
 * If the user's suspension expired, automatically unbans them and returns isBanned = false
 */
export async function checkAndResolveUserBan(userId: number | string): Promise<BanCheckResult> {
  try {
    const db = getDb()
    const [rows] = await db.query<any[]>(
      `SELECT id, username, is_banned, suspended_until, ban_reason, banned_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    )

    const user = rows[0]
    if (!user || !user.is_banned) {
      return { isBanned: false }
    }

    // Check if temporary suspension expired
    if (user.suspended_until && new Date(user.suspended_until) <= new Date()) {
      await db.query(
        `UPDATE users
         SET is_banned = 0, suspended_until = NULL, ban_reason = NULL, banned_at = NULL
         WHERE id = ?`,
        [user.id]
      )

      try {
        await db.query(
          `INSERT INTO system_logs (admin_id, action, target_type, target_id, details)
           VALUES (1, 'unban_user', 'user', ?, ?)`,
          [user.id, `ระบบปลดระงับอัตโนมัติเมื่อเข้าใช้งานเนื่องจากครบกำหนด (@${user.username})`]
        )
      } catch {}

      broadcastGlobal({
        type: 'user_unbanned',
        payload: { user_id: user.id, username: user.username, reason: 'EXPIRED' }
      })

      return { isBanned: false }
    }

    const isPermanent = !user.suspended_until || new Date(user.suspended_until) > new Date('2099-01-01')
    return {
      isBanned: true,
      banType: isPermanent ? 'permanent' : 'suspended',
      reason: user.ban_reason || 'ละเมิดข้อกำหนดการใช้งานชุมชน',
      bannedAt: user.banned_at ? new Date(user.banned_at).toISOString() : null,
      suspendedUntil: user.suspended_until ? new Date(user.suspended_until).toISOString() : null
    }
  } catch (err) {
    console.error('[checkAndResolveUserBan error]:', err)
    return { isBanned: false }
  }
}
