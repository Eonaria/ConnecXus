/**
 * POST /api/communities/:slug/join
 * Save community member joining event into MySQL `community_members` table
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  const userId = user.userId

  await ensureCommunitiesSeeded()

  try {
    const db = getDb()

    // 1. Find community ID by slug
    let [cRows] = await db.query('SELECT id, name, is_private, is_hidden, owner_id FROM communities WHERE slug = ? LIMIT 1', [slug])
    let community = (cRows as any[])[0]

    if (!community) {
      throw createError({ statusCode: 404, message: 'ไม่พบชุมชนนี้' })
    }

    const isOwner = userId === community.owner_id

    // If community is hidden, joining is only allowed via invite link
    if (community.is_hidden && !isOwner) {
      throw createError({
        statusCode: 403,
        message: 'ชุมชนนี้ถูกซ่อนอยู่ คุณสามารถเข้าร่วมได้ผ่านลิงก์เชิญ (Invite Link) เท่านั้น'
      })
    }

    // 2. Check if user is already in community_members table
    const [mRows] = await db.query(
      'SELECT id, status, role FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1',
      [community.id, userId]
    )
    const member = (mRows as any[])[0]

    // If community is private and user is not the owner, requires approval
    const newStatus = (community.is_private && !isOwner) ? 'pending' : 'active'
    const newRole = isOwner ? 'owner' : (member?.role || 'member')

    if (!member) {
      // Insert new member record
      await db.query(
        'INSERT INTO community_members (community_id, user_id, role, status, joined_at) VALUES (?, ?, ?, ?, NOW())',
        [community.id, userId, newRole, newStatus]
      )
    } else {
      // Update status
      await db.query(
        'UPDATE community_members SET status = ?, joined_at = NOW() WHERE id = ?',
        [newStatus, member.id]
      )
    }

    // Notify community owner if not self
    if (community.owner_id && community.owner_id !== userId) {
      try {
        const notifType = newStatus === 'pending' ? 'community_request' : 'community_join'
        await db.query(
          `INSERT INTO notifications (user_id, sender_id, type, community_slug, community_name) VALUES (?, ?, ?, ?, ?)`,
          [community.owner_id, userId, notifType, slug, community.name]
        )
        broadcastToUser(community.owner_id, {
          type: 'notification_update',
          payload: {
            action: notifType,
            community_slug: slug,
            community_name: community.name,
            source_username: user.username,
            target_user_id: community.owner_id
          }
        })
      } catch (err) {
        console.error('Failed to insert community notification', err)
      }
    }

    // Broadcast Realtime Event
    if (newStatus === 'pending') {
      broadcastToRoom(`community-${slug}`, {
        type: 'community_member_request',
        payload: {
          community_id: community.id,
          community_slug: slug,
          user_id: userId,
          display_name: user.display_name || user.username
        }
      })
      broadcastGlobal({
        type: 'community_member_request',
        payload: {
          community_id: community.id,
          community_slug: slug,
          user_id: userId
        }
      })
    } else {
      const [countRows] = await db.query(
        'SELECT COUNT(*) as count FROM community_members WHERE community_id = ? AND status = "active"',
        [community.id]
      )
      const memberCount = (countRows as any[])[0]?.count || 1

      broadcastToRoom(`community-${slug}`, {
        type: 'community_member_joined',
        payload: {
          community_id: community.id,
          community_slug: slug,
          user_id: userId,
          member_count: memberCount
        }
      })
      broadcastGlobal({
        type: 'community_member_joined',
        payload: {
          community_id: community.id,
          community_slug: slug,
          member_count: memberCount
        }
      })
    }

    let message = 'เข้าร่วมกลุ่มเรียบร้อยแล้ว'
    if (newStatus === 'pending') {
      message = 'ส่งคำขอเข้าร่วมกลุ่มแล้ว กรุณารอผู้ดูแลอนุมัติ'
    }

    return { 
      success: true, 
      is_joined: newStatus === 'active', 
      is_pending: newStatus === 'pending',
      user_status: newStatus,
      message 
    }
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 500, message: e.message || 'เกิดข้อผิดพลาดในการเข้าร่วมกลุ่ม' })
  }
})
