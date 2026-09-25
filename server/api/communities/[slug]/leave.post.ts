/**
 * POST /api/communities/:slug/leave
 * Leave community in MySQL database
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  const userId = user.userId

  try {
    const db = getDb()
    const [cRows] = await db.query('SELECT id, owner_id FROM communities WHERE slug = ? LIMIT 1', [slug])
    const community = (cRows as any[])[0]

    if (!community) {
      throw createError({ statusCode: 404, message: 'ไม่พบชุมชนนี้' })
    }

    if (community.owner_id === userId) {
      throw createError({ statusCode: 400, message: 'ผู้สร้างกลุ่มไม่สามารถออกจากกลุ่มของตัวเองได้' })
    }

    await db.query(
      'DELETE FROM community_members WHERE community_id = ? AND user_id = ?',
      [community.id, userId]
    )

    const [countRows] = await db.query(
      'SELECT COUNT(*) as count FROM community_members WHERE community_id = ? AND status = "active"',
      [community.id]
    )
    const memberCount = (countRows as any[])[0]?.count || 0

    broadcastToRoom(`community-${slug}`, {
      type: 'community_member_left',
      payload: {
        community_id: community.id,
        community_slug: slug,
        user_id: userId,
        member_count: memberCount
      }
    })
    broadcastGlobal({
      type: 'community_member_left',
      payload: {
        community_id: community.id,
        community_slug: slug,
        member_count: memberCount
      }
    })

    return { success: true, is_joined: false, is_pending: false, message: 'ออกจากกลุ่มเรียบร้อยแล้ว' }
  } catch (e: any) {
    if (e.statusCode) throw e
    throw createError({ statusCode: 500, message: e.message || 'เกิดข้อผิดพลาดในการออกจากกลุ่ม' })
  }
})
