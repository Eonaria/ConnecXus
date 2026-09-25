export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const communityId = getRouterParam(event, 'id')

  if (!communityId) {
    throw createError({ statusCode: 400, message: 'Community ID is required' })
  }

  const db = getDb()

  try {
    // 1. Fetch community details for logging
    const [cRows] = await db.query<any[]>('SELECT id, name, slug FROM communities WHERE id = ? LIMIT 1', [communityId])
    const comm = cRows[0]
    if (!comm) {
      throw createError({ statusCode: 404, message: 'ไม่พบชุมชนนี้ในระบบ' })
    }

    // 2. Cascade delete community data cleanly
    // A. Post interactions for community posts
    await db.query('DELETE FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)', [communityId])
    await db.query('DELETE FROM post_bookmarks WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)', [communityId])
    await db.query('DELETE FROM comments WHERE post_id IN (SELECT id FROM posts WHERE community_id = ?)', [communityId])
    
    // B. Posts in community
    await db.query('DELETE FROM posts WHERE community_id = ?', [communityId])
    
    // C. Community members & invites
    await db.query('DELETE FROM community_members WHERE community_id = ?', [communityId])
    try {
      await db.query('DELETE FROM community_invites WHERE community_id = ?', [communityId])
    } catch {}

    // D. Reports targeting this community
    try {
      await db.query('DELETE FROM reports WHERE (target_type = "community" AND target_id = ?) OR reported_community_id = ?', [communityId, communityId])
    } catch {}

    // E. Finally, delete community record
    await db.query('DELETE FROM communities WHERE id = ?', [communityId])

    // 3. System logging
    await db.query(
      `INSERT INTO system_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.userId, 'delete_community', 'community', communityId, `แอดมินลบชุมชน "${comm.name}" (/community/${comm.slug}) ถาวร`]
    )

    // 4. Realtime Broadcast
    broadcastGlobal({
      type: 'community_deleted',
      payload: { community_id: Number(communityId), community_slug: comm.slug }
    })

    broadcastToAdmins({
      type: 'admin_stats_updated',
      payload: { action: 'delete_community', community_id: Number(communityId) }
    })

    return { success: true, message: `ลบชุมชน "${comm.name}" เรียบร้อยแล้ว` }
  } catch (err: any) {
    console.error('[DELETE COMMUNITY ERROR]:', err)
    throw createError({ statusCode: err.statusCode || 500, message: err.message || 'ไม่สามารถลบชุมชนได้' })
  }
})
