const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'connecxus_db'
  });
  try {
    console.log('Adding columns to conversation_participants...');
    await conn.query('ALTER TABLE conversation_participants ADD COLUMN theme_color VARCHAR(50) DEFAULT "var(--brand)"');
    await conn.query('ALTER TABLE conversation_participants ADD COLUMN quick_emoji VARCHAR(10) DEFAULT "👍"');
    console.log('Migrating data...');
    await conn.query('UPDATE conversation_participants cp JOIN conversations c ON cp.conversation_id = c.id SET cp.theme_color = c.theme_color, cp.quick_emoji = c.quick_emoji');
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
