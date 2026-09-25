const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'connecxus_db'
  });
  try {
    console.log('Adding is_archived and deleted_at to conversation_participants...');
    await conn.query('ALTER TABLE conversation_participants ADD COLUMN is_archived TINYINT(1) DEFAULT 0');
    await conn.query('ALTER TABLE conversation_participants ADD COLUMN deleted_at DATETIME DEFAULT NULL');
    console.log('Migration successful');
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist, skipping.');
    } else {
      console.error('Migration failed:', e);
    }
  }
  conn.end();
}
run();
