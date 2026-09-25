/**
 * POST /api/posts/[id]/comments
 * Add a comment to a post.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Invalid post ID' })
  }

  const content = body?.content?.trim() || ''
  const imageUrl = body?.image_url || null

  if (!content && !imageUrl) {
    throw createError({ statusCode: 400, message: 'กรุณากรอกข้อความหรือแนบรูปภาพ' })
  }

  const db = getDb()

  // Ensure image_url column exists in comments table
  try {
    await db.query('ALTER TABLE comments ADD COLUMN image_url VARCHAR(255) NULL')
  } catch {}

  const [result] = await db.query(
    'INSERT INTO comments (post_id, user_id, content, image_url) VALUES (?, ?, ?, ?)',
    [postId, user.userId, content, imageUrl]
  )

  const insertId = (result as any).insertId

  // Notify post owner
  const [postRows] = await db.query('SELECT user_id FROM posts WHERE id = ? LIMIT 1', [postId])
  const postOwnerId = (postRows as any[])[0]?.user_id
  if (postOwnerId && postOwnerId !== user.userId) {
    await db.query(
      `INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (?, ?, 'comment', ?)`,
      [postOwnerId, user.userId, postId]
    ).catch(e => console.error('Failed to insert comment notification', e))
  }

  // Return the new comment object
  const [rows] = await db.query(
    `SELECT c.id, c.content, c.image_url, c.created_at,
            u.display_name AS author_name,
            u.username AS author_username,
            u.avatar_url AS author_avatar_url
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [insertId]
  )
  
  const c = (rows as any[])[0]

  // Broadcast new_comment to post room and global
  broadcastToPost(postId, {
    type: 'new_comment',
    payload: {
      post_id: Number(postId),
      comment: {
        id: c.id,
        author_name: c.author_name,
        author_username: c.author_username,
        author_avatar_url: c.author_avatar_url,
        content: c.content,
        image_url: c.image_url,
        created_at: c.created_at,
        time_ago: 'เมื่อสักครู่',
        like_count: 0,
        isLiked: false
      },
      source_username: user.username,
      source_user_id: user.userId,
      target_user_id: postOwnerId
    }
  })
  broadcastGlobal({
    type: 'new_comment',
    payload: { post_id: Number(postId), source_username: user.username, source_user_id: user.userId, target_user_id: postOwnerId }
  })
  if (postOwnerId && postOwnerId !== user.userId) {
    broadcastToUser(postOwnerId, {
      type: 'notification_update',
      payload: { action: 'new_comment', post_id: Number(postId), source_username: user.username, target_user_id: postOwnerId }
    })
  }

  return {
    success: true,
    comment: {
      id: c.id,
      author_name: c.author_name,
      author_username: c.author_username,
      authorInitials: c.author_name ? c.author_name.slice(0, 2) : 'ผใช้',
      author_avatar_url: c.author_avatar_url,
      avatarBg: '#7b6cf6',
      content: c.content,
      image_url: c.image_url,
      created_at: c.created_at,
      time_ago: 'เมื่อสักครู่',
      like_count: 0,
      isLiked: false,
    }
  }
})
