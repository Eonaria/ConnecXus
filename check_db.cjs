const mysql = require('mysql2/promise');

async function checkDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connecxus_db'
  });

  try {
    const [followers] = await connection.query('SELECT * FROM user_followers');
    console.log('Followers:', followers);
  } catch (err) {
    console.error('Error:', err.message);
  }

  await connection.end();
}

checkDb();
