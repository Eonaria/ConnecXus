export default defineEventHandler(async (event) => {
  const db = getDb()
  try {
    const [columns] = await db.query('SHOW COLUMNS FROM communities LIKE "rules"')
    if ((columns as any[]).length === 0) {
      await db.query('ALTER TABLE communities ADD COLUMN rules JSON DEFAULT NULL')
      return { success: true, message: 'rules column added' }
    } else {
      return { success: true, message: 'rules column already exists' }
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})
