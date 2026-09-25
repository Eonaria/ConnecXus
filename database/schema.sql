-- ============================================================
--  ConnecXus Database Schema (Production / Current)
--  Engine: MySQL 8.x  |  Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS connecxus_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE connecxus_db;

-- ------------------------------------------------------------
-- 1. users — บัญชีผู้ใช้งาน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)     CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL UNIQUE,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  display_name  VARCHAR(100)    NOT NULL,
  avatar_url    VARCHAR(500)    DEFAULT NULL,
  banner_url    VARCHAR(500)    DEFAULT NULL,
  bio           TEXT            DEFAULT NULL,
  role          ENUM('user','moderator','admin') NOT NULL DEFAULT 'user',
  backup_email  TEXT            DEFAULT NULL,
  is_banned     TINYINT(1)      NOT NULL DEFAULT 0,
  suspended_until DATETIME      DEFAULT NULL,
  banned_at     DATETIME        DEFAULT NULL,
  ban_reason    TEXT            DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_username (username),
  INDEX idx_users_email    (email),
  INDEX idx_users_role     (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. user_followers — ความสัมพันธ์การติดตาม
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_followers (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  follower_id   INT UNSIGNED    NOT NULL COMMENT 'คนที่กดติดตาม',
  following_id  INT UNSIGNED    NOT NULL COMMENT 'เจ้าของโปรไฟล์ที่ถูกติดตาม',
  created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_followers (follower_id, following_id),
  INDEX idx_uf_follower  (follower_id),
  INDEX idx_uf_following (following_id),
  CONSTRAINT fk_uf_follower  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_uf_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. communities — กลุ่มชุมชน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communities (
  id                     INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name                   VARCHAR(100)    NOT NULL,
  slug                   VARCHAR(100)    NOT NULL UNIQUE,
  description            TEXT            DEFAULT NULL,
  avatar_url             VARCHAR(500)    DEFAULT NULL,
  banner_url             VARCHAR(500)    DEFAULT NULL,
  owner_id               INT UNSIGNED    NOT NULL,
  is_private             TINYINT(1)      NOT NULL DEFAULT 0,
  is_hidden              TINYINT(1)      NOT NULL DEFAULT 0,
  is_suspended           TINYINT(1)      NOT NULL DEFAULT 0,
  is_community_only_feed TINYINT(1)      NOT NULL DEFAULT 0,
  members_only_feed      TINYINT(1)      NOT NULL DEFAULT 1,
  created_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_communities_slug  (slug),
  INDEX idx_communities_owner (owner_id),
  CONSTRAINT fk_communities_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. community_members — สมาชิกของแต่ละชุมชน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_members (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  community_id   INT UNSIGNED    NOT NULL,
  user_id        INT UNSIGNED    NOT NULL,
  role           ENUM('member','moderator','owner') NOT NULL DEFAULT 'member',
  status         ENUM('active','pending','banned')  NOT NULL DEFAULT 'active',
  joined_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_community_member (community_id, user_id),
  INDEX idx_cm_community (community_id),
  INDEX idx_cm_user      (user_id),
  CONSTRAINT fk_cm_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  CONSTRAINT fk_cm_user      FOREIGN KEY (user_id)      REFERENCES users(id)       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. community_invites — ลิงก์เชิญเข้าชุมชน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_invites (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  community_id   INT NOT NULL,
  creator_id     INT NOT NULL,
  code           VARCHAR(32) NOT NULL UNIQUE,
  expires_at     DATETIME NULL,
  max_uses       INT NULL,
  use_count      INT DEFAULT 0,
  is_active      TINYINT(1) DEFAULT 1,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invite_code (code),
  INDEX idx_invite_comm (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. posts — โพสต์
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id                 INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id            INT UNSIGNED    NOT NULL,
  community_id       INT UNSIGNED    DEFAULT NULL,
  content            TEXT            NOT NULL,
  image_url          VARCHAR(500)    DEFAULT NULL,
  is_community_only  TINYINT(1)      NOT NULL DEFAULT 0,
  visibility         ENUM('public','followers','mutual','private') NOT NULL DEFAULT 'public',
  is_deleted         TINYINT(1)      NOT NULL DEFAULT 0,
  created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_posts_user      (user_id),
  INDEX idx_posts_community (community_id),
  INDEX idx_posts_created   (created_at DESC),
  CONSTRAINT fk_posts_user      FOREIGN KEY (user_id)      REFERENCES users(id)       ON DELETE CASCADE,
  CONSTRAINT fk_posts_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. post_likes — การกดถูกใจโพสต์
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_likes (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  post_id     INT UNSIGNED    NOT NULL,
  user_id     INT UNSIGNED    NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_post_like (post_id, user_id),
  INDEX idx_likes_post (post_id),
  INDEX idx_likes_user (user_id),
  CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. post_bookmarks — การบันทึกโพสต์
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  post_id     INT UNSIGNED    NOT NULL,
  user_id     INT UNSIGNED    NOT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_post_bookmark (post_id, user_id),
  INDEX idx_bookmarks_post (post_id),
  INDEX idx_bookmarks_user (user_id),
  CONSTRAINT fk_bookmarks_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. comments — ความคิดเห็นบนโพสต์
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  post_id     INT UNSIGNED    NOT NULL,
  user_id     INT UNSIGNED    NOT NULL,
  parent_id   INT UNSIGNED    DEFAULT NULL,
  content     TEXT            NOT NULL,
  is_deleted  TINYINT(1)      NOT NULL DEFAULT 0,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_comments_post   (post_id),
  INDEX idx_comments_user   (user_id),
  INDEX idx_comments_parent (parent_id),
  CONSTRAINT fk_comments_post   FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user   FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. conversations — ห้องสนทนา (แชท)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        VARCHAR(50) DEFAULT 'direct',
  name        VARCHAR(255) DEFAULT NULL,
  avatar_url  VARCHAR(500) DEFAULT NULL,
  theme_color VARCHAR(50) DEFAULT 'var(--brand)',
  quick_emoji VARCHAR(10) DEFAULT '👍',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. conversation_participants — ผู้เข้าร่วมห้องสนทนา
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id INT NOT NULL,
  user_id         INT NOT NULL,
  role            VARCHAR(20) DEFAULT 'member',
  last_read_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_muted        BOOLEAN DEFAULT FALSE,
  joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  INDEX idx_cp_conversation (conversation_id),
  INDEX idx_cp_user         (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. messages — ข้อความแชท
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  content         TEXT,
  image_url       VARCHAR(500) DEFAULT NULL,
  audio_url       VARCHAR(500) DEFAULT NULL,
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_edited       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_conversation (conversation_id),
  INDEX idx_messages_sender       (sender_id),
  INDEX idx_messages_created      (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. notifications — การแจ้งเตือน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED    NOT NULL,
  sender_id        INT UNSIGNED    NOT NULL,
  type             ENUM('like','comment','follow','new_post') NOT NULL,
  post_id          INT UNSIGNED    DEFAULT NULL,
  is_read          BOOLEAN         DEFAULT FALSE,
  created_at       DATETIME        DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notifications_user    (user_id),
  INDEX idx_notifications_read    (user_id, is_read),
  INDEX idx_notifications_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. reports — รายงานปัญหา (รวมทุกประเภท)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id                     INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  reporter_id            INT UNSIGNED    NOT NULL,
  target_type            ENUM('user','post','comment','message','community') NOT NULL DEFAULT 'user',
  reported_user_id       INT UNSIGNED    DEFAULT NULL,
  reported_post_id       INT UNSIGNED    DEFAULT NULL,
  reported_comment_id    INT UNSIGNED    DEFAULT NULL,
  reported_message_id    INT UNSIGNED    DEFAULT NULL,
  reported_community_id  INT UNSIGNED    DEFAULT NULL,
  community_id           INT UNSIGNED    DEFAULT NULL,
  reason                 TEXT            NOT NULL,
  status                 ENUM('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
  is_escalated           TINYINT(1)      NOT NULL DEFAULT 0,
  admin_note             TEXT            DEFAULT NULL,
  created_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_reports_reporter (reporter_id),
  INDEX idx_reports_status   (status),
  INDEX idx_reports_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. user_blocks — การบล็อกผู้ใช้
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id  INT NOT NULL,
  blocked_id  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 16. system_logs — ประวัติการกระทำของ Admin
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_logs (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  admin_id    INT UNSIGNED    NOT NULL,
  action      VARCHAR(100)    NOT NULL,
  target_type VARCHAR(50)     DEFAULT NULL,
  target_id   INT UNSIGNED    DEFAULT NULL,
  details     TEXT            DEFAULT NULL,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_syslogs_admin (admin_id),
  INDEX idx_syslogs_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 17. security_logs — ประวัติความปลอดภัยของผู้ใช้
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  event_type  VARCHAR(100) NOT NULL,
  ip_address  VARCHAR(50) DEFAULT NULL,
  user_agent  TEXT DEFAULT NULL,
  status      ENUM('success', 'failed') NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_seclogs_user (user_id),
  INDEX idx_seclogs_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
