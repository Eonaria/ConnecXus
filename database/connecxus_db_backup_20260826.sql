-- ConnecXus Full Database Backup
-- Date: 2026-08-26T13:45:57.347Z
-- Database: connecxus_db

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for `admin_reports`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admin_reports`;
CREATE TABLE `admin_reports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `reporter_id` int unsigned NOT NULL,
  `target_type` enum('post','comment','user','community') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int unsigned NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','resolved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  `resolved_by` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `auth_otps`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `auth_otps`;
CREATE TABLE `auth_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int DEFAULT '0',
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `comments`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `parent_id` int unsigned DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_comments_post` (`post_id`),
  KEY `idx_comments_user` (`user_id`),
  KEY `idx_comments_parent` (`parent_id`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `comments`
INSERT INTO `comments` (`id`, `post_id`, `user_id`, `parent_id`, `content`, `is_deleted`, `created_at`, `image_url`) VALUES (1, 4, 10, NULL, 'จริงๆ', 0, '2026-08-25 10:16:20', NULL);

-- --------------------------------------------------------
-- Table structure for `communities`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `communities`;
CREATE TABLE `communities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_id` int unsigned NOT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_suspended` tinyint(1) NOT NULL DEFAULT '0',
  `suspended_until` datetime DEFAULT NULL,
  `suspend_reason` text COLLATE utf8mb4_unicode_ci,
  `bg_color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rules` json DEFAULT NULL,
  `banner_position_y` int DEFAULT '50',
  `is_hidden` tinyint(1) DEFAULT '0',
  `is_community_only_feed` tinyint(1) DEFAULT '0',
  `members_only_feed` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_communities_slug` (`slug`),
  KEY `idx_communities_owner` (`owner_id`),
  CONSTRAINT `fk_communities_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `communities`
INSERT INTO `communities` (`id`, `name`, `slug`, `description`, `avatar_url`, `banner_url`, `owner_id`, `is_private`, `created_at`, `is_suspended`, `suspended_until`, `suspend_reason`, `bg_color`, `icon`, `rules`, `banner_position_y`, `is_hidden`, `is_community_only_feed`, `members_only_feed`) VALUES (3, 'ovo', 'ovo', '', '/uploads/1787632015520-897.jpg', '/uploads/1787631413882-58.jpg', 1, 1, '2026-08-24 17:45:51', 0, NULL, NULL, '#8b5cf6', '🚀', NULL, 50, 1, 1, 0);
INSERT INTO `communities` (`id`, `name`, `slug`, `description`, `avatar_url`, `banner_url`, `owner_id`, `is_private`, `created_at`, `is_suspended`, `suspended_until`, `suspend_reason`, `bg_color`, `icon`, `rules`, `banner_position_y`, `is_hidden`, `is_community_only_feed`, `members_only_feed`) VALUES (5, 'ez', 'ez', NULL, NULL, NULL, 1, 1, '2026-08-25 05:57:00', 0, NULL, NULL, '#ef4444', 'gg', NULL, 50, 1, 0, 1);

-- --------------------------------------------------------
-- Table structure for `community_invites`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `community_invites`;
CREATE TABLE `community_invites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `community_id` int NOT NULL,
  `creator_id` int NOT NULL,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `max_uses` int DEFAULT NULL,
  `use_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_invite_code` (`code`),
  KEY `idx_invite_comm` (`community_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `community_members`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `community_members`;
CREATE TABLE `community_members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `community_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `role` enum('member','moderator','owner') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `status` enum('active','pending','banned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_community_member` (`community_id`,`user_id`),
  KEY `idx_cm_community` (`community_id`),
  KEY `idx_cm_user` (`user_id`),
  CONSTRAINT `fk_cm_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `community_members`
INSERT INTO `community_members` (`id`, `community_id`, `user_id`, `role`, `status`, `joined_at`) VALUES (3, 3, 1, 'owner', 'active', '2026-08-24 17:45:51');
INSERT INTO `community_members` (`id`, `community_id`, `user_id`, `role`, `status`, `joined_at`) VALUES (6, 5, 1, 'owner', 'active', '2026-08-25 05:57:00');
INSERT INTO `community_members` (`id`, `community_id`, `user_id`, `role`, `status`, `joined_at`) VALUES (13, 3, 11, 'member', 'active', '2026-08-26 06:28:11');

-- --------------------------------------------------------
-- Table structure for `conversation_participants`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `conversation_participants`;
CREATE TABLE `conversation_participants` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `last_read_at` datetime DEFAULT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_muted` tinyint(1) DEFAULT '0',
  `theme_color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'var(--brand)',
  `quick_emoji` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '?',
  `wallpaper_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv_participant` (`conversation_id`,`user_id`),
  KEY `idx_cp_conversation` (`conversation_id`),
  KEY `idx_cp_user` (`user_id`),
  CONSTRAINT `fk_cp_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `conversation_participants`
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (1, 1, 2, '2026-08-25 07:23:29', '2026-08-25 07:13:31', 0, 'var(--brand)', '👍', '/uploads/1787734510768-643.jpg', 0, NULL, 'member');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (2, 1, 1, '2026-08-25 08:10:11', '2026-08-25 07:13:31', 0, 'var(--brand)', '👍', NULL, 0, NULL, 'member');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (3, 2, 1, '2026-08-25 09:04:29', '2026-08-25 08:10:19', 0, '#ef4444', '👍', '/uploads/1787649126818-759.jpg', 0, NULL, 'member');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (4, 2, 6, '2026-08-25 09:04:35', '2026-08-25 08:10:19', 0, '#8b5cf6', '👍', '/uploads/1787649114439-150.jfif', 0, NULL, 'member');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (5, 3, 6, '2026-08-25 09:18:05', '2026-08-25 09:12:35', 0, 'var(--brand)', '👍', '/uploads/1787649466494-510.jpeg', 0, NULL, 'owner');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (6, 3, 1, NULL, '2026-08-25 09:12:35', 0, 'var(--brand)', '👍', '/uploads/1787649466494-510.jpeg', 0, NULL, 'member');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (7, 4, 10, NULL, '2026-08-25 10:20:58', 0, 'var(--brand)', '👍', NULL, 0, NULL, 'member');
INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `joined_at`, `is_muted`, `theme_color`, `quick_emoji`, `wallpaper_url`, `is_archived`, `deleted_at`, `role`) VALUES (8, 4, 1, '2026-08-25 10:21:01', '2026-08-25 10:20:58', 0, 'var(--brand)', '👍', NULL, 0, NULL, 'member');

-- --------------------------------------------------------
-- Table structure for `conversations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `theme_color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'var(--brand)',
  `quick_emoji` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '?',
  `wallpaper_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `community_id` int unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_conv_community` (`community_id`),
  CONSTRAINT `fk_conv_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `conversations`
INSERT INTO `conversations` (`id`, `created_at`, `type`, `theme_color`, `quick_emoji`, `wallpaper_url`, `community_id`, `name`, `avatar_url`) VALUES (1, '2026-08-25 07:13:31', 'direct', 'var(--brand)', '👍', NULL, NULL, NULL, NULL);
INSERT INTO `conversations` (`id`, `created_at`, `type`, `theme_color`, `quick_emoji`, `wallpaper_url`, `community_id`, `name`, `avatar_url`) VALUES (2, '2026-08-25 08:10:19', 'direct', 'var(--brand)', '👍', NULL, NULL, NULL, NULL);
INSERT INTO `conversations` (`id`, `created_at`, `type`, `theme_color`, `quick_emoji`, `wallpaper_url`, `community_id`, `name`, `avatar_url`) VALUES (3, '2026-08-25 09:12:34', 'group', 'var(--brand)', '👍', '/uploads/1787649466494-510.jpeg', NULL, 'แมว', '/uploads/1787649144531-66.jpeg');
INSERT INTO `conversations` (`id`, `created_at`, `type`, `theme_color`, `quick_emoji`, `wallpaper_url`, `community_id`, `name`, `avatar_url`) VALUES (4, '2026-08-25 10:20:58', 'direct', 'var(--brand)', '👍', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------
-- Table structure for `follows`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `follower_id` int unsigned NOT NULL,
  `following_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_follows` (`follower_id`,`following_id`),
  KEY `idx_follows_follower` (`follower_id`),
  KEY `idx_follows_following` (`following_id`),
  CONSTRAINT `fk_follows_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follows_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `message_reports`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `message_reports`;
CREATE TABLE `message_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int DEFAULT NULL,
  `reporter_id` int DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `messages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` int unsigned NOT NULL,
  `sender_id` int unsigned NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_edited` tinyint(1) DEFAULT '0',
  `audio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation` (`conversation_id`),
  KEY `idx_messages_sender` (`sender_id`),
  KEY `idx_messages_created` (`created_at` DESC),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `messages`
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (1, 1, 2, '👍', NULL, 0, '2026-08-25 07:13:31', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (2, 1, 2, '👍', NULL, 0, '2026-08-25 07:23:26', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (3, 1, 2, '👍', NULL, 0, '2026-08-25 07:23:29', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (4, 2, 1, '👍', NULL, 0, '2026-08-25 08:10:19', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (5, 2, 6, '👍', NULL, 0, '2026-08-25 08:10:40', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (6, 2, 1, '👍', NULL, 0, '2026-08-25 08:10:47', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (7, 2, 6, '👍', NULL, 0, '2026-08-25 08:10:50', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (8, 2, 6, '👍', NULL, 0, '2026-08-25 08:46:01', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (9, 2, 6, '👍', NULL, 0, '2026-08-25 08:46:05', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (10, 2, 6, '👍', NULL, 0, '2026-08-25 08:46:05', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (11, 2, 6, '👍', NULL, 0, '2026-08-25 08:49:24', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (12, 2, 1, '👍', NULL, 0, '2026-08-25 08:50:04', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (13, 2, 1, '👍', NULL, 0, '2026-08-25 08:50:06', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (14, 2, 1, '👍', NULL, 0, '2026-08-25 08:50:08', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (15, 2, 6, '👍', NULL, 0, '2026-08-25 08:50:23', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (16, 2, 1, '👍', NULL, 0, '2026-08-25 08:50:25', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (17, 2, 6, '👍', NULL, 0, '2026-08-25 08:50:40', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (18, 2, 1, '👍', NULL, 0, '2026-08-25 08:50:46', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (19, 2, 1, '👍', NULL, 0, '2026-08-25 08:56:25', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (20, 2, 6, '👍', NULL, 0, '2026-08-25 08:56:35', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (21, 2, 1, '👍', NULL, 0, '2026-08-25 08:56:54', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (22, 2, 6, '👍', NULL, 0, '2026-08-25 08:56:56', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (23, 2, 6, '👍', NULL, 0, '2026-08-25 09:00:30', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (24, 2, 1, '👍', NULL, 0, '2026-08-25 09:00:37', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (25, 2, 6, 'นอน', NULL, 0, '2026-08-25 09:04:29', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (26, 2, 1, 'นอน', NULL, 0, '2026-08-25 09:04:35', 0, 0, NULL, 0);
INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `image_url`, `is_deleted`, `created_at`, `is_pinned`, `is_edited`, `audio_url`, `is_read`) VALUES (27, 3, 1, 'เพื่อน', NULL, 0, '2026-08-25 09:18:05', 0, 0, NULL, 0);

-- --------------------------------------------------------
-- Table structure for `notifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `sender_id` int unsigned DEFAULT NULL,
  `type` enum('like','comment','reply','follow','message','community_join','mention','new_post') COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` int unsigned DEFAULT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`user_id`,`is_read`),
  KEY `idx_notifications_created` (`created_at` DESC),
  KEY `fk_notifications_actor` (`sender_id`),
  CONSTRAINT `fk_notifications_actor` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `notifications`
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (1, 2, 1, 'follow', NULL, NULL, 1, '2026-08-25 07:13:18');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (2, 1, 2, 'follow', NULL, NULL, 1, '2026-08-25 07:13:22');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (3, 1, 6, 'follow', NULL, NULL, 1, '2026-08-25 08:09:54');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (4, 6, 1, 'follow', NULL, NULL, 1, '2026-08-25 08:10:09');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (5, 1, 6, 'new_post', 2, NULL, 1, '2026-08-25 09:23:36');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (6, 1, 6, 'new_post', 3, NULL, 1, '2026-08-25 09:24:06');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (7, 1, 6, 'new_post', 4, NULL, 1, '2026-08-25 09:29:18');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (8, 6, 10, 'like', 4, NULL, 0, '2026-08-25 10:16:13');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (9, 6, 10, 'comment', 4, NULL, 0, '2026-08-25 10:16:21');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (10, 1, 10, 'follow', NULL, NULL, 1, '2026-08-25 10:20:41');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (11, 10, 1, 'follow', NULL, NULL, 1, '2026-08-25 10:20:49');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (12, 2, 1, 'new_post', 5, NULL, 1, '2026-08-26 06:56:57');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (13, 6, 1, 'new_post', 5, NULL, 0, '2026-08-26 06:56:57');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (14, 10, 1, 'new_post', 5, NULL, 0, '2026-08-26 06:56:57');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (18, 2, 1, 'new_post', 7, NULL, 1, '2026-08-26 07:38:11');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (19, 6, 1, 'new_post', 7, NULL, 0, '2026-08-26 07:38:11');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (20, 10, 1, 'new_post', 7, NULL, 0, '2026-08-26 07:38:11');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (21, 2, 1, 'new_post', 8, NULL, 1, '2026-08-26 08:25:17');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (22, 6, 1, 'new_post', 8, NULL, 0, '2026-08-26 08:25:17');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (23, 10, 1, 'new_post', 8, NULL, 0, '2026-08-26 08:25:17');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (24, 2, 1, 'new_post', 9, NULL, 1, '2026-08-26 08:26:00');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (25, 6, 1, 'new_post', 9, NULL, 0, '2026-08-26 08:26:00');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (26, 10, 1, 'new_post', 9, NULL, 0, '2026-08-26 08:26:00');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (27, 2, 1, 'new_post', 10, NULL, 1, '2026-08-26 08:40:25');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (28, 6, 1, 'new_post', 10, NULL, 0, '2026-08-26 08:40:25');
INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `type`, `post_id`, `reference_type`, `is_read`, `created_at`) VALUES (29, 10, 1, 'new_post', 10, NULL, 0, '2026-08-26 08:40:25');

-- --------------------------------------------------------
-- Table structure for `post_bookmarks`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `post_bookmarks`;
CREATE TABLE `post_bookmarks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `post_id` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_post` (`user_id`,`post_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `post_bookmarks`
INSERT INTO `post_bookmarks` (`id`, `user_id`, `post_id`, `created_at`) VALUES (1, 10, 4, '2026-08-25 10:17:52');

-- --------------------------------------------------------
-- Table structure for `post_likes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `post_likes`;
CREATE TABLE `post_likes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `post_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_post_like` (`post_id`,`user_id`),
  KEY `idx_likes_post` (`post_id`),
  KEY `idx_likes_user` (`user_id`),
  CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `post_likes`
INSERT INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`) VALUES (1, 4, 10, '2026-08-25 10:16:13');

-- --------------------------------------------------------
-- Table structure for `posts`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `community_id` int unsigned DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `repost_of_id` int unsigned DEFAULT NULL,
  `is_repost` tinyint(1) DEFAULT '0',
  `is_community_only` tinyint(1) DEFAULT '0',
  `visibility` enum('public','followers','mutual','private') COLLATE utf8mb4_unicode_ci DEFAULT 'public',
  PRIMARY KEY (`id`),
  KEY `idx_posts_user` (`user_id`),
  KEY `idx_posts_community` (`community_id`),
  KEY `idx_posts_created` (`created_at` DESC),
  CONSTRAINT `fk_posts_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `posts`
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (1, 2, NULL, 'นอน', NULL, 1, '2026-08-24 11:53:01', '2026-08-24 11:53:20', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (2, 6, NULL, 'เพื่อน', '/uploads/1787649800934-409.jpg', 0, '2026-08-25 09:23:36', '2026-08-25 09:23:36', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (3, 6, NULL, 'แมว', '/uploads/1787649840686-788.jpeg', 0, '2026-08-25 09:24:06', '2026-08-25 09:24:06', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (4, 6, NULL, 'ไอปลั้กเป็นแกย์ #ปลั้กเป็นเกย์ตัวพ่อ', '/uploads/1787649871691-77.jfif', 0, '2026-08-25 09:29:18', '2026-08-25 09:29:59', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (5, 1, 3, '', '/uploads/1787727415326-382.jpg', 0, '2026-08-26 06:56:57', '2026-08-26 06:56:57', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (6, 1, 3, 'ใจเย็น', '/uploads/1787729831168-18.jpg', 1, '2026-08-26 07:37:40', '2026-08-26 07:38:02', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (7, 1, 3, 'น้ำ', '/uploads/1787729888139-943.jpg', 0, '2026-08-26 07:38:11', '2026-08-26 07:38:11', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (9, 1, 3, '', '/uploads/1787732759273-705.jpg', 0, '2026-08-26 08:26:00', '2026-08-26 08:26:00', NULL, 0, 0, 'public');
INSERT INTO `posts` (`id`, `user_id`, `community_id`, `content`, `image_url`, `is_deleted`, `created_at`, `updated_at`, `repost_of_id`, `is_repost`, `is_community_only`, `visibility`) VALUES (10, 1, NULL, '', '/uploads/1787733611018-259.jpg', 0, '2026-08-26 08:40:25', '2026-08-26 09:20:26', NULL, 0, 0, 'public');

-- --------------------------------------------------------
-- Table structure for `refresh_tokens`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_rt_user` (`user_id`),
  KEY `idx_rt_expires` (`expires_at`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `reports`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `reporter_id` int unsigned NOT NULL,
  `target_type` enum('user','post','comment','message','community') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `reported_user_id` int unsigned DEFAULT NULL,
  `reported_post_id` int unsigned DEFAULT NULL,
  `reported_comment_id` int unsigned DEFAULT NULL,
  `reported_message_id` int unsigned DEFAULT NULL,
  `reported_community_id` int unsigned DEFAULT NULL,
  `community_id` int unsigned DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','reviewed','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `is_escalated` tinyint(1) NOT NULL DEFAULT '0',
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reports_reporter` (`reporter_id`),
  KEY `idx_reports_status` (`status`),
  KEY `fk_reports_reported_user` (`reported_user_id`),
  KEY `fk_reports_reported_post` (`reported_post_id`),
  KEY `fk_reports_reported_comment` (`reported_comment_id`),
  KEY `fk_reports_reported_message` (`reported_message_id`),
  KEY `fk_reports_reported_community` (`reported_community_id`),
  KEY `fk_reports_community` (`community_id`),
  CONSTRAINT `fk_reports_community` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reports_reported_comment` FOREIGN KEY (`reported_comment_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reported_community` FOREIGN KEY (`reported_community_id`) REFERENCES `communities` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reported_message` FOREIGN KEY (`reported_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reported_post` FOREIGN KEY (`reported_post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reported_user` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `reports`
INSERT INTO `reports` (`id`, `reporter_id`, `target_type`, `reported_user_id`, `reported_post_id`, `reported_comment_id`, `reported_message_id`, `reported_community_id`, `community_id`, `reason`, `status`, `is_escalated`, `admin_note`, `created_at`, `updated_at`) VALUES (2, 1, 'user', 6, NULL, NULL, NULL, NULL, NULL, 'สแปม / โฆษณาขยะ - นอน', 'resolved', 0, NULL, '2026-08-25 09:01:15', '2026-08-25 10:13:20');

-- --------------------------------------------------------
-- Table structure for `security_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `security_logs`;
CREATE TABLE `security_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `status` enum('success','failed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `security_logs`
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES (2, 2, 'USERNAME_CHANGED', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success', '2026-08-24 10:54:28');
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES (3, 1, 'EMAIL_CHANGED', NULL, NULL, 'success', '2026-08-26 09:40:25');
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES (4, 11, 'EMAIL_CHANGED', NULL, NULL, 'success', '2026-08-26 09:42:16');
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES (5, 11, 'EMAIL_CHANGED', NULL, NULL, 'success', '2026-08-26 09:47:35');
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES (6, 11, 'EMAIL_CHANGED', NULL, NULL, 'success', '2026-08-26 09:49:12');
INSERT INTO `security_logs` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES (7, 11, 'EMAIL_CHANGED', NULL, NULL, 'success', '2026-08-26 09:49:20');

-- --------------------------------------------------------
-- Table structure for `system_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` int unsigned NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` int unsigned DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_logs_admin` (`admin_id`),
  CONSTRAINT `fk_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `system_logs`
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (1, 1, 'delete_community', 'community', 2, 'ลบชุมชน "Test To Delete" (test-to-delete) โดยผู้สร้างกลุ่ม', '2026-08-24 08:10:16');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (2, 1, 'delete_community', 'community', 1, 'ลบชุมชน "ovo" (ovo) โดยผู้สร้างกลุ่ม', '2026-08-24 08:11:24');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (3, 1, 'change_role', 'user', 2, 'เปลี่ยนสิทธิ์เป็น admin', '2026-08-24 11:12:42');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (4, 1, 'change_role', 'user', 2, 'เปลี่ยนสิทธิ์เป็น user', '2026-08-24 11:12:56');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (5, 1, 'change_role', 'user', 2, 'เปลี่ยนสิทธิ์เป็น admin', '2026-08-24 11:14:34');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (6, 1, 'change_role', 'user', 2, 'เปลี่ยนสิทธิ์เป็น user', '2026-08-24 11:29:00');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (7, 1, 'ban_user', 'user', 2, 'ระงับบัญชีระยะเวลา 24h เหตุผล: นอน', '2026-08-24 11:52:47');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (8, 1, 'delete_post', 'post', 1, 'ลบโพสต์ (ผิดกฎ/ถูกรายงาน)', '2026-08-24 11:53:20');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (9, 1, 'unban_user', 'user', 2, 'ปลดระงับบัญชี', '2026-08-24 19:26:53');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (10, 1, 'ban_user', 'user', 2, 'ระงับบัญชีระยะเวลา 24h เหตุผล: ไปนอน', '2026-08-24 19:48:22');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (11, 1, 'ban_user', 'user', 2, 'ระงับบัญชีระยะเวลา 24h เหตุผล: Realtime Kick Test', '2026-08-24 19:56:59');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (12, 1, 'ban_user', 'user', 2, 'ระงับบัญชีระยะเวลา 24h เหตุผล: นอน', '2026-08-25 02:53:33');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (13, 1, 'ban_user', 'user', 2, 'ระงับบัญชีระยะเวลา 24h เหตุผล: ทดสอบการแบน 24 ชั่วโมงเต็ม', '2026-08-25 03:14:27');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (14, 1, 'ban_user', 'user', 2, 'ระงับบัญชีระยะเวลา 24h เหตุผล: 12', '2026-08-25 03:15:55');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (15, 1, 'unban_user', 'user', 2, 'ปลดระงับบัญชี', '2026-08-25 03:16:10');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (16, 1, 'delete_community', 'community', 4, 'ลบชุมชน "l" (l) โดยผู้สร้างกลุ่ม', '2026-08-25 05:56:28');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (17, 1, 'delete_community', 'community', 6, 'ลบชุมชน "a" (asdadadad) โดยผู้สร้างกลุ่ม', '2026-08-25 05:58:24');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (18, 1, 'change_role', 'user', 10, 'เปลี่ยนสิทธิ์ @armop เป็น admin', '2026-08-25 09:59:23');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (19, 1, 'update_report', 'report', 2, 'อัปเดตสถานะเป็น resolved', '2026-08-25 10:13:20');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (20, 10, 'ban_user', 'user', 9, 'ระงับบัญชี @ooa ระยะเวลา 24h (เหตุผล: 67)', '2026-08-25 10:13:55');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (21, 1, 'ban_user', 'user', 10, 'ระงับบัญชี @armop ระยะเวลา 24h (เหตุผล: 6776)', '2026-08-25 10:15:15');
INSERT INTO `system_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES (22, 1, 'unban_user', 'user', 10, 'ปลดระงับบัญชี @armop', '2026-08-25 10:15:56');

-- --------------------------------------------------------
-- Table structure for `user_blocks`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `user_blocks`;
CREATE TABLE `user_blocks` (
  `blocker_id` int NOT NULL,
  `blocked_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`blocker_id`,`blocked_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_followers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `user_followers`;
CREATE TABLE `user_followers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `follower_id` int unsigned NOT NULL,
  `following_id` int unsigned NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_follow` (`follower_id`,`following_id`),
  KEY `fk_uf_following` (`following_id`),
  CONSTRAINT `fk_uf_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uf_following` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `user_followers`
INSERT INTO `user_followers` (`id`, `follower_id`, `following_id`, `created_at`) VALUES (2, 2, 1, '2026-08-25 07:13:22');
INSERT INTO `user_followers` (`id`, `follower_id`, `following_id`, `created_at`) VALUES (3, 6, 1, '2026-08-25 08:09:54');
INSERT INTO `user_followers` (`id`, `follower_id`, `following_id`, `created_at`) VALUES (4, 1, 6, '2026-08-25 08:10:09');
INSERT INTO `user_followers` (`id`, `follower_id`, `following_id`, `created_at`) VALUES (5, 10, 1, '2026-08-25 10:20:41');
INSERT INTO `user_followers` (`id`, `follower_id`, `following_id`, `created_at`) VALUES (6, 1, 10, '2026-08-25 10:20:49');

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `role` enum('user','moderator','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_banned` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `banner_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suspended_until` datetime DEFAULT NULL,
  `banned_at` datetime DEFAULT NULL,
  `ban_reason` text COLLATE utf8mb4_unicode_ci,
  `email_verified` tinyint(1) DEFAULT '0',
  `two_factor_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `backup_email` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_username` (`username`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (1, 'admin', 'admin@connecxus.com', '$2b$12$3hoBo.PbVF1cMHhmjwIy0uSoX1mJY/7ttkwPPHGl4/gRX2XGlK7bu', 'admin', '/uploads/1787571493178-860.jfif', '', 'admin', 0, '2026-08-24 04:02:10', '2026-08-26 09:53:43', '/uploads/1787571510201-863.jfif', NULL, NULL, NULL, 1, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (2, 'Arm', 'arm@gmail.com', '$2b$12$ba281os5ym/QMQ88z4.GOektZhWrhQX6JPA32X58cFneNALhB3NWy', 'arm', NULL, NULL, 'user', 0, '2026-08-24 10:25:23', '2026-08-25 03:16:08', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (3, 'TestUpperUser1787643138237', 'testupperuser1787643138237@example.com', '$2b$12$fqfoBTxrsgBF47aq6d827ehTZGjjWG10hdbngQ9p/NSGsebMglOFa', 'Test Uppercase', NULL, NULL, 'user', 0, '2026-08-25 07:32:19', '2026-08-25 07:32:19', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (4, 'Eoa', 'e@gmail.com', '$2b$12$rPVoKjXMdQOmq7z1KLnrJOqXCtdsG9nNaCug32MAmMUGV7/S5CmJy', 'Eoa', NULL, NULL, 'user', 0, '2026-08-25 07:37:45', '2026-08-25 07:37:45', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (5, 'Eoo', 'eoo@gmail.com', '$2b$12$/O5TtZ9PAVMdqpHLDYvG0OoOCwf7LEqJw1WTxwnudWxJaSXKnOVPq', 'Eoo', NULL, NULL, 'user', 0, '2026-08-25 07:50:06', '2026-08-25 07:50:06', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (6, 'Eor', 'eor@gmail.com', '$2b$12$Ba8T6LXIVT4Z4FirR.K7.OcVIcZju4eIKpDfFm2C7ZgjezhBgweq6', 'Eor', NULL, NULL, 'user', 0, '2026-08-25 08:00:39', '2026-08-25 08:00:39', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (7, 'Eorr', 'e@gmil.com', '$2b$12$txYwCeyyrwUF2NTRknrGZ.HwLpv7KtlWOswgx6UCHeIhlv2Tv1Dva', 'Eorr', NULL, NULL, 'user', 0, '2026-08-25 09:38:44', '2026-08-25 09:38:44', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (8, 'eiei', 'ei@gmail.com', '$2b$12$pT80YJ/sR4ptsgOY9tXRGOPoD0c4IOUpd8WsmGbn3jdo4v5FuOoEG', 'นอน', NULL, NULL, 'user', 0, '2026-08-25 09:48:00', '2026-08-25 09:48:00', NULL, NULL, NULL, NULL, 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (9, 'ooa', 'oo@gmail.com', '$2b$12$TN/iDlMMmr0qMXZFCwVJbev.Op6PferWr2.ant5i7Qc4B9Zfq3mB6', 'oo', NULL, NULL, 'user', 1, '2026-08-25 09:51:58', '2026-08-25 10:13:55', NULL, '2026-08-26 10:13:55', '2026-08-25 10:13:55', '67', 0, NULL, 0, NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (10, 'armop', 'school.ocm@gmail.com', '$2b$12$zMgpqdXV6wXtgQwDTbuxyODctMEf6s39Oi9B8C.4RS5HbPoxp7XSu', 'อนุภัทร บุราคร', '/uploads/1787653100374-806.jpg', '', 'admin', 0, '2026-08-25 09:58:55', '2026-08-25 10:18:27', '/uploads/1787653106791-663.jpg', NULL, NULL, NULL, 0, NULL, 0, 'aburakhr54@gmail.com');
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `display_name`, `avatar_url`, `bio`, `role`, `is_banned`, `created_at`, `updated_at`, `banner_url`, `suspended_until`, `banned_at`, `ban_reason`, `email_verified`, `two_factor_secret`, `two_factor_enabled`, `backup_email`) VALUES (11, 'ooA', 'armarmoopmi@gmail.com', '$2b$12$s62UVGtRWYvgzMHP/KHbMeLvqfJZXmUJvf6O73ca.gJ8VdiFLnO8i', 'oo', '/uploads/1787725412559-709.png', '', 'user', 0, '2026-08-26 05:23:29', '2026-08-26 09:59:02', '/uploads/1787725429455-205.jpg', NULL, NULL, NULL, 0, NULL, 0, 'gg@gmail.com');

-- --------------------------------------------------------
-- View structure for `v_post_details`
-- --------------------------------------------------------
DROP VIEW IF EXISTS `v_post_details`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_post_details` AS select `p`.`id` AS `id`,`p`.`content` AS `content`,`p`.`image_url` AS `image_url`,`p`.`community_id` AS `community_id`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at`,`u`.`id` AS `author_id`,`u`.`username` AS `author_username`,`u`.`display_name` AS `author_display_name`,`u`.`avatar_url` AS `author_avatar`,`c`.`name` AS `community_name`,`c`.`slug` AS `community_slug`,(select count(0) from `post_likes` where (`post_likes`.`post_id` = `p`.`id`)) AS `like_count`,(select count(0) from `comments` where ((`comments`.`post_id` = `p`.`id`) and (`comments`.`is_deleted` = 0))) AS `comment_count` from ((`posts` `p` join `users` `u` on((`u`.`id` = `p`.`user_id`))) left join `communities` `c` on((`c`.`id` = `p`.`community_id`))) where (`p`.`is_deleted` = 0);

-- --------------------------------------------------------
-- View structure for `v_user_stats`
-- --------------------------------------------------------
DROP VIEW IF EXISTS `v_user_stats`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_user_stats` AS select `u`.`id` AS `id`,`u`.`username` AS `username`,`u`.`display_name` AS `display_name`,`u`.`avatar_url` AS `avatar_url`,`u`.`bio` AS `bio`,`u`.`role` AS `role`,`u`.`is_banned` AS `is_banned`,`u`.`created_at` AS `created_at`,(select count(0) from `follows` where (`follows`.`following_id` = `u`.`id`)) AS `follower_count`,(select count(0) from `follows` where (`follows`.`follower_id` = `u`.`id`)) AS `following_count`,(select count(0) from `posts` where ((`posts`.`user_id` = `u`.`id`) and (`posts`.`is_deleted` = 0))) AS `post_count` from `users` `u`;

SET FOREIGN_KEY_CHECKS = 1;
