const mysql = require('mysql2/promise');
mysql.createConnection({user: 'root', database: 'connecxus_db'}).then(async c => {
  try {
    await c.query("ALTER TABLE reports ADD COLUMN target_type ENUM('user', 'post', 'comment', 'message', 'community') NOT NULL DEFAULT 'user' AFTER reporter_id");
    await c.query("ALTER TABLE reports ADD COLUMN reported_message_id INT UNSIGNED DEFAULT NULL AFTER reported_comment_id");
    await c.query("ALTER TABLE reports ADD COLUMN reported_community_id INT UNSIGNED DEFAULT NULL AFTER reported_message_id");
    await c.query("ALTER TABLE reports ADD COLUMN community_id INT UNSIGNED DEFAULT NULL AFTER reported_community_id");
    await c.query("ALTER TABLE reports ADD CONSTRAINT fk_reports_reported_message FOREIGN KEY (reported_message_id) REFERENCES messages(id) ON DELETE SET NULL");
    await c.query("ALTER TABLE reports ADD CONSTRAINT fk_reports_reported_community FOREIGN KEY (reported_community_id) REFERENCES communities(id) ON DELETE SET NULL");
    await c.query("ALTER TABLE reports ADD CONSTRAINT fk_reports_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE");
    console.log('Schema updated successfully');
    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
});
