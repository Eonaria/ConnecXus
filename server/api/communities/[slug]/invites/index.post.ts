import { z } from 'zod'
import crypto from 'crypto'

const createInviteSchema = z.object({
  duration: z.enum(['30m', '1h', '24h', '7d', 'never']).default('24h'),
  max_uses: z.number().int().positive().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)
  const data = createInviteSchema.parse(body || {})

  const db = getDb()

  // Verify community & permission
  const [cRows] = await db.query(
    'SELECT id, owner_id FROM communities WHERE slug = ? LIMIT 1',
    [slug]
  )
  const community = (cRows as any[])[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }

  const [memberRows] = await db.query(
    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
    [community.id, user.userId]
  )
  const member = (memberRows as any[])[0]
  const isAllowed = Number(user.userId) === Number(community.owner_id) || member?.role === 'owner' || member?.role === 'moderator' || user.role === 'admin'

  if (!isAllowed) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถสร้างลิงก์เชิญได้' })
  }

  // Calculate expires_at in MySQL timezone using DATE_ADD
  let expiresExpr = 'NULL'
  if (data.duration === '30m') {
    expiresExpr = 'DATE_ADD(NOW(), INTERVAL 30 MINUTE)'
  } else if (data.duration === '1h') {
    expiresExpr = 'DATE_ADD(NOW(), INTERVAL 1 HOUR)'
  } else if (data.duration === '24h') {
    expiresExpr = 'DATE_ADD(NOW(), INTERVAL 24 HOUR)'
  } else if (data.duration === '7d') {
    expiresExpr = 'DATE_ADD(NOW(), INTERVAL 7 DAY)'
  }

  // Generate unique code (10 random chars alphanumeric)
  const code = crypto.randomBytes(6).toString('hex').slice(0, 10)

  const [result] = await db.query(
    `INSERT INTO community_invites (community_id, creator_id, code, expires_at, max_uses, use_count, is_active)
     VALUES (?, ?, ?, ${expiresExpr}, ?, 0, 1)`,
    [community.id, user.userId, code, data.max_uses || null]
  )
  const insertId = (result as any).insertId

  const [invRows] = await db.query(
    `SELECT id, code, expires_at, max_uses, use_count, is_active, created_at 
     FROM community_invites WHERE id = ?`,
    [insertId]
  )
  const inv = (invRows as any[])[0]

  return {
    success: true,
    invite: {
      id: inv.id,
      code: inv.code,
      expires_at: inv.expires_at,
      max_uses: inv.max_uses,
      use_count: 0,
      is_active: true,
      is_expired: false,
      is_maxed: false,
      created_at: inv.created_at
    }
  }
})
