/**
 * GET /api/posts/trends
 * Calculate real trending topics and hashtags based on active posts in the database
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = query.limit ? Math.max(1, Number(query.limit)) : 100

    const db = getDb()

    // 1. Fetch recent active posts to extract hashtags
    const [rows] = await db.query(
      `SELECT content, created_at 
       FROM posts 
       WHERE is_deleted = 0 AND content IS NOT NULL AND content != ''
       ORDER BY created_at DESC 
       LIMIT 500`
    )

    const posts = rows as any[]
    const tagCountMap = new Map<string, { count: number; recent: boolean }>()

    // Regex to match Thai and English hashtags (#word)
    // Matches # followed by unicode letters, marks, numbers, or underscores
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
        
        // Normalize case for comparison while keeping original display
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
        if (data.count >= 10) {
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
          posts: data.count.toLocaleString('th-TH'),
          isReal: true,
        }
      })
      .sort((a, b) => b.postCount - a.postCount)

    return {
      trends: realTrends.slice(0, limit),
      totalTags: realTrends.length,
    }
  } catch (error) {
    console.error('Error fetching trending topics:', error)
    return {
      trends: [],
      totalTags: 0,
    }
  }
})
