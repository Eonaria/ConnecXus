export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบก่อนเข้าร่วมชุมชน' })
  }

  const code = getRouterParam(event, 'code')
  const db = getDb()

  if (!code) {
    throw createError({ statusCode: 400, message: 'รหัสเชิญไม่ถูกต้อง' })
  }

  // Get invite & community
  const [rows] = await db.query(
    `SELECT i.*, c.slug as community_slug, c.name as community_name
     FROM community_invites i
     JOIN communities c ON i.community_id = c.id
     WHERE i.code = ?
     LIMIT 1`,
    [code]
  )

  const invite: any = (rows as any[])[0]
  if (!invite || !invite.is_active) {
    throw createError({ statusCode: 400, message: 'ลิงก์เชิญนี้ไม่ถูกต้องหรือถูกปิดใช้งานแล้ว' })
  }

  // Check expiration
  if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
    throw createError({ statusCode: 400, message: 'ลิงก์เชิญนี้หมดอายุแล้ว' })
  }

  // Check max uses
  if (invite.max_uses !== null && invite.use_count >= invite.max_uses) {
    throw createError({ statusCode: 400, message: 'ลิงก์เชิญนี้มีผู้ใช้งานครบตามจำนวนจำกัดแล้ว' })
  }

  // Check if already joined
  const [mRows] = await db.query(
    'SELECT id, status, role FROM community_members WHERE community_id = ? AND user_id = ? LIMIT 1',
    [invite.community_id, user.userId]
  )

  const existingMember = (mRows as any[])[0]
  if (existingMember && existingMember.status === 'active') {
    return {
      success: true,
      already_joined: true,
      slug: invite.community_slug,
      message: 'คุณเป็นสมาชิกของชุมชนนี้อยู่แล้ว'
    }
  }

  if (existingMember) {
    // Update existing row (e.g. was pending or left) to active
    await db.query(
      "UPDATE community_members SET status = 'active', role = 'member' WHERE id = ?",
      [existingMember.id]
    )
  } else {
    // Insert new member
    await db.query(
      "INSERT INTO community_members (community_id, user_id, role, status) VALUES (?, ?, 'member', 'active')",
      [invite.community_id, user.userId]
    )
  }

  // Increment use_count
  await db.query(
    'UPDATE community_invites SET use_count = use_count + 1 WHERE id = ?',
    [invite.id]
  )

  return {
    success: true,
    slug: invite.community_slug,
    message: `ยินดีต้อนรับสู่ชุมชน ${invite.community_name}!`
  }
})
