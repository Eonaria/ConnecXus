import type { ResultSetHeader, RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  let { conversation_id, receiver_id, content, image_url, audio_url } = body

  if (!content && !image_url && !audio_url) {
    throw createError({ statusCode: 400, message: 'Content, image, or audio is required' })
  }

  const db = getDb()

  if (!conversation_id && receiver_id) {
    // Check if direct conversation already exists
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT c.id 
      FROM conversations c
      JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
      JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
      WHERE c.type = 'direct' AND cp1.user_id = ? AND cp2.user_id = ?
      LIMIT 1
    `, [user.userId, receiver_id])

    if (rows.length > 0) {
      conversation_id = rows[0]?.id
    } else {
      // Create one
      const [convResult] = await db.query<ResultSetHeader>(
        'INSERT INTO conversations (type) VALUES (?)',
        ['direct']
      )
      conversation_id = convResult.insertId

      await db.query(
        'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
        [conversation_id, user.userId, conversation_id, receiver_id]
      )
    }
  }

  if (!conversation_id) {
    throw createError({ statusCode: 400, message: 'conversation_id or receiver_id is required' })
  }

  // Check mutual follow (only for direct conversations)
  let otherUserId = receiver_id
  let isDirect = false

  if (!otherUserId) {
    const [convRows] = await db.query<RowDataPacket[]>(
      'SELECT type FROM conversations WHERE id = ?',
      [conversation_id]
    )
    isDirect = convRows[0]?.type === 'direct'

    if (isDirect) {
      const [partRows] = await db.query<RowDataPacket[]>(
        'SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ? LIMIT 1',
        [conversation_id, user.userId]
      )
      if (partRows.length > 0) {
        otherUserId = partRows[0].user_id
      }
    }
  } else {
    // If receiver_id is provided, it's definitely a new direct message
    isDirect = true
  }

  if (isDirect && otherUserId) {
    const [mutualCheck] = await db.query<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM user_followers WHERE follower_id = ? AND following_id = ?) AS i_follow_them,
        (SELECT COUNT(*) FROM user_followers WHERE follower_id = ? AND following_id = ?) AS they_follow_me
    `, [user.userId, otherUserId, otherUserId, user.userId])
    
    if (mutualCheck[0].i_follow_them === 0 || mutualCheck[0].they_follow_me === 0) {
      throw createError({ statusCode: 403, message: 'ต้องติดตามกันและกันก่อนถึงจะส่งข้อความได้' })
    }
  }

  // Insert message
  const [insertMsg] = await db.query<ResultSetHeader>(
    'INSERT INTO messages (conversation_id, sender_id, content, image_url, audio_url) VALUES (?, ?, ?, ?, ?)',
    [conversation_id, user.userId, content || '', image_url || null, audio_url || null]
  )

  const messageId = insertMsg.insertId
  
  // Unarchive for all participants
  await db.query(
    'UPDATE conversation_participants SET is_archived = 0 WHERE conversation_id = ?',
    [conversation_id]
  )

  const [msgRows] = await db.query<RowDataPacket[]>(`
    SELECT 
      m.id,
      m.conversation_id,
      m.content,
      m.image_url,
      m.audio_url,
      m.created_at,
      u.id AS sender_id,
      u.username AS sender_username,
      u.display_name AS sender_display_name,
      u.avatar_url AS sender_avatar_url
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `, [messageId])

  const row = msgRows[0] as any
  const messageData = {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    content: row.content,
    image_url: row.image_url,
    audio_url: row.audio_url,
    created_at: row.created_at,
    sender: {
      id: row.sender_id,
      username: row.sender_username,
      display_name: row.sender_display_name,
      avatar_url: row.sender_avatar_url
    }
  }

  // Realtime Broadcast
  try {
    const chatPacket = {
      type: 'chat',
      payload: {
        conversation_id: row.conversation_id,
        message: messageData
      }
    }
    broadcastToConversation(row.conversation_id, chatPacket)
    broadcastGlobal(chatPacket)
  } catch {}

  return messageData
})
