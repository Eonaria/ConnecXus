import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb()

  const [rows] = await db.query<any[]>(
    `SELECT COUNT(*) as total_unread 
     FROM messages m 
     JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id 
     WHERE cp.user_id = ? 
       AND m.sender_id != ? 
       AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01') 
       AND (cp.deleted_at IS NULL OR m.created_at > cp.deleted_at)`, 
    [user.userId, user.userId]
  )

  return { unread_count: rows[0].total_unread || 0 }
})
