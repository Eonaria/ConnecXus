import type { RowDataPacket  } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = getDb()
  
  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT 
      r.id,
      r.target_type,
      r.reason,
      r.status,
      r.admin_note,
      r.created_at,
      COALESCE(r.reported_user_id, p.user_id, c.user_id) as reported_user_id,
      r.reported_post_id,
      r.reported_comment_id,
      r.reported_message_id,
      r.reported_community_id,
      r.community_id as report_context_community_id,
      reporter.id as reporter_id,
      reporter.username as reporter_username,
      reporter.display_name as reporter_name,
      reporter.avatar_url as reporter_avatar,
      COALESCE(reported.username, post_author.username, comment_author.username) as reported_username,
      COALESCE(reported.display_name, post_author.display_name, comment_author.display_name) as reported_name,
      COALESCE(reported.avatar_url, post_author.avatar_url, comment_author.avatar_url) as reported_avatar,
      COALESCE(reported.is_banned, post_author.is_banned, comment_author.is_banned) as reported_is_banned,
      p.content as post_content,
      c.content as comment_content,
      c.post_id as comment_post_id,
      m.content as message_content,
      COALESCE(comm.name, ctx_comm.name) as reported_community_name,
      COALESCE(comm.slug, ctx_comm.slug) as reported_community_slug,
      COALESCE(comm.is_suspended, ctx_comm.is_suspended) as reported_community_is_suspended
    FROM reports r
    LEFT JOIN users reporter ON r.reporter_id = reporter.id
    LEFT JOIN users reported ON r.reported_user_id = reported.id
    LEFT JOIN posts p ON r.reported_post_id = p.id
    LEFT JOIN comments c ON r.reported_comment_id = c.id
    LEFT JOIN users post_author ON p.user_id = post_author.id
    LEFT JOIN users comment_author ON c.user_id = comment_author.id
    LEFT JOIN messages m ON r.reported_message_id = m.id
    LEFT JOIN communities comm ON r.reported_community_id = comm.id
    LEFT JOIN communities ctx_comm ON r.community_id = ctx_comm.id
    ORDER BY 
      CASE WHEN r.status = 'pending' THEN 1 ELSE 2 END,
      r.created_at DESC
  `)

  return { reports: rows }
})
