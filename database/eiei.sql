-- =====================================================================
-- ฐานข้อมูลระบบเครือข่ายสังคมออนไลน์ ConnecXus
-- รองรับ MySQL / MariaDB
-- ออกแบบตามขอบเขตโครงงาน: ระบบแชท, ระบบโพสต์/ฟีด, ระบบชุมชน,
-- ระบบแจ้งเตือน, ระบบรายงาน และส่วนผู้ดูแลระบบ
-- =====================================================================

DROP DATABASE IF EXISTS connecxus_db;
CREATE DATABASE connecxus_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE connecxus_db;

-- =====================================================================
-- 1. ตาราง users : เก็บข้อมูลบัญชีผู้ใช้งานทั้งหมด (6.1 - 6.5, 5.1)
-- =====================================================================
CREATE TABLE users (
    user_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    profile_image   VARCHAR(255) DEFAULT NULL,
    bio             VARCHAR(255) DEFAULT NULL,
    role            ENUM('user','admin') NOT NULL DEFAULT 'user',
    status          ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 2. ตาราง follows : ความสัมพันธ์ผู้ติดตาม (6.6.3)
-- =====================================================================
CREATE TABLE follows (
    follower_id     INT UNSIGNED NOT NULL,
    following_id    INT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id)  REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (follower_id <> following_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. ตาราง posts : โพสต์ในฟีดส่วนตัว (6.6.1)
-- =====================================================================
CREATE TABLE posts (
    post_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    content         TEXT,
    image_url       VARCHAR(255) DEFAULT NULL,
    status          ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_posts_user_created (user_id, created_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 4. ตาราง post_likes : การกดถูกใจโพสต์ (6.6.2)
-- =====================================================================
CREATE TABLE post_likes (
    like_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id         INT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_post_user_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 5. ตาราง post_comments : ความคิดเห็นบนโพสต์ (6.6.2)
-- =====================================================================
CREATE TABLE post_comments (
    comment_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id         INT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    content         TEXT NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 6. ตาราง communities : ข้อมูลกลุ่มชุมชน (6.8.1 - 6.8.2)
-- =====================================================================
CREATE TABLE communities (
    community_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    cover_image     VARCHAR(255) DEFAULT NULL,
    creator_id      INT UNSIGNED NOT NULL,
    status          ENUM('active','suspended','deleted') NOT NULL DEFAULT 'active',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 7. ตาราง community_members : สมาชิกในแต่ละชุมชน (6.8.1 - 6.8.2)
-- =====================================================================
CREATE TABLE community_members (
    community_id    INT UNSIGNED NOT NULL,
    user_id         INT UNSIGNED NOT NULL,
    member_role     ENUM('owner','admin','member') NOT NULL DEFAULT 'member',
    joined_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id),
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 8. ตาราง community_posts : โพสต์ภายในชุมชน (6.8.3)
-- =====================================================================
CREATE TABLE community_posts (
    community_post_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    community_id        INT UNSIGNED NOT NULL,
    user_id              INT UNSIGNED NOT NULL,
    content              TEXT,
    image_url            VARCHAR(255) DEFAULT NULL,
    status               ENUM('visible','hidden','deleted') NOT NULL DEFAULT 'visible',
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 9. ตาราง community_post_comments : คอมเมนต์บนโพสต์ในชุมชน (6.8.3)
-- =====================================================================
CREATE TABLE community_post_comments (
    comment_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    community_post_id   INT UNSIGNED NOT NULL,
    user_id              INT UNSIGNED NOT NULL,
    content              TEXT NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_post_id) REFERENCES community_posts(community_post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- 10. ตาราง messages : ระบบแชทส่วนตัวแบบเรียลไทม์ (6.7)
-- =====================================================================
CREATE TABLE messages (
    message_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id       INT UNSIGNED NOT NULL,
    receiver_id     INT UNSIGNED NOT NULL,
    content         TEXT NOT NULL,
    is_read         TINYINT(1) NOT NULL DEFAULT 0,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_messages_conversation (sender_id, receiver_id, created_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 11. ตาราง notifications : ระบบการแจ้งเตือน (6.9)
-- ใช้ reference_type/reference_id แบบ polymorphic เพื่อรองรับ
-- การแจ้งเตือนหลายประเภทในตารางเดียว (ข้อความ, คอมเมนต์, ไลก์, กิจกรรมชุมชน)
-- =====================================================================
CREATE TABLE notifications (
    notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED NOT NULL,     -- ผู้รับแจ้งเตือน
    actor_id         INT UNSIGNED NOT NULL,     -- ผู้ก่อให้เกิดกิจกรรม
    type             ENUM('message','comment','like','community_post','community_invite','report_update') NOT NULL,
    reference_type   VARCHAR(30),                -- เช่น 'post','community_post','message'
    reference_id     INT UNSIGNED,
    content          VARCHAR(255),
    is_read          TINYINT(1) NOT NULL DEFAULT 0,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- =====================================================================
-- 12. ตาราง reports : การรายงานเนื้อหา/ผู้ใช้ที่ไม่เหมาะสม (6.10, 5.2.2)
-- =====================================================================
CREATE TABLE reports (
    report_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id       INT UNSIGNED NOT NULL,
    target_type       ENUM('post','community_post','user','community') NOT NULL,
    target_id         INT UNSIGNED NOT NULL,
    reason            VARCHAR(500) NOT NULL,
    status            ENUM('pending','reviewing','resolved','rejected') NOT NULL DEFAULT 'pending',
    reviewed_by       INT UNSIGNED DEFAULT NULL,
    reviewed_at       DATETIME DEFAULT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id)  REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by)  REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 13. ตาราง admin_action_logs : บันทึกการกระทำของผู้ดูแลระบบ (5.1, 5.2)
-- =====================================================================
CREATE TABLE admin_action_logs (
    log_id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id          INT UNSIGNED NOT NULL,
    action            VARCHAR(100) NOT NULL,      -- เช่น 'delete_post','suspend_user'
    target_type       VARCHAR(30) NOT NULL,
    target_id         INT UNSIGNED NOT NULL,
    detail            VARCHAR(255),
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =====================================================================
-- ข้อมูลตัวอย่างสำหรับทดสอบระบบ (Sample Data)
-- =====================================================================

-- ผู้ใช้งานตัวอย่าง (รหัสผ่านจำลองเป็น hash แบบง่าย เพื่อการทดสอบเท่านั้น)
INSERT INTO users (username, email, password_hash, full_name, role, status) VALUES
('admin01',   'admin@connecxus.com',   '$2y$10$examplehashadmin000000000000000000000000', 'ผู้ดูแลระบบ',      'admin', 'active'),
('panupong',  'panupong@example.com',  '$2y$10$examplehashuser0000000000000000000000001', 'ภาณุพงศ์ เกสีสังข์', 'user',  'active'),
('somsri',    'somsri@example.com',    '$2y$10$examplehashuser0000000000000000000000002', 'สมศรี ใจดี',        'user',  'active'),
('anan',      'anan@example.com',      '$2y$10$examplehashuser0000000000000000000000003', 'อนันต์ สุขใจ',       'user',  'active');

-- ความสัมพันธ์การติดตาม
INSERT INTO follows (follower_id, following_id) VALUES
(2, 3), (2, 4), (3, 2);

-- โพสต์ในฟีดส่วนตัว
INSERT INTO posts (user_id, content) VALUES
(2, 'วันนี้เริ่มพัฒนาโครงงาน ConnecXus แล้วครับ!'),
(3, 'ใครสนใจกลุ่มคนรักการเขียนโปรแกรมบ้าง เข้ามาคุยกันได้เลย');

-- ไลก์และคอมเมนต์
INSERT INTO post_likes (post_id, user_id) VALUES (1, 3), (1, 4);
INSERT INTO post_comments (post_id, user_id, content) VALUES
(1, 3, 'สู้ๆ นะครับ โครงงานน่าสนใจมาก'),
(2, 2, 'ขอเข้าร่วมด้วยคนครับ');

-- ชุมชนตัวอย่าง
INSERT INTO communities (name, description, creator_id) VALUES
('นักพัฒนาเว็บไซต์มือใหม่', 'พื้นที่พูดคุยแลกเปลี่ยนความรู้ด้าน Web Development', 3);

INSERT INTO community_members (community_id, user_id, member_role) VALUES
(1, 3, 'owner'),
(1, 2, 'member'),
(1, 4, 'member');

INSERT INTO community_posts (community_id, user_id, content) VALUES
(1, 3, 'สวัสดีสมาชิกทุกคน ยินดีต้อนรับเข้าสู่กลุ่มครับ');

INSERT INTO community_post_comments (community_post_id, user_id, content) VALUES
(1, 2, 'ขอบคุณครับ ดีใจที่ได้เข้าร่วม');

-- ข้อความแชทส่วนตัว
INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
(2, 3, 'สวัสดีครับ สนใจกลุ่มที่สร้างไว้มากเลย', 1),
(3, 2, 'ยินดีต้อนรับครับ เชิญเข้าร่วมได้เลย', 0);

-- การแจ้งเตือน
INSERT INTO notifications (user_id, actor_id, type, reference_type, reference_id, content) VALUES
(2, 3, 'message', 'message', 1, 'somsri ส่งข้อความถึงคุณ'),
(3, 4, 'like', 'post', 1, 'anan กดถูกใจโพสต์ของคุณ');

-- รายงานตัวอย่าง
INSERT INTO reports (reporter_id, target_type, target_id, reason, status) VALUES
(4, 'post', 2, 'เนื้อหาไม่เหมาะสม/สแปม', 'pending');

-- บันทึกการทำงานของแอดมิน
INSERT INTO admin_action_logs (admin_id, action, target_type, target_id, detail) VALUES
(1, 'review_report', 'report', 1, 'ตรวจสอบรายงานเบื้องต้นแล้ว รอดำเนินการเพิ่มเติม');

-- =====================================================================
-- จบไฟล์
-- =====================================================================connecxus_db