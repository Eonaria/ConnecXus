import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const archived = query.archived === 'true'
  const db = getDb()

  // --- 1. Direct conversations ---
  const directQueryStr = `
    SELECT 
      c.id AS conversation_id,
      c.type,
      cp.theme_color,
      cp.quick_emoji,
      cp.wallpaper_url,
      c.created_at,
      cp.is_muted,
      u.id AS other_user_id,
      u.username AS other_username,
      u.display_name AS other_display_name,
      u.avatar_url AS other_avatar_url,
      m.id AS last_message_id,
      m.content AS last_message_content,
      m.image_url AS last_message_image_url,
      m.audio_url AS last_message_audio_url,
      m.created_at AS last_message_created_at,
      m.sender_id AS last_message_sender_id,
      cp2.last_read_at AS other_last_read_at,
      EXISTS(SELECT 1 FROM user_blocks WHERE blocker_id = ? AND blocked_id = u.id) AS is_blocked,
      EXISTS(SELECT 1 FROM user_blocks WHERE blocker_id = u.id AND blocked_id = ?) AS is_blocked_by_them,
      (EXISTS(SELECT 1 FROM user_followers WHERE follower_id = ? AND following_id = u.id) AND
       EXISTS(SELECT 1 FROM user_followers WHERE follower_id = u.id AND following_id = ?)) AS is_mutual_follow,
      EXISTS(SELECT 1 FROM messages WHERE conversation_id = c.id AND sender_id = ?) AS has_replied,
      (
        SELECT COUNT(*) 
        FROM messages 
        WHERE conversation_id = c.id 
          AND sender_id != ? 
          AND created_at > COALESCE(cp.last_read_at, '1970-01-01')
          AND (cp.deleted_at IS NULL OR created_at > cp.deleted_at)
      ) AS unread_count
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ?
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id != ?
    JOIN users u ON cp2.user_id = u.id
    LEFT JOIN messages m ON m.id = (
      SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
    )
    WHERE c.type = 'direct'
      AND cp.is_archived = ?
      AND (cp.deleted_at IS NULL OR m.created_at > cp.deleted_at)
    HAVING (is_mutual_follow = 1 OR has_replied = 1)
    ORDER BY last_message_created_at DESC, c.created_at DESC
  `

  const [directRows] = await db.query<RowDataPacket[]>(directQueryStr, [
    user.userId, user.userId, user.userId, user.userId,
    user.userId, user.userId, user.userId, user.userId,
    archived ? 1 : 0
  ])

  // --- 2. Group conversations ---
  const groupQueryStr = `
    SELECT 
      c.id AS conversation_id,
      c.type,
      c.name AS group_name,
      c.avatar_url AS group_avatar_url,
      COALESCE(c.theme_color, cp.theme_color, 'var(--brand)') AS theme_color,
      COALESCE(c.quick_emoji, cp.quick_emoji, '👍') AS quick_emoji,
      COALESCE(c.wallpaper_url, cp.wallpaper_url) AS wallpaper_url,
      c.created_at,
      cp.is_muted,
      cp.role AS my_role,
      m.id AS last_message_id,
      m.content AS last_message_content,
      m.image_url AS last_message_image_url,
      m.audio_url AS last_message_audio_url,
      m.created_at AS last_message_created_at,
      m.sender_id AS last_message_sender_id,
      (
        SELECT COUNT(*) 
        FROM messages 
        WHERE conversation_id = c.id 
          AND sender_id != ? 
          AND created_at > COALESCE(cp.last_read_at, '1970-01-01')
          AND (cp.deleted_at IS NULL OR created_at > cp.deleted_at)
      ) AS unread_count
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ?
    LEFT JOIN messages m ON m.id = (
      SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
    )
    WHERE c.type = 'group'
      AND (cp.is_archived IS NULL OR cp.is_archived = ?)
    ORDER BY last_message_created_at DESC, c.created_at DESC
  `

  const [groupRows] = await db.query<RowDataPacket[]>(groupQueryStr, [
    user.userId, user.userId, archived ? 1 : 0
  ])

  const mapDirect = (row: RowDataPacket) => ({
    id: row.conversation_id,
    type: row.type,
    theme_color: row.theme_color || 'var(--brand)',
    quick_emoji: row.quick_emoji || '👍',
    wallpaper_url: row.wallpaper_url || null,
    created_at: row.created_at,
    unread_count: row.unread_count || 0,
    is_muted: !!row.is_muted,
    is_blocked: !!row.is_blocked,
    is_blocked_by_them: !!row.is_blocked_by_them,
    other_last_read_at: row.other_last_read_at,
    other_user: {
      id: row.other_user_id,
      username: row.other_username,
      display_name: row.other_display_name,
      avatar_url: row.other_avatar_url,
    },
    last_message: row.last_message_id ? {
      id: row.last_message_id,
      content: row.last_message_content,
      image_url: row.last_message_image_url,
      audio_url: row.last_message_audio_url,
      sender_id: row.last_message_sender_id,
      created_at: row.last_message_created_at
    } : null
  })

  const mapGroup = (row: RowDataPacket) => ({
    id: row.conversation_id,
    type: row.type,
    theme_color: row.theme_color || 'var(--brand)',
    quick_emoji: row.quick_emoji || '👍',
    wallpaper_url: row.wallpaper_url || null,
    created_at: row.created_at,
    unread_count: row.unread_count || 0,
    is_muted: !!row.is_muted,
    is_blocked: false,
    is_blocked_by_them: false,
    my_role: row.my_role,
    other_last_read_at: null,
    other_user: {
      id: `group-${row.conversation_id}`,
      username: 'group',
      display_name: row.group_name || 'กลุ่ม',
      avatar_url: row.group_avatar_url || null,
    },
    last_message: row.last_message_id ? {
      id: row.last_message_id,
      content: row.last_message_content,
      image_url: row.last_message_image_url,
      audio_url: row.last_message_audio_url,
      sender_id: row.last_message_sender_id,
      created_at: row.last_message_created_at
    } : null
  })

  const allConversations = [
    ...directRows.map(mapDirect),
    ...groupRows.map(mapGroup)
  ].sort((a, b) => {
    const aTime = a.last_message?.created_at || a.created_at
    const bTime = b.last_message?.created_at || b.created_at
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return allConversations
})