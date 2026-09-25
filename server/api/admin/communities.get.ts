import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const db = getDb()

  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT 
      c.id, c.name, c.slug, c.description, c.created_at, c.is_suspended,
      u.username as owner_username, u.display_name as owner_name,
      (SELECT COUNT(*) FROM community_members WHERE community_id = c.id AND status = 'active') as member_count
    FROM communities c
    LEFT JOIN users u ON c.owner_id = u.id
    ORDER BY c.created_at DESC
  `)

  return { communities: rows }
})
