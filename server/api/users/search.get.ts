import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let q = query.q as string

  if (!q) {
    return { users: [] }
  }

  // If the query starts with @, remove it for the search
  if (q.startsWith('@')) {
    q = q.substring(1)
  }

  const db = await getDb()
  const searchPattern = `%${q}%`
  
  const [users] = await db.query(
    `SELECT id, username, display_name, avatar_url, bio 
     FROM users 
     WHERE (username LIKE ? OR display_name LIKE ?) AND is_banned = 0
     LIMIT 5`,
    [searchPattern, searchPattern]
  )

  return { users }
})
