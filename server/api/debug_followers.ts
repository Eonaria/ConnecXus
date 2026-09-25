import { getDb } from '../utils/db'

export default defineEventHandler(async () => {
  const db = getDb()
  const [users] = await db.query('SELECT id, username FROM users')
  const [followers] = await db.query('SELECT * FROM user_followers')
  return { users, followers }
})
