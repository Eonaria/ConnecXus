const mysql = require('mysql2/promise');
mysql.createConnection({user: 'root', database: 'connecxus_db'}).then(async c => {
  try {
    await c.query("ALTER TABLE users ADD COLUMN suspended_until DATETIME DEFAULT NULL");
    await c.query("ALTER TABLE users ADD COLUMN ban_reason TEXT DEFAULT NULL");
    console.log('Ban system schema updated successfully');
    process.exit(0);
  } catch(e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
      process.exit(0);
    }
    console.error(e.message);
    process.exit(1);
  }
});
