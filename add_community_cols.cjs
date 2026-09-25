const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'connecxus_db'
  });

  try {
    console.log('Adding bg_color and icon to communities table...');
    await connection.query('ALTER TABLE communities ADD COLUMN bg_color VARCHAR(50) DEFAULT NULL');
    await connection.query('ALTER TABLE communities ADD COLUMN icon VARCHAR(20) DEFAULT NULL');
    console.log('Migration successful.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    await connection.end();
  }
}

migrate();
