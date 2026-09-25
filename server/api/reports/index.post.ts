import type { ResultSetHeader  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  let { targetType, targetId, communityId, reason } = body

  if (!targetType || !targetId || !reason) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const validTypes = ['user', 'post', 'comment', 'message', 'community']
  if (!validTypes.includes(targetType)) {
    throw createError({ statusCode: 400, message: 'Invalid target type' })
  }

  const db = getDb()

  // Prevent self-reporting
  if (targetType === 'user' && targetId === user.userId) {
    throw createError({ statusCode: 400, message: 'You cannot report yourself' })
  } else if (targetType === 'post') {
    const [postRows] = await db.query<any[]>('SELECT user_id, community_id FROM posts WHERE id = ?', [targetId]);
    if (postRows.length) {
      if (postRows[0].user_id === user.userId) {
         throw createError({ statusCode: 400, message: 'You cannot report your own post' })
      }
      if (!communityId && postRows[0].community_id) {
         communityId = postRows[0].community_id;
      }
    }
  } else if (targetType === 'comment') {
    const [commentRows] = await db.query<any[]>('SELECT c.user_id, p.community_id FROM comments c LEFT JOIN posts p ON c.post_id = p.id WHERE c.id = ?', [targetId]);
    if (commentRows.length) {
      if (commentRows[0].user_id === user.userId) {
         throw createError({ statusCode: 400, message: 'You cannot report your own comment' })
      }
      if (!communityId && commentRows[0].community_id) {
         communityId = commentRows[0].community_id;
      }
    }
  }

  let query = `
    INSERT INTO reports 
    (reporter_id, target_type, reason, status, community_id, `
    
  let values = [user.userId, targetType, reason, 'pending', communityId || null]

  if (targetType === 'user') {
    query += `reported_user_id) VALUES (?, ?, ?, ?, ?, ?)`
    values.push(targetId)
  } else if (targetType === 'post') {
    query += `reported_post_id) VALUES (?, ?, ?, ?, ?, ?)`
    values.push(targetId)
  } else if (targetType === 'comment') {
    query += `reported_comment_id) VALUES (?, ?, ?, ?, ?, ?)`
    values.push(targetId)
  } else if (targetType === 'message') {
    query += `reported_message_id) VALUES (?, ?, ?, ?, ?, ?)`
    values.push(targetId)
  } else if (targetType === 'community') {
    query += `reported_community_id) VALUES (?, ?, ?, ?, ?, ?)`
    values.push(targetId)
  }

  await db.query<ResultSetHeader>(query, values)

  return { success: true }
})
