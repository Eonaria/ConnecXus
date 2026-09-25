import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1, 'ชื่อชุมชนต้องไม่เป็นค่าว่าง').optional(),
  description: z.string().optional(),
  bg_color: z.string().optional(),
  is_private: z.boolean().optional(),
  is_hidden: z.boolean().optional(),
  is_community_only_feed: z.boolean().optional(),
  members_only_feed: z.boolean().optional(),
  rules: z.array(z.string()).optional(),
  avatar_url: z.string().nullable().optional(),
  banner_url: z.string().nullable().optional(),
  banner_position_y: z.number().min(0).max(100).optional()
})

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)
  const data = updateSchema.parse(body)

  const db = getDb()

  try {
    await db.query('ALTER TABLE communities ADD COLUMN banner_position_y INT DEFAULT 50')
  } catch (e) {}

  // Verify ownership, moderator, or site admin
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
  const isOwner = community.owner_id === user.userId || member?.role === 'owner'
  const isMod = member?.role === 'moderator'
  const isSiteAdmin = user.role === 'admin'

  if (!isOwner && !isMod && !isSiteAdmin) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถแก้ไขการตั้งค่าได้' })
  }

  // Update
  const updates: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    values.push(data.description)
  }
  if (data.bg_color !== undefined) {
    updates.push('bg_color = ?')
    values.push(data.bg_color)
  }
  if (data.is_private !== undefined) {
    updates.push('is_private = ?')
    values.push(data.is_private ? 1 : 0)
  }
  if (data.is_hidden !== undefined) {
    updates.push('is_hidden = ?')
    values.push(data.is_hidden ? 1 : 0)
  }
  if (data.is_community_only_feed !== undefined) {
    updates.push('is_community_only_feed = ?')
    values.push(data.is_community_only_feed ? 1 : 0)
  }
  if (data.members_only_feed !== undefined) {
    updates.push('members_only_feed = ?')
    values.push(data.members_only_feed ? 1 : 0)
  }
  if (data.rules !== undefined) {
    updates.push('rules = ?')
    values.push(JSON.stringify(data.rules))
  }
  if (data.avatar_url !== undefined) {
    updates.push('avatar_url = ?')
    values.push(data.avatar_url)
  }
  if (data.banner_url !== undefined) {
    updates.push('banner_url = ?')
    values.push(data.banner_url)
  }
  if (data.banner_position_y !== undefined) {
    updates.push('banner_position_y = ?')
    values.push(data.banner_position_y)
  }

  if (updates.length > 0) {
    values.push(community.id)
    await db.query(
      `UPDATE communities SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
  }

  // Broadcast Realtime Events across all connected clients
  broadcastGlobal({
    type: 'communities_list_changed',
    payload: {
      community_id: community.id,
      community_slug: slug,
      is_hidden: data.is_hidden,
      is_private: data.is_private
    }
  })

  broadcastToRoom(`community-${slug}`, {
    type: 'community_settings_updated',
    payload: {
      community_id: community.id,
      community_slug: slug,
      ...data
    }
  })

  return { success: true }
})
