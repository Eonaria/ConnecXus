import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const slug = getRouterParam(event, 'slug')
  const db = getDb()

  // Get community
  const [cRows] = await db.query(
    'SELECT id, owner_id FROM communities WHERE slug = ? LIMIT 1',
    [slug]
  )
  const community = (cRows as any[])[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  // Check if owner, moderator, or site admin
  const [memberRows] = await db.query(
    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
    [community.id, user.userId]
  )
  const member = (memberRows as any[])[0]
  const isAllowed = Number(user.userId) === Number(community.owner_id) || member?.role === 'owner' || member?.role === 'moderator' || user.role === 'admin'

  if (!isAllowed) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถดูรายการลิงก์เชิญได้' })
  }

  // Fetch invites
  const [invRows] = await db.query(
    `SELECT id, code, expires_at, max_uses, use_count, is_active, created_at
     FROM community_invites
     WHERE community_id = ? AND is_active = 1
     ORDER BY created_at DESC`,
    [community.id]
  )

  const now = new Date()
  const invites = (invRows as any[]).map((inv) => {
    let isExpired = false
    if (inv.expires_at) {
      isExpired = new Date(inv.expires_at) <= now
    }
    const isMaxed = inv.max_uses !== null && inv.use_count >= inv.max_uses
    return {
      id: inv.id,
      code: inv.code,
      expires_at: inv.expires_at,
      max_uses: inv.max_uses,
      use_count: inv.use_count,
      is_active: inv.is_active === 1,
      is_expired: isExpired,
      is_maxed: isMaxed,
      created_at: inv.created_at
    }
  })

  return { invites }
})
