export default defineEventHandler(async (event) => {
  const db = getDb()
  const [rows] = await db.query(
    `SELECT id, slug, rules FROM communities WHERE slug = 'นอน'`
  )
  return rows
})
