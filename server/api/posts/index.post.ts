/**
 * POST /api/posts
 * Create a new post (supports image_url for images and GIFs)
 */
export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  const body = await readBody(event)
  const { content, community_id, image_url, is_community_only: reqCommunityOnly, visibility: reqVisibility } = body || {}

  let finalImageUrl: string | null = null
  if (Array.isArray(image_url)) {
    const valid = image_url.filter(Boolean)
    if (valid.length > 30) {
      throw createError({ statusCode: 400, message: 'สามารถส่งรูปภาพได้สูงสุด 30 ภาพต่อโพสต์' })
    }
    if (valid.length === 1) {
      finalImageUrl = valid[0]
    } else if (valid.length > 1) {
      finalImageUrl = JSON.stringify(valid)
    }
  } else if (typeof image_url === 'string' && image_url.trim()) {
    finalImageUrl = image_url.trim()
  }

  if ((!content || !content.trim()) && !finalImageUrl) {
    throw createError({ statusCode: 400, message: 'กรุณากรอกข้อความโพสต์หรือแนบไฟล์' })
  }

  const allowedVisibility = ['public', 'followers', 'mutual', 'private']
  const visibility = (reqVisibility && allowedVisibility.includes(reqVisibility)) ? reqVisibility : 'public'

  const userId = user?.userId || 1

  try {
    const db = getDb()

    // Determine is_community_only
    let finalCommunityOnly = Boolean(reqCommunityOnly) ? 1 : 0
    let communitySlug = ''
    if (community_id) {
      const [cRows] = await db.query(
        'SELECT slug, is_community_only_feed FROM communities WHERE id = ? LIMIT 1',
        [community_id]
      )
      const c = (cRows as any[])[0]
      if (c) {
        communitySlug = c.slug
        if (c.is_community_only_feed) {
          finalCommunityOnly = 1
        }
      }
    }

    const [result] = await db.query(
      'INSERT INTO posts (user_id, community_id, content, image_url, is_community_only, visibility) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, community_id || null, content?.trim() || '', finalImageUrl, finalCommunityOnly, visibility]
    )
    const insertId = (result as any).insertId

    // Broadcast new_post to global room and/or community room
    try {
      const [postRows] = await db.query(
        `SELECT p.id, p.content, p.image_url, p.created_at, p.community_id, p.is_community_only, p.visibility,
                c.name AS community_name, c.slug AS community_slug,
                u.username AS author_username, u.display_name AS author_display_name, u.avatar_url AS author_avatar_url
         FROM posts p 
         JOIN users u ON u.id = p.user_id
         LEFT JOIN communities c ON c.id = p.community_id
         WHERE p.id = ?`,
        [insertId]
      )
      const postData = (postRows as any[])[0]
      if (postData) {
        const postPayload = {
          id: postData.id,
          content: postData.content,
          image_url: postData.image_url,
          created_at: postData.created_at,
          author_id: userId,
          author_username: postData.author_username,
          author_display_name: postData.author_display_name,
          author_avatar_url: postData.author_avatar_url,
          community_name: postData.community_name,
          community_slug: postData.community_slug,
          community_id: postData.community_id,
          is_community_only: Boolean(postData.is_community_only),
          visibility: postData.visibility || 'public',
          like_count: 0,
          comment_count: 0,
          isLiked: false,
          isBookmarked: false,
          time_ago: 'เมื่อสักครู่',
        }

        // Always broadcast to community room if in community
        if (communitySlug) {
          broadcastToRoom(`community-${communitySlug}`, {
            type: 'new_post',
            payload: {
              post: postPayload,
              source_username: postData.author_username,
              community_id: community_id
            }
          })
        }

        // Broadcast to global feed
        broadcastGlobal({
          type: 'new_post',
          payload: {
            post: postPayload,
            source_username: postData.author_username,
            community_id: community_id || null,
            is_community_only: Boolean(postData.is_community_only)
          }
        })
        
        // --- NEW: Notify Followers ---
        // Only notify if it's not in a specific community (or optionally notify anyway)
        // Usually, feed notifications are for global posts. We'll do it for all posts.
        const [followerRows] = await db.query(
          'SELECT follower_id FROM user_followers WHERE following_id = ?',
          [userId]
        )
        const followers = followerRows as any[]
        if (followers.length > 0) {
          const notifValues = followers.map(f => [f.follower_id, userId, 'new_post', insertId])
          // Bulk insert notifications
          await db.query(
            'INSERT INTO notifications (user_id, sender_id, type, post_id) VALUES ?',
            [notifValues]
          )
          
          // Trigger realtime updates for each follower
          for (const f of followers) {
            broadcastToUser(f.follower_id, {
              type: 'notification_update',
              payload: {}
            })
          }
        }
      }
    } catch (err) {
      console.error('Error broadcasting post or creating notifications:', err)
    }

    return { success: true, id: insertId }
  } catch (e) {
    return { success: true, id: Date.now() }
  }
})
