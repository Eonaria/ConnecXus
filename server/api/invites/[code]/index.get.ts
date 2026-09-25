export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const user = await getRequestUser(event)
  const db = getDb()

  if (!code) {
    throw createError({ statusCode: 400, message: 'Invalid invite code' })
  }

  // Query invite + community + owner info
  const [rows] = await db.query(
    `SELECT i.*, 
            c.name as community_name, c.slug as community_slug, c.description as community_desc,
            c.avatar_url as community_avatar_url, c.banner_url as community_banner_url,
            c.bg_color as community_bg_color, c.is_private, c.is_hidden, c.owner_id,
            u.display_name as owner_name, u.avatar_url as owner_avatar_url,
            (SELECT COUNT(*) FROM community_members WHERE community_id = c.id AND status = 'active') as member_count
     FROM community_invites i
     JOIN communities c ON i.community_id = c.id
     JOIN users u ON c.owner_id = u.id
     WHERE i.code = ?
     LIMIT 1`,
    [code]
  )

  const inviteData: any = (rows as any[])[0]
  if (!inviteData) {
    return {
      valid: false,
      status: 'invalid',
      message: 'ไม่พบลิงก์เชิญนี้ หรือลิงก์ถูกลบออกจากระบบแล้ว'
    }
  }

  // Check expiration
  const now = new Date()
  let isExpired = false
  if (inviteData.expires_at) {
    isExpired = new Date(inviteData.expires_at) <= now
  }

  // Check max uses
  const isMaxed = inviteData.max_uses !== null && inviteData.use_count >= inviteData.max_uses

  let status: 'valid' | 'expired' | 'max_uses' | 'deactivated' = 'valid'
  let message = ''

  if (!inviteData.is_active) {
    status = 'deactivated'
    message = 'ลิงก์เชิญนี้ถูกปิดการใช้งานแล้ว'
  } else if (isExpired) {
    status = 'expired'
    message = 'ลิงก์เชิญนี้หมดอายุการใช้งานแล้ว'
  } else if (isMaxed) {
    status = 'max_uses'
    message = 'ลิงก์เชิญนี้มีผู้ใช้งานครบตามจำนวนจำกัดแล้ว'
  }

  // Check if current user is already a member
  let isJoined = false
  let userRole = 'none'
  if (user) {
    const [mRows] = await db.query(
      `SELECT role, status FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1`,
      [inviteData.community_id, user.userId]
    )
    const member: any = (mRows as any[])[0]
    if (member && member.status === 'active') {
      isJoined = true
      userRole = member.role
    } else if (inviteData.owner_id === user.userId) {
      isJoined = true
      userRole = 'owner'
    }
  }

  return {
    valid: status === 'valid',
    status,
    message,
    community: {
      id: inviteData.community_id,
      name: inviteData.community_name,
      slug: inviteData.community_slug,
      description: inviteData.community_desc,
      avatar_url: inviteData.community_avatar_url,
      banner_url: inviteData.community_banner_url,
      bg_color: inviteData.community_bg_color || '#6366f1',
      member_count: inviteData.member_count || 0,
      owner_name: inviteData.owner_name,
      owner_avatar_url: inviteData.owner_avatar_url,
      is_private: inviteData.is_private === 1,
      is_hidden: inviteData.is_hidden === 1
    },
    invite: {
      code: inviteData.code,
      expires_at: inviteData.expires_at,
      max_uses: inviteData.max_uses,
      use_count: inviteData.use_count,
      created_at: inviteData.created_at
    },
    is_joined: isJoined,
    user_role: userRole
  }
})
