import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Invalid slug' })
  }

  const db = getDb()

  // 1. Get community
  const [comRows] = await db.query<RowDataPacket[]>('SELECT id FROM communities WHERE slug = ?', [slug])
  if (comRows.length === 0) {
    throw createError({ statusCode: 404, message: 'Community not found' })
  }
  const communityId = comRows[0].id

  // 2. Check if user is a member
  const [memberRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM community_members WHERE community_id = ? AND user_id = ? AND status = "active"',
    [communityId, user.userId]
  )
  
  const isAdmin = user.role === 'admin'
  
  if (memberRows.length === 0 && !isAdmin) {
    throw createError({ statusCode: 403, message: 'You must be a member to join the chat' })
  }

  // 3. Find or create conversation
  let conversationId: number
  const [convRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM conversations WHERE community_id = ? LIMIT 1',
    [communityId]
  )

  if (convRows.length > 0) {
    conversationId = convRows[0].id
  } else {
    const [insertConv] = await db.query(
      'INSERT INTO conversations (type, community_id) VALUES (?, ?)',
      ['community', communityId]
    )
    conversationId = (insertConv as any).insertId
  }

  // 4. Ensure user is in conversation_participants
  const [partRows] = await db.query<RowDataPacket[]>(
    'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
    [conversationId, user.userId]
  )

  if (partRows.length === 0) {
    await db.query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
      [conversationId, user.userId]
    )
  }

  return { conversation_id: conversationId }
})
