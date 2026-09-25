const mysql = require('mysql2/promise');

async function testDelete() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connecxus_db'
  });

  const currentUser = { userId: 1 };
  const targetId = 4;

  try {
    const [existRows] = await connection.query(
      'SELECT id FROM user_followers WHERE follower_id = ? AND following_id = ? LIMIT 1',
      [currentUser.userId, targetId]
    );
    const exists = existRows.length > 0;
    console.log('Exists?', exists);

    if (exists) {
      const [res] = await connection.query(
        'DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?',
        [currentUser.userId, targetId]
      );
      console.log('Deleted!', res);
    } else {
      const [res] = await connection.query(
        'INSERT INTO user_followers (follower_id, following_id) VALUES (?, ?)',
        [currentUser.userId, targetId]
      );
      console.log('Inserted!', res);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  await connection.end();
}

testDelete();
