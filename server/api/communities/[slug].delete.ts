/**
 * DELETE /api/communities/:slug
 * Allows only the community creator (owner) or system admin to delete the community
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug ชุมชนไม่ถูกต้อง' })
  }

  const db = getDb()

  try {
    // 1. Fetch community to check ownership
    const [commRows] = await db.query(
      'SELECT id, name, slug, owner_id FROM communities WHERE slug = ? LIMIT 1',
      [slug]
    )
    const community = (commRows as any[])[0]

    if (!community) {
      throw createError({ statusCode: 404, message: 'ไม่พบชุมชนนี้ในระบบ' })
    }

    // 2. Permission check: Only the owner (or system admin) can delete the community
    const currentUserId = user.userId || user.id
    const isOwner = Number(community.owner_id) === Number(currentUserId)
    const isAdmin = user.role === 'admin'

    if (!isOwner && !isAdmin) {
      throw createError({
        statusCode: 403,
        message: 'เฉพาะผู้สร้างกลุ่ม (Owner) เท่านั้นที่มีสิทธิ์ลบชุมชนนี้'
      })
    }

    const communityId = community.id

    // 3. Cleanly delete all dependent records
    // a. Reports
    await db.query(
      `DELETE FROM reports 
       WHERE community_id = ? 
          OR reported_community_id = ? 
          OR reported_post_id IN (SELECT id FROM posts WHERE community_id = ?)
          OR reported_comment_id IN (
            SELECT id FROM comments WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)
          )`,
      [communityId, communityId, communityId, communityId]
    )

    // b. Post Likes & Bookmarks
    await db.query(
      'DELETE FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)',
      [communityId]
    )
    await db.query(
      'DELETE FROM post_bookmarks WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)',
      [communityId]
    )

    // c. Comments
    await db.query(
      'DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)',
      [communityId]
    )

    // d. Posts
    await db.query('DELETE FROM posts WHERE community_id = ?', [communityId])

    // e. Community Members & Requests
    await db.query('DELETE FROM community_members WHERE community_id = ?', [communityId])

    // f. Group Chat / Conversations linked to this community
    const [convRows] = await db.query(
      'SELECT id FROM conversations WHERE community_id = ?',
      [communityId]
    )
    const convs = convRows as any[]
    if (convs.length > 0) {
      const convIds = convs.map(c => c.id)
      const placeholders = convIds.map(() => '?').join(',')
      await db.query(`DELETE FROM messages WHERE conversation_id IN (${placeholders})`, convIds)
      await db.query(`DELETE FROM conversation_participants WHERE conversation_id IN (${placeholders})`, convIds)
      await db.query(`DELETE FROM conversations WHERE id IN (${placeholders})`, convIds)
    }

    // g. Finally, delete the community record itself
    await db.query('DELETE FROM communities WHERE id = ?', [communityId])

    // Log the deletion action
    await db.query(
      `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [currentUserId, 'delete_community', 'community', communityId, `ลบชุมชน "${community.name}" (${slug}) โดยผู้สร้างกลุ่ม`]
    )

    // Broadcast realtime event
    broadcastToAdmins({ type: 'admin_community_updated', payload: { communityId } })
    broadcastToAdmins({ type: 'admin_log_created', payload: {} })
    broadcastGlobal({ type: 'community_deleted', payload: { slug, communityId } })

    return {
      success: true,
      message: `ลบชุมชน "${community.name}" เรียบร้อยแล้ว`
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[DELETE COMMUNITY ERROR]:', err)
    throw createError({
      statusCode: 500,
      message: err.message || 'เกิดข้อผิดพลาดในการลบชุมชน'
    })
  }
})
