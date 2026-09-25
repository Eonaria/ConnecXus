export default defineNitroPlugin(async (nitroApp) => {
  try {
    const db = getDb()

    // Ensure username column is case-sensitive (COLLATE utf8mb4_bin)
    try {
      await db.query(`ALTER TABLE users MODIFY username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL`)
    } catch (e) {}

    await db.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) DEFAULT 'direct',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

  try {
    await db.query(`ALTER TABLE conversations ADD COLUMN type VARCHAR(50) DEFAULT 'direct'`)
  } catch (e) {}

  try { await db.query(`ALTER TABLE conversations ADD COLUMN name VARCHAR(255) DEFAULT NULL`) } catch (e) {}
  try { await db.query(`ALTER TABLE conversations ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL`) } catch (e) {}

  try {
    await db.query(`ALTER TABLE conversations ADD COLUMN theme_color VARCHAR(50) DEFAULT 'var(--brand)'`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE conversations ADD COLUMN quick_emoji VARCHAR(10) DEFAULT '👍'`)
  } catch (e) {}

  await db.query(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id INT,
      user_id INT,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (conversation_id, user_id)
    )
  `)

  try { await db.query(`ALTER TABLE conversation_participants ADD COLUMN role VARCHAR(20) DEFAULT 'member'`) } catch (e) {}

  try {
    await db.query(`ALTER TABLE conversation_participants ADD COLUMN last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE conversation_participants ADD COLUMN is_muted BOOLEAN DEFAULT FALSE`)
  } catch (e) {}

  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id INT,
      sender_id INT,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  try {
    await db.query(`ALTER TABLE messages ADD COLUMN image_url VARCHAR(500) DEFAULT NULL`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE messages ADD COLUMN audio_url VARCHAR(500) DEFAULT NULL`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE messages ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE`)
  } catch (e) {}

    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        sender_id INT UNSIGNED NOT NULL,
        type ENUM('like', 'comment', 'follow', 'new_post') NOT NULL,
        post_id INT UNSIGNED NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    try { await db.query(`ALTER TABLE notifications MODIFY COLUMN type ENUM('like', 'comment', 'follow', 'new_post') NOT NULL`) } catch (e) {}

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_blocks (
      blocker_id INT,
      blocked_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (blocker_id, blocked_id)
    )
  `)

  // --- Account Security Additions ---
  try { await db.query(`ALTER TABLE users ADD COLUMN backup_email TEXT DEFAULT NULL`) } catch(e) {}

  await db.query(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      ip_address VARCHAR(50),
      user_agent TEXT,
      status ENUM('success', 'failed') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // --- Community Hidden & Invites Additions ---
  try {
    await db.query(`ALTER TABLE communities ADD COLUMN is_hidden TINYINT(1) DEFAULT 0`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE communities ADD COLUMN is_community_only_feed TINYINT(1) DEFAULT 0`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE communities ADD COLUMN members_only_feed TINYINT(1) DEFAULT 1`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE posts ADD COLUMN is_community_only TINYINT(1) DEFAULT 0`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE posts ADD COLUMN visibility ENUM('public', 'followers', 'mutual', 'private') DEFAULT 'public'`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE posts MODIFY COLUMN image_url TEXT DEFAULT NULL`)
  } catch (e) {}

  try {
    await db.query(`ALTER TABLE comments MODIFY COLUMN image_url TEXT DEFAULT NULL`)
  } catch (e) {}

  await db.query(`
    CREATE TABLE IF NOT EXISTS community_invites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      community_id INT NOT NULL,
      creator_id INT NOT NULL,
      code VARCHAR(32) NOT NULL UNIQUE,
      expires_at DATETIME NULL,
      max_uses INT NULL,
      use_count INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_invite_code (code),
      INDEX idx_invite_comm (community_id)
    )
  `)

  // --- Comment Likes, Reposts, Bookmarks Tables ---
  await db.query(`
    CREATE TABLE IF NOT EXISTS comment_likes (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      comment_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_comment_user (comment_id, user_id),
      INDEX idx_comment_likes_cmt (comment_id),
      INDEX idx_comment_likes_usr (user_id)
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS comment_reposts (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      comment_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_comment_repost (comment_id, user_id),
      INDEX idx_comment_reposts_cmt (comment_id),
      INDEX idx_comment_reposts_usr (user_id)
    )
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS comment_bookmarks (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      comment_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_comment_bookmark (comment_id, user_id),
      INDEX idx_comment_bookmarks_cmt (comment_id),
      INDEX idx_comment_bookmarks_usr (user_id)
    )
  `)

  } catch (error: any) {
    console.error('[DB-SETUP ERROR DETAILS FULL]:', error)
  }
})
