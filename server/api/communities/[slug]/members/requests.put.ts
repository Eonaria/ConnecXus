import { z } from 'zod'

const actionSchema = z.object({
  user_id: z.number(),
  action: z.enum(['approve', 'reject'])
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)
  const data = actionSchema.parse(body)
  const db = getDb()

  const [cRows] = await db.query(
    'SELECT id, name, owner_id FROM communities WHERE slug = ? LIMIT 1',
    [slug]
  )
  const community = (cRows as any[])[0]
  if (!community) {
    throw createError({ statusCode: 404, message: 'ไม่พบชุมชนนี้' })
  }

  const [memberRows] = await db.query(
    "SELECT role FROM community_members WHERE community_id = ? AND user_id = ? AND status = 'active' LIMIT 1",
    [community.id, user.userId]
  )
  const member = (memberRows as any[])[0]
  const isAllowed = user.userId === community.owner_id || member?.role === 'owner' || member?.role === 'moderator' || user.role === 'admin'

  if (!isAllowed) {
    throw createError({ statusCode: 403, message: 'Forbidden: เฉพาะผู้สร้างกลุ่มและผู้ดูแลเท่านั้นที่สามารถจัดการคำขอของกลุ่มนี้ได้' })
  }

  if (data.action === 'approve') {
    await db.query(
      'UPDATE community_members SET status = "active", joined_at = NOW() WHERE community_id = ? AND user_id = ? AND status = "pending"',
      [community.id, data.user_id]
    )

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
        user_id: data.user_id,
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
    broadcastToUser(data.user_id, {
      type: 'community_request_approved',
      payload: {
        community_id: community.id,
        community_slug: slug,
        community_name: community.name
      }
    })
  } else if (data.action === 'reject') {
    await db.query(
      'DELETE FROM community_members WHERE community_id = ? AND user_id = ? AND status = "pending"',
      [community.id, data.user_id]
    )

    broadcastToRoom(`community-${slug}`, {
      type: 'community_member_request_handled',
      payload: {
        community_id: community.id,
        community_slug: slug,
        user_id: data.user_id
      }
    })
    broadcastToUser(data.user_id, {
      type: 'community_request_rejected',
      payload: {
        community_id: community.id,
        community_slug: slug,
        community_name: community.name
      }
    })
  }

  return { success: true }
})
