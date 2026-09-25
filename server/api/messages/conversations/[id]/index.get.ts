import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  const db = getDb()

  const queryStr = `
    SELECT 
      c.id AS conversation_id,
      c.type,
      COALESCE(c.theme_color, cp.theme_color, 'var(--brand)') AS theme_color,
      COALESCE(c.quick_emoji, cp.quick_emoji, '👍') AS quick_emoji,
      COALESCE(c.wallpaper_url, cp.wallpaper_url) AS wallpaper_url,
      c.created_at,
      cp.is_muted,
      u.id AS other_user_id,
      u.username AS other_username,
      u.display_name AS other_display_name,
      u.avatar_url AS other_avatar_url,
      m.id AS last_message_id,
      m.content AS last_message_content,
      m.image_url AS last_message_image_url,
      m.created_at AS last_message_created_at,
      m.sender_id AS last_message_sender_id,
      cp2.last_read_at AS other_last_read_at,
      EXISTS(SELECT 1 FROM user_blocks WHERE blocker_id = ? AND blocked_id = u.id) AS is_blocked,
      EXISTS(SELECT 1 FROM user_blocks WHERE blocker_id = u.id AND blocked_id = ?) AS is_blocked_by_them,
      (EXISTS(SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = u.id) AND
       EXISTS(SELECT 1 FROM user_followers WHERE follower_id = u.id AND following_id = ?)) AS is_mutual_follow,
      (
        SELECT COUNT(*) 
        FROM messages 
        WHERE conversation_id = c.id 
          AND sender_id != ? 
          AND created_at > COALESCE(cp.last_read_at, '1970-01-01')
          AND (cp.deleted_at IS NULL OR created_at > cp.deleted_at)
      ) AS unread_count
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
    JOIN users u ON cp2.user_id = u.id
    LEFT JOIN messages m ON m.id = (
      SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
    )
    WHERE cp.user_id = ? AND c.id = ?
  `

  const [rows] = await db.query<RowDataPacket[]>(queryStr, [
    user.userId, 
    user.userId, 
    user.userId, 
    user.userId, 
    user.userId,
    user.userId,
    user.userId,
    conversationId
  ])

  if (rows.length === 0) {
    throw createError({ statusCode: 404, message: 'Conversation not found' })
  }

  const row = rows[0] as any
  return {
    id: row.conversation_id,
    type: row.type,
    theme_color: row.theme_color,
    quick_emoji: row.quick_emoji,
    wallpaper_url: row.wallpaper_url || null,
    created_at: row.created_at,
    is_muted: !!row.is_muted,
    unread_count: row.unread_count,
    other_last_read_at: row.other_last_read_at,
    other_user: {
      id: row.other_user_id,
      username: row.other_username,
      display_name: row.other_display_name,
      avatar_url: row.other_avatar_url
    },
    last_message: row.last_message_id ? {
      id: row.last_message_id,
      content: row.last_message_content,
      image_url: row.last_message_image_url,
      created_at: row.last_message_created_at,
      sender_id: row.last_message_sender_id
    } : null,
    is_blocked: !!row.is_blocked,
    is_blocked_by_them: !!row.is_blocked_by_them,
    is_mutual_follow: !!row.is_mutual_follow
  }
})
