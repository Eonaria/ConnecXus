import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const conversationId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { theme_color, quick_emoji, wallpaper_url } = body

  if (theme_color === undefined && quick_emoji === undefined && wallpaper_url === undefined) {
    throw createError({ statusCode: 400, message: 'No settings to update' })
  }

  const db = getDb()

  // Verify participation and check conversation type
  const [partRows] = await db.query<RowDataPacket[]>(
    'SELECT cp.user_id, c.type FROM conversation_participants cp JOIN conversations c ON cp.conversation_id = c.id WHERE cp.conversation_id = ? AND cp.user_id = ?',
    [conversationId, user.userId]
  )
  
  if (partRows.length === 0) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const isGroup = partRows[0].type === 'group'

  if (isGroup) {
    // Update group-level settings in conversations table and all participants
    if (theme_color !== undefined) {
      await db.query('UPDATE conversations SET theme_color = ? WHERE id = ?', [theme_color, conversationId])
      await db.query('UPDATE conversation_participants SET theme_color = ? WHERE conversation_id = ?', [theme_color, conversationId])
    }
    if (quick_emoji !== undefined) {
      await db.query('UPDATE conversations SET quick_emoji = ? WHERE id = ?', [quick_emoji, conversationId])
      await db.query('UPDATE conversation_participants SET quick_emoji = ? WHERE conversation_id = ?', [quick_emoji, conversationId])
    }
    if (wallpaper_url !== undefined) {
      await db.query('UPDATE conversations SET wallpaper_url = ? WHERE id = ?', [wallpaper_url || null, conversationId])
      await db.query('UPDATE conversation_participants SET wallpaper_url = ? WHERE conversation_id = ?', [wallpaper_url || null, conversationId])
    }
  } else {
    // Update user-level personal settings in direct chat
    if (theme_color !== undefined) {
      await db.query('UPDATE conversation_participants SET theme_color = ? WHERE conversation_id = ? AND user_id = ?', [theme_color, conversationId, user.userId])
    }
    if (quick_emoji !== undefined) {
      await db.query('UPDATE conversation_participants SET quick_emoji = ? WHERE conversation_id = ? AND user_id = ?', [quick_emoji, conversationId, user.userId])
    }
    if (wallpaper_url !== undefined) {
      await db.query('UPDATE conversation_participants SET wallpaper_url = ? WHERE conversation_id = ? AND user_id = ?', [wallpaper_url || null, conversationId, user.userId])
    }
  }

  return { success: true, conversation_id: conversationId, is_group: isGroup, theme_color, quick_emoji, wallpaper_url }
})
