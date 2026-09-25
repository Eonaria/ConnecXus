/**
 * POST /api/comments
 * Save a new comment into MySQL comments table with auto post/user reference handling
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const body = await readBody(event)
  const { post_id, content, parent_id, image_url } = body || {}

  if (!post_id || (!content?.trim() && !image_url)) {
    throw createError({ statusCode: 400, message: 'กรุณากรอกข้อความหรือแนบไฟล์' })
  }

  const userId = user?.userId || 1
  const authorName = user?.display_name || 'ภาณุพงศ์ เกสีสังข์'
  const authorUsername = user?.username || 'panupong'

  try {
    const db = getDb()

    // Ensure image_url column exists
    try {
      await db.query('ALTER TABLE comments ADD COLUMN image_url VARCHAR(255) NULL')
    } catch {}

    // 1. Ensure user exists in users table
    const [uRows] = await db.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId])
    if ((uRows as any[]).length === 0) {
      await db.query(
        'INSERT IGNORE INTO users (id, username, email, password_hash, display_name) VALUES (?, ?, ?, ?, ?)',
        [userId, authorUsername, `${authorUsername}@connecxus.local`, 'hash', authorName]
      )
    }

    // 2. Ensure post exists in posts table (to satisfy Foreign Key constraint)
    const [pRows] = await db.query('SELECT id FROM posts WHERE id = ? LIMIT 1', [post_id])
    if ((pRows as any[]).length === 0) {
      await db.query(
        'INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)',
        [post_id, userId, 'โพสต์เริ่มต้น']
      )
    }

    // 3. Insert comment
    const [res] = await db.query(
      'INSERT INTO comments (post_id, user_id, parent_id, content, image_url) VALUES (?, ?, ?, ?, ?)',
      [post_id, userId, parent_id || null, content?.trim() || '', image_url || null]
    )

    const insertId = (res as any).insertId

    const [ownerRows] = await db.query('SELECT user_id FROM posts WHERE id = ? LIMIT 1', [post_id])
    const postOwnerId = (ownerRows as any[])[0]?.user_id

    // 4. Notify post owner (if applicable)
    try {
      if (postOwnerId && postOwnerId !== userId) {
        await db.query(
          `INSERT INTO notifications (user_id, sender_id, type, post_id)
           VALUES (?, ?, 'comment', ?)`,
          [postOwnerId, userId, post_id]
        )
      }
    } catch {}

    const [countRows] = await db.query('SELECT COUNT(*) as cnt FROM comments WHERE post_id = ? AND is_deleted = 0', [post_id])
    const commentCount = (countRows as any[])[0]?.cnt || 0

    const newComment = {
      id: insertId,
      author_name: authorName,
      author_username: authorUsername,
      authorInitials: String(authorName).slice(0, 2),
      avatarBg: '#5b46e0',
      content: content?.trim() || '',
      image_url: image_url || null,
      time_ago: 'เมื่อสักครู่',
    }

    // Realtime broadcast
    const packet = {
      type: 'new_comment',
      payload: {
        post_id: Number(post_id),
        comment: newComment,
        comment_count: commentCount,
        source_username: authorUsername,
        source_user_id: userId,
        target_user_id: postOwnerId
      }
    }
    broadcastGlobal(packet)
    broadcastToPost(post_id, packet)

    if (postOwnerId && postOwnerId !== userId) {
      broadcastToUser(postOwnerId, {
        type: 'notification_update',
        payload: { action: 'new_comment', post_id: Number(post_id), source_username: authorUsername, target_user_id: postOwnerId }
      })
    }

    // Notify parent comment author if replying to someone else's comment
    if (parent_id) {
      const [parentRows] = await db.query('SELECT user_id FROM comments WHERE id = ? LIMIT 1', [parent_id])
      const parentUserId = (parentRows as any[])[0]?.user_id
      if (parentUserId && parentUserId !== userId && parentUserId !== postOwnerId) {
        try {
          await db.query(
            `INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES (?, ?, 'comment', ?)`,
            [parentUserId, userId, post_id]
          )
          broadcastToUser(parentUserId, {
            type: 'notification_update',
            payload: { action: 'new_comment', post_id: Number(post_id), source_username: authorUsername, target_user_id: parentUserId }
          })
        } catch {}
      }
    }

    return {
      success: true,
      comment: newComment,
      comment_count: commentCount
    }
  } catch (e: any) {
    console.error('[Create Comment Error]', e)
    throw createError({ statusCode: 500, message: 'ไม่สามารถสร้างความคิดเห็นได้: ' + (e.message || 'Database error') })
  }
})
