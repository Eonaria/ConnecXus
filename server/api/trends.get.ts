/**
 * GET /api/trends
 * Calculate real trending topics and hashtags based on active posts in the database
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = query.limit ? Math.max(1, Number(query.limit)) : 100

    const db = getDb()

    // 1. Fetch recent active posts to extract hashtags (only active non-banned users)
    const [rows] = await db.query(
      `SELECT p.content, p.created_at 
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_deleted = 0 AND u.is_banned = 0 AND p.content IS NOT NULL AND p.content != ''
       ORDER BY p.created_at DESC 
       LIMIT 500`
    )

    const posts = rows as any[]
    const tagCountMap = new Map<string, { count: number; recent: boolean }>()

    // Regex to match Thai and English hashtags (#word)
    const hashtagRegex = /#([\p{L}\p{M}\p{N}_]+)/gu

    const now = Date.now()
    const ONE_DAY_MS = 24 * 60 * 60 * 1000

    for (const post of posts) {
      if (!post.content) continue
      const isRecent = post.created_at ? (now - new Date(post.created_at).getTime()) < (7 * ONE_DAY_MS) : false
      
      const matches = post.content.matchAll(hashtagRegex)
      const seenInPost = new Set<string>()

      for (const m of matches) {
        const rawTag = m[1]
        if (!rawTag || rawTag.length < 2) continue
        
        // Normalize case for comparison
        const normalizedKey = rawTag.toLowerCase()
        if (seenInPost.has(normalizedKey)) continue
        seenInPost.add(normalizedKey)

        const displayTag = `#${rawTag}`
        const existing = tagCountMap.get(displayTag)
        if (existing) {
          existing.count += 1
          if (isRecent) existing.recent = true
        } else {
          tagCountMap.set(displayTag, { count: 1, recent: isRecent })
        }
      }
    }

    // Convert map to sorted array
    const realTrends = Array.from(tagCountMap.entries())
      .map(([title, data]) => {
        let category = 'ทั่วไป · กำลังมาแรง'
        if (data.count >= 5) {
          category = '🔥 ได้รับความนิยมสูงสุด'
        } else if (data.recent) {
          category = '✨ มาแรงในสัปดาห์นี้'
        } else {
          category = 'ได้รับความนิยม'
        }

        return {
          title,
          category,
          postCount: data.count,
          posts: `${data.count.toLocaleString('th-TH')} โพสต์`,
          isReal: true,
        }
      })
      .sort((a, b) => b.postCount - a.postCount)

    return {
      trends: realTrends.slice(0, limit),
      totalRealTags: realTrends.length,
    }
  } catch (error) {
    console.error('Error fetching trending topics:', error)
    return {
      trends: [],
      totalRealTags: 0,
    }
  }
})
