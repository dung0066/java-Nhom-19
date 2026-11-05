-- ==========================================================================
-- WAYS STATION BADMINTON - DATABASE V2 (MySQL 8.0.16+)
-- Chuan hoa 3NF, tien = DECIMAL, mat khau BCrypt, co thanh toan / kho / gia dong
--
-- LUU Y KHI DUNG VOI SPRING BOOT / JPA:
--   * Tien: dung BigDecimal (khong dung double)
--   * Cot ENUM: dung @Enumerated(EnumType.STRING)
--   * Cot GENERATED (active_slot_key, total...) : @Column(insertable=false, updatable=false)
--   * spring.jpa.hibernate.ddl-auto=validate (de Hibernate khong tu sua schema)
--   * Mat khau seed = '123456' (BCrypt) -> DOI NGAY khi len production
--
-- BAN 27 BANG: da bo holidays, wallet_transactions, product_specs, audit_logs.
--
-- CANH BAO: script nay DROP toan bo bang cu. Chi chay tren DB dev/test
-- hoac sau khi da backup.
-- ==========================================================================

DROP DATABASE IF EXISTS `dat_san_cau_long`;
CREATE DATABASE `dat_san_cau_long` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dat_san_cau_long`;

SET NAMES utf8mb4;

-- ==========================================================================
-- A. DANH MUC: CHI NHANH, SAN, KHUNG GIO, GIA
-- ==========================================================================

CREATE TABLE `branches` (
    `id`        BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code`      VARCHAR(20)  NOT NULL UNIQUE,
    `name`      VARCHAR(100) NOT NULL,
    `address`   VARCHAR(255) NOT NULL,
    `phone`     VARCHAR(20),
    `active`    BOOLEAN NOT NULL DEFAULT TRUE
    -- total_courts da bo: dung view v_branch_court_count
) ENGINE=InnoDB;

-- Nhom san ghep (vd "San 1+2" dung chung 1 khu). Tach rieng de dat nguyen tu (1NF)
CREATE TABLE `court_groups` (
    `id`        BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT NOT NULL,
    `name`      VARCHAR(50) NOT NULL,
    UNIQUE KEY `uk_court_groups_branch_name` (`branch_id`, `name`),
    CONSTRAINT `fk_court_groups_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `courts` (
    `id`             BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id`      BIGINT NOT NULL,
    `court_number`   INT NOT NULL,                    -- ten hien thi = 'San ' + court_number (suy ra o tang app)
    `court_group_id` BIGINT NULL,
    `active`         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY `uk_courts_branch_number` (`branch_id`, `court_number`),
    UNIQUE KEY `uk_courts_id_branch` (`id`, `branch_id`),   -- phuc vu FK kep o booking_details
    CONSTRAINT `chk_courts_number` CHECK (`court_number` > 0),
    CONSTRAINT `fk_courts_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_courts_group`  FOREIGN KEY (`court_group_id`) REFERENCES `court_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Khoa san theo khoang thoi gian (bao tri, su kien, giai dau...)
CREATE TABLE `court_blocks` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `court_id`    BIGINT NOT NULL,
    `start_at`    DATETIME NOT NULL,
    `end_at`      DATETIME NOT NULL,
    `reason`      VARCHAR(255),
    `created_by`  BIGINT NULL,
    `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_court_blocks_range` (`court_id`, `start_at`, `end_at`),
    CONSTRAINT `chk_court_blocks_range` CHECK (`end_at` > `start_at`),
    CONSTRAINT `fk_court_blocks_court` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Khung gio: KHONG con gia (gia nam o price_rules). Slot cuoi 23:00-00:00 qua nua dem.
CREATE TABLE `time_slots` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `start_time`  TIME NOT NULL,
    `end_time`    TIME NOT NULL,
    `sort_order`  INT NOT NULL,
    UNIQUE KEY `uk_time_slots_start` (`start_time`),
    UNIQUE KEY `uk_time_slots_sort` (`sort_order`)
) ENGINE=InnoDB;

-- Gia dong: rule co priority cao nhat khop (chi nhanh, khung gio, loai ngay) se duoc ap dung.
-- branch_id / time_slot_id = NULL nghia la "ap dung tat ca".
CREATE TABLE `price_rules` (
    `id`           BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id`    BIGINT NULL,
    `time_slot_id` BIGINT NULL,
    `day_type`     ENUM('ALL','WEEKDAY','WEEKEND') NOT NULL DEFAULT 'ALL',
    `price`        DECIMAL(12,0) NOT NULL,
    `priority`     INT NOT NULL DEFAULT 0,
    `valid_from`   DATE NULL,
    `valid_to`     DATE NULL,
    `active`       BOOLEAN NOT NULL DEFAULT TRUE,
    KEY `idx_price_rules_lookup` (`branch_id`, `time_slot_id`, `day_type`, `priority`),
    CONSTRAINT `chk_price_rules_price` CHECK (`price` >= 0),
    CONSTRAINT `fk_price_rules_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_price_rules_slot`   FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================================
-- B. GOI HOI VIEN
-- ==========================================================================

CREATE TABLE `membership_packages` (
    `id`                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code`                VARCHAR(30)  NOT NULL UNIQUE,
    `name`                VARCHAR(100) NOT NULL,
    `price`               DECIMAL(12,0) NOT NULL,
    `duration_days`       INT NOT NULL,
    `discount_percent`    DECIMAL(5,2) NOT NULL DEFAULT 0,
    -- Dieu kien ap dung giam gia theo gio BAT DAU slot: [from, to). NULL = moi khung gio
    `discount_from_time`  TIME NULL,
    `discount_to_time`    TIME NULL,
    `student_only`        BOOLEAN NOT NULL DEFAULT FALSE,
    `description`         VARCHAR(500),
    `badge_color`         VARCHAR(30) NOT NULL DEFAULT '#0284c7',
    `icon`                VARCHAR(50) NOT NULL DEFAULT 'fa-solid fa-crown',
    `active`              BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_pkg_price`    CHECK (`price` >= 0),
    CONSTRAINT `chk_pkg_duration` CHECK (`duration_days` > 0),
    CONSTRAINT `chk_pkg_discount` CHECK (`discount_percent` BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- Dac quyen tach ra tung dong (thay cho cot perks TEXT)
CREATE TABLE `package_benefits` (
    `id`            BIGINT AUTO_INCREMENT PRIMARY KEY,
    `package_id`    BIGINT NOT NULL,
    `benefit_type`  ENUM('FREE_GRIP','FREE_RENTAL','FREE_STRINGING','PRODUCT_DISCOUNT',
                         'HOLD_MINUTES','PRIORITY_BOOKING','LOCKER','GUEST_DISCOUNT') NOT NULL,
    `value`         DECIMAL(8,2) NULL,                  -- % giam, so phut giu cho...
    `quota_limit`   INT NULL,                           -- NULL = khong gioi han
    `quota_period`  ENUM('MONTH','YEAR','PACKAGE') NULL,
    `branch_id`     BIGINT NULL,                        -- NULL = moi chi nhanh
    `time_from`     TIME NULL,
    `time_to`       TIME NULL,
    `description`   VARCHAR(255) NOT NULL,
    KEY `idx_benefits_package` (`package_id`),
    CONSTRAINT `fk_benefits_package` FOREIGN KEY (`package_id`) REFERENCES `membership_packages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_benefits_branch`  FOREIGN KEY (`branch_id`)  REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================================
-- C. NGUOI DUNG
-- ==========================================================================

CREATE TABLE `users` (
    `id`                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username`             VARCHAR(50)  NOT NULL UNIQUE,
    `password`             VARCHAR(100) NOT NULL,        -- BCrypt (60 ky tu)
    `full_name`            VARCHAR(100) NOT NULL,
    `email`                VARCHAR(100) UNIQUE,
    `phone`                VARCHAR(20)  NOT NULL UNIQUE,
    `role`                 ENUM('ROLE_USER','ROLE_STAFF','ROLE_ADMIN') NOT NULL DEFAULT 'ROLE_USER',
    `avatar`               VARCHAR(255) NULL,
    `student_verified_at`  DATETIME NULL,                -- dieu kien mua goi STUDENT
    `status`               ENUM('ACTIVE','LOCKED','DELETED') NOT NULL DEFAULT 'ACTIVE',
    `created_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`           DATETIME NULL
    -- membership_package_id / membership_expires_at / wallet_balance da bo khoi day
) ENGINE=InnoDB;

CREATE TABLE `staff_branches` (
    `user_id`   BIGINT NOT NULL,
    `branch_id` BIGINT NOT NULL,
    PRIMARY KEY (`user_id`, `branch_id`),
    CONSTRAINT `fk_staff_user`   FOREIGN KEY (`user_id`)   REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_staff_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `password_reset_tokens` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id`     BIGINT NOT NULL,
    `token_hash`  CHAR(64) NOT NULL UNIQUE,              -- luu SHA-256 cua token, khong luu token goc
    `expires_at`  DATETIME NOT NULL,
    `used_at`     DATETIME NULL,
    `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_prt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================================
-- D. VI (WALLET)
-- ==========================================================================

-- balance = so du hien tai. Moi lan nap tien duoc ghi vao payments (purpose = WALLET_TOPUP)
CREATE TABLE `wallets` (
    `user_id`     BIGINT PRIMARY KEY,
    `balance`     DECIMAL(12,0) NOT NULL DEFAULT 0,
    `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `chk_wallet_balance` CHECK (`balance` >= 0),
    CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- ==========================================================================
-- E. DAT SAN
-- ==========================================================================

CREATE TABLE `vouchers` (
    `id`              BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code`            VARCHAR(30) NOT NULL UNIQUE,
    `description`     VARCHAR(255),
    `discount_type`   ENUM('PERCENT','FIXED') NOT NULL,
    `discount_value`  DECIMAL(12,2) NOT NULL,
    `max_discount`    DECIMAL(12,0) NULL,
    `min_order`       DECIMAL(12,0) NOT NULL DEFAULT 0,
    `valid_from`      DATETIME NOT NULL,
    `valid_to`        DATETIME NOT NULL,
    `usage_limit`     INT NULL,
    `active`          BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `chk_voucher_value` CHECK (`discount_value` > 0),
    CONSTRAINT `chk_voucher_range` CHECK (`valid_to` > `valid_from`)
) ENGINE=InnoDB;

CREATE TABLE `user_memberships` (
    `id`                BIGINT AUTO_INCREMENT PRIMARY KEY,
    `subscription_code` VARCHAR(50) NOT NULL UNIQUE,
    `user_id`           BIGINT NOT NULL,
    `package_id`        BIGINT NOT NULL,
    `price_paid`        DECIMAL(12,0) NOT NULL,          -- snapshot gia luc mua
    `start_date`        DATETIME NOT NULL,
    `end_date`          DATETIME NOT NULL,               -- snapshot = start_date + duration_days luc mua
    `status`            ENUM('PENDING','ACTIVE','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    `notes`             VARCHAR(500),
    `created_at`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_um_user_status` (`user_id`, `status`, `end_date`),
    CONSTRAINT `chk_um_dates` CHECK (`end_date` > `start_date`),
    -- RESTRICT: khong cho xoa user con lich su giao dich (dung soft delete)
    CONSTRAINT `fk_um_user`    FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`),
    CONSTRAINT `fk_um_package` FOREIGN KEY (`package_id`) REFERENCES `membership_packages` (`id`)
) ENGINE=InnoDB;

-- Theo doi han muc dac quyen da dung (vd muon vot 2 lan/thang)
CREATE TABLE `membership_usage` (
    `id`                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_membership_id`  BIGINT NOT NULL,
    `benefit_id`          BIGINT NOT NULL,
    `booking_id`          BIGINT NULL,
    `quantity`            INT NOT NULL DEFAULT 1,
    `used_at`             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_usage_lookup` (`user_membership_id`, `benefit_id`, `used_at`),
    CONSTRAINT `fk_usage_membership` FOREIGN KEY (`user_membership_id`) REFERENCES `user_memberships` (`id`),
    CONSTRAINT `fk_usage_benefit`    FOREIGN KEY (`benefit_id`) REFERENCES `package_benefits` (`id`)
) ENGINE=InnoDB;

-- Lich dat co dinh hang tuan
CREATE TABLE `recurring_bookings` (
    `id`            BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id`       BIGINT NOT NULL,
    `court_id`      BIGINT NOT NULL,
    `time_slot_id`  BIGINT NOT NULL,
    `day_of_week`   TINYINT NOT NULL,                    -- 1=Thu 2 ... 7=Chu nhat
    `start_date`    DATE NOT NULL,
    `end_date`      DATE NOT NULL,
    `status`        ENUM('ACTIVE','PAUSED','ENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_rec_dow`   CHECK (`day_of_week` BETWEEN 1 AND 7),
    CONSTRAINT `chk_rec_dates` CHECK (`end_date` >= `start_date`),
    CONSTRAINT `fk_rec_user`  FOREIGN KEY (`user_id`)      REFERENCES `users` (`id`),
    CONSTRAINT `fk_rec_court` FOREIGN KEY (`court_id`)     REFERENCES `courts` (`id`),
    CONSTRAINT `fk_rec_slot`  FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`)
) ENGINE=InnoDB;

-- booking_date, total_hours, total_price, original_price da bo -> xem view v_booking_totals
CREATE TABLE `bookings` (
    `id`                       BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_code`             VARCHAR(30) NOT NULL UNIQUE,
    `user_id`                  BIGINT NULL,              -- NULL = khach vang lai
    `branch_id`                BIGINT NOT NULL,
    -- Snapshot thong tin lien he (khach vang lai / nguoi dat ho). Khong dong bo voi users.
    `customer_name`            VARCHAR(100) NOT NULL,
    `customer_phone`           VARCHAR(20)  NOT NULL,
    `customer_email`           VARCHAR(100),
    `recurring_booking_id`     BIGINT NULL,
    `voucher_id`               BIGINT NULL,
    `applied_membership_id`    BIGINT NULL,              -- goi hoi vien da dung de giam gia
    `discount_amount`          DECIMAL(12,0) NOT NULL DEFAULT 0,
    `status`                   ENUM('PENDING','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW','EXPIRED') NOT NULL DEFAULT 'PENDING',
    `hold_expires_at`          DATETIME NULL,            -- giu cho khi PENDING (vd 15 phut)
    `notes`                    VARCHAR(500),
    `cancelled_at`             DATETIME NULL,
    `cancel_reason`            VARCHAR(255) NULL,
    `created_at`               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_bookings_id_branch` (`id`, `branch_id`),
    KEY `idx_bookings_user` (`user_id`, `created_at`),
    KEY `idx_bookings_branch_status` (`branch_id`, `status`),
    KEY `idx_bookings_hold` (`status`, `hold_expires_at`),
    CONSTRAINT `chk_bookings_discount` CHECK (`discount_amount` >= 0),
    CONSTRAINT `fk_bookings_user`      FOREIGN KEY (`user_id`)   REFERENCES `users` (`id`),
    CONSTRAINT `fk_bookings_branch`    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
    CONSTRAINT `fk_bookings_recurring` FOREIGN KEY (`recurring_booking_id`) REFERENCES `recurring_bookings` (`id`),
    CONSTRAINT `fk_bookings_voucher`   FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`),
    CONSTRAINT `fk_bookings_membership` FOREIGN KEY (`applied_membership_id`) REFERENCES `user_memberships` (`id`)
) ENGINE=InnoDB;

ALTER TABLE `membership_usage`
    ADD CONSTRAINT `fk_usage_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

CREATE TABLE `booking_details` (
    `id`                BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id`        BIGINT NOT NULL,
    `branch_id`         BIGINT NOT NULL,                 -- ep nhat quan: san va don phai cung chi nhanh (FK kep)
    `court_id`          BIGINT NOT NULL,
    `time_slot_id`      BIGINT NOT NULL,
    `slot_date`         DATE   NOT NULL,
    `price`             DECIMAL(12,0) NOT NULL,          -- snapshot gia tu price_rules luc dat
    `status`            ENUM('BOOKED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'BOOKED',
    -- Chi dong KHONG bi huy moi tham gia UNIQUE => huy xong co the dat lai slot
    `active_slot_key`   TINYINT GENERATED ALWAYS AS (CASE WHEN `status` = 'CANCELLED' THEN NULL ELSE 1 END) STORED,
    UNIQUE KEY `uk_slot_active` (`court_id`, `time_slot_id`, `slot_date`, `active_slot_key`),
    KEY `idx_details_date_court` (`slot_date`, `court_id`),
    KEY `idx_details_booking` (`booking_id`),
    KEY `idx_details_slot` (`time_slot_id`),
    CONSTRAINT `chk_details_price` CHECK (`price` >= 0),
    CONSTRAINT `fk_details_booking_branch` FOREIGN KEY (`booking_id`, `branch_id`) REFERENCES `bookings` (`id`, `branch_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_details_court_branch`   FOREIGN KEY (`court_id`, `branch_id`)   REFERENCES `courts` (`id`, `branch_id`),
    CONSTRAINT `fk_details_timeslot`       FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`)
) ENGINE=InnoDB;

-- Pass san (thay cho cot pass_contact)
CREATE TABLE `slot_transfers` (
    `id`                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_detail_id`  BIGINT NOT NULL,
    `from_user_id`       BIGINT NULL,
    `to_user_id`         BIGINT NULL,
    `contact`            VARCHAR(100),
    `pass_price`         DECIMAL(12,0) NOT NULL DEFAULT 0,
    `status`             ENUM('LISTED','CLAIMED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'LISTED',
    `created_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `claimed_at`         DATETIME NULL,
    KEY `idx_transfers_status` (`status`, `created_at`),
    CONSTRAINT `fk_transfers_detail` FOREIGN KEY (`booking_detail_id`) REFERENCES `booking_details` (`id`),
    CONSTRAINT `fk_transfers_from`   FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_transfers_to`     FOREIGN KEY (`to_user_id`)   REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- ==========================================================================
-- F. SAN PHAM / DUNG CU / KHO
-- ==========================================================================

CREATE TABLE `product_categories` (
    `id`    BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code`  VARCHAR(30) NOT NULL UNIQUE,
    `name`  VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE `products` (
    `id`           BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_id`  BIGINT NOT NULL,
    `name`         VARCHAR(150) NOT NULL,
    `brand`        VARCHAR(100),
    `product_type` ENUM('RENTAL','RETAIL') NOT NULL DEFAULT 'RENTAL',
    `price`        DECIMAL(12,0) NOT NULL,
    `price_unit`   VARCHAR(50) NOT NULL DEFAULT '/ buoi choi',
    `image_url`    VARCHAR(500),
    `badge`        VARCHAR(50),
    `description`  TEXT,
    `specs`        JSON NULL,                    -- thong so ky thuat dang JSON (thay spec1, spec2)
    `active`       BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_products_price` CHECK (`price` >= 0),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `product_inventory` (
    `branch_id`       BIGINT NOT NULL,
    `product_id`      BIGINT NOT NULL,
    `stock_quantity`  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`branch_id`, `product_id`),
    CONSTRAINT `chk_inventory_qty` CHECK (`stock_quantity` >= 0),
    CONSTRAINT `fk_inventory_branch`  FOREIGN KEY (`branch_id`)  REFERENCES `branches` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Ghi nhan thue / mua dung cu trong 1 don dat san
CREATE TABLE `booking_items` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id`  BIGINT NOT NULL,
    `product_id`  BIGINT NOT NULL,
    `quantity`    INT NOT NULL DEFAULT 1,
    `unit_price`  DECIMAL(12,0) NOT NULL,                -- snapshot
    `status`      ENUM('RESERVED','TAKEN','RETURNED','CANCELLED') NOT NULL DEFAULT 'RESERVED',
    `returned_at` DATETIME NULL,
    KEY `idx_items_booking` (`booking_id`),
    CONSTRAINT `chk_items_qty`   CHECK (`quantity` > 0),
    CONSTRAINT `chk_items_price` CHECK (`unit_price` >= 0),
    CONSTRAINT `fk_items_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB;

-- ==========================================================================
-- G. THANH TOAN
-- ==========================================================================
-- Luu y: MySQL cam ON DELETE/UPDATE action tren cot nam trong CHECK => dung RESTRICT mac dinh.

CREATE TABLE `payments` (
    `id`                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    `payment_code`        VARCHAR(50) NOT NULL UNIQUE,
    `purpose`             ENUM('BOOKING','MEMBERSHIP','WALLET_TOPUP') NOT NULL,
    `user_id`             BIGINT NULL,
    `booking_id`          BIGINT NULL,
    `user_membership_id`  BIGINT NULL,
    `amount`              DECIMAL(12,0) NOT NULL,
    `method`              ENUM('VIETQR','BANK_TRANSFER','CASH','WALLET','SYSTEM') NOT NULL,
    `status`              ENUM('PENDING','PAID','FAILED','REFUNDED','PARTIAL_REFUND') NOT NULL DEFAULT 'PENDING',
    `provider_txn_code`   VARCHAR(100) NULL UNIQUE,      -- ma giao dich ngan hang / cong thanh toan
    `paid_at`             DATETIME NULL,
    `created_at`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_payments_user` (`user_id`),
    KEY `idx_payments_booking` (`booking_id`),
    KEY `idx_payments_membership` (`user_membership_id`),
    CONSTRAINT `chk_payments_amount` CHECK (`amount` > 0),
    CONSTRAINT `chk_payments_target` CHECK (
        (`purpose` = 'BOOKING'      AND `booking_id` IS NOT NULL AND `user_membership_id` IS NULL) OR
        (`purpose` = 'MEMBERSHIP'   AND `user_membership_id` IS NOT NULL AND `booking_id` IS NULL) OR
        (`purpose` = 'WALLET_TOPUP' AND `booking_id` IS NULL AND `user_membership_id` IS NULL)
    ),
    CONSTRAINT `fk_payments_user`       FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_payments_booking`    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
    CONSTRAINT `fk_payments_membership` FOREIGN KEY (`user_membership_id`) REFERENCES `user_memberships` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `refunds` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `payment_id`  BIGINT NOT NULL,
    `amount`      DECIMAL(12,0) NOT NULL,
    `reason`      VARCHAR(255),
    `status`      ENUM('PENDING','DONE','FAILED') NOT NULL DEFAULT 'PENDING',
    `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_refunds_amount` CHECK (`amount` > 0),
    CONSTRAINT `fk_refunds_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB;

-- ==========================================================================
-- H. TIEN ICH: DANH GIA, THONG BAO, NHAT KY
-- ==========================================================================

CREATE TABLE `reviews` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id`  BIGINT NOT NULL UNIQUE,                -- 1 don = 1 danh gia
    `user_id`     BIGINT NOT NULL,
    `rating`      TINYINT NOT NULL,
    `comment`     VARCHAR(1000),
    `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
    CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
    CONSTRAINT `fk_reviews_user`    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `notifications` (
    `id`          BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id`     BIGINT NOT NULL,
    `title`       VARCHAR(150) NOT NULL,
    `content`     VARCHAR(1000),
    `is_read`     BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_notif_user_read` (`user_id`, `is_read`, `created_at`),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================================
-- I. VIEW (thay cho cac cot suy ra duoc)
-- ==========================================================================

-- Thay branches.total_courts
CREATE OR REPLACE VIEW `v_branch_court_count` AS
SELECT b.id AS branch_id, b.code, b.name,
       COUNT(c.id) AS total_courts
FROM branches b
LEFT JOIN courts c ON c.branch_id = b.id AND c.active = TRUE
GROUP BY b.id, b.code, b.name;

-- Thay time_slots.display_label
CREATE OR REPLACE VIEW `v_time_slots` AS
SELECT id, start_time, end_time, sort_order,
       CONCAT(TIME_FORMAT(start_time, '%k:%i'), '-', TIME_FORMAT(end_time, '%k:%i')) AS display_label
FROM time_slots;

-- Thay users.membership_package_id / membership_expires_at
CREATE OR REPLACE VIEW `v_user_active_membership` AS
SELECT t.user_id, t.user_membership_id, t.package_id, p.code AS package_code,
       p.discount_percent, t.start_date, t.end_date
FROM (
    SELECT um.user_id, um.id AS user_membership_id, um.package_id, um.start_date, um.end_date,
           ROW_NUMBER() OVER (PARTITION BY um.user_id ORDER BY um.end_date DESC) AS rn
    FROM user_memberships um
    WHERE um.status = 'ACTIVE' AND NOW() BETWEEN um.start_date AND um.end_date
) t
JOIN membership_packages p ON p.id = t.package_id
WHERE t.rn = 1;

-- Thay bookings.original_price / total_price / total_hours (moi slot = 1 gio)
CREATE OR REPLACE VIEW `v_booking_totals` AS
SELECT b.id AS booking_id, b.booking_code, b.status,
       COALESCE(d.court_amount, 0) AS court_amount,
       COALESCE(i.item_amount, 0)  AS item_amount,
       b.discount_amount,
       COALESCE(d.court_amount, 0) + COALESCE(i.item_amount, 0) - b.discount_amount AS total_amount,
       COALESCE(d.slot_count, 0)   AS total_hours
FROM bookings b
LEFT JOIN (
    SELECT booking_id, SUM(price) AS court_amount, COUNT(*) AS slot_count
    FROM booking_details WHERE status <> 'CANCELLED' GROUP BY booking_id
) d ON d.booking_id = b.id
LEFT JOIN (
    SELECT booking_id, SUM(quantity * unit_price) AS item_amount
    FROM booking_items WHERE status <> 'CANCELLED' GROUP BY booking_id
) i ON i.booking_id = b.id;

-- ==========================================================================
-- J. DU LIEU MAU (SEED)
-- ==========================================================================

-- 1. Chi nhanh
INSERT INTO `branches` (`id`, `code`, `name`, `address`, `phone`) VALUES
(1, 'NVL',  'Ways Station NVL',  '70 Nguyễn Văn Lượng, P. 10, Gò Vấp, TP.HCM', '0889555559'),
(2, 'DQII', 'Ways Station DQII', '262 Dương Quảng Hàm, P. 6, Gò Vấp, TP.HCM', '0889555559'),
(3, 'NQA',  'Ways Station NQA',  '86 Nguyễn Quý Anh, P. Tân Sơn Nhì, Tân Phú, TP.HCM', '0889555559'),
(4, 'HB',   'Ways Station HB',   '135 Hiệp Bình, TP. Thủ Đức, TP.HCM', '0889555559');

-- 2. Nhom san + san (NVL 7, DQII 6, NQA 6, HB 8 - khop so luong khai bao truoc day)
INSERT INTO `court_groups` (`id`, `branch_id`, `name`) VALUES
(1, 1, 'Sân 1+2'), (2, 1, 'Sân 3+4'), (3, 1, 'Sân 5+6'), (4, 1, 'Sân 7');

INSERT INTO `courts` (`branch_id`, `court_number`, `court_group_id`) VALUES
(1, 1, 1), (1, 2, 1), (1, 3, 2), (1, 4, 2), (1, 5, 3), (1, 6, 3), (1, 7, 4);

INSERT INTO `courts` (`branch_id`, `court_number`)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 8)
SELECT 2, i FROM n WHERE i <= 6
UNION ALL SELECT 3, i FROM n WHERE i <= 6
UNION ALL SELECT 4, i FROM n WHERE i <= 8;

-- 3. Khung gio (38 ca chuan tu 05:00 den 24:00, moi ca 30 phut)
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`, `sort_order`) VALUES
(1,  '05:00:00', '05:30:00', 1),  (2,  '05:30:00', '06:00:00', 2),  (3,  '06:00:00', '06:30:00', 3),
(4,  '06:30:00', '07:00:00', 4),  (5,  '07:00:00', '07:30:00', 5),  (6,  '07:30:00', '08:00:00', 6),
(7,  '08:00:00', '08:30:00', 7),  (8,  '08:30:00', '09:00:00', 8),  (9,  '09:00:00', '09:30:00', 9),
(10, '09:30:00', '10:00:00', 10), (11, '10:00:00', '10:30:00', 11), (12, '10:30:00', '11:00:00', 12),
(13, '11:00:00', '11:30:00', 13), (14, '11:30:00', '12:00:00', 14), (15, '12:00:00', '12:30:00', 15),
(16, '12:30:00', '13:00:00', 16), (17, '13:00:00', '13:30:00', 17), (18, '13:30:00', '14:00:00', 18),
(19, '14:00:00', '14:30:00', 19), (20, '14:30:00', '15:00:00', 20), (21, '15:00:00', '15:30:00', 21),
(22, '15:30:00', '16:00:00', 22), (23, '16:00:00', '16:30:00', 23), (24, '16:30:00', '17:00:00', 24),
(25, '17:00:00', '17:30:00', 25), (26, '17:30:00', '18:00:00', 26), (27, '18:00:00', '18:30:00', 27),
(28, '18:30:00', '19:00:00', 28), (29, '19:00:00', '19:30:00', 29), (30, '19:30:00', '20:00:00', 30),
(31, '20:00:00', '20:30:00', 31), (32, '20:30:00', '21:00:00', 32), (33, '21:00:00', '21:30:00', 33),
(34, '21:30:00', '22:00:00', 34), (35, '22:00:00', '22:30:00', 35), (36, '22:30:00', '23:00:00', 36),
(37, '23:00:00', '23:30:00', 37), (38, '23:30:00', '24:00:00', 38);

-- 4. Gia: mac dinh 70k; gio cao diem (slot 17-21) 120k
INSERT INTO `price_rules` (`branch_id`, `time_slot_id`, `day_type`, `price`, `priority`) VALUES
(NULL, NULL, 'ALL', 70000, 0);
INSERT INTO `price_rules` (`branch_id`, `time_slot_id`, `day_type`, `price`, `priority`)
SELECT NULL, id, 'ALL', 120000, 10 FROM time_slots WHERE id BETWEEN 17 AND 21;

-- 5. Goi hoi vien
INSERT INTO `membership_packages`
(`id`, `code`, `name`, `price`, `duration_days`, `discount_percent`, `discount_from_time`, `discount_to_time`, `student_only`, `description`, `badge_color`, `icon`) VALUES
(1, 'SILVER',  'Hội Viên Bạc (Silver)',     199000,  30,  5.00,  NULL, NULL, FALSE, 'Gói khởi đầu tiết kiệm dành cho người chơi thể thao hàng tuần', '#0284c7', 'fa-solid fa-medal'),
(2, 'GOLD',    'Hội Viên Vàng (Gold)',      499000,  90,  12.00, NULL, NULL, FALSE, 'Gói phổ biến nhất, tối ưu chi phí cho các cơ thủ và nhóm bạn chơi thường xuyên', '#f59e0b', 'fa-solid fa-crown'),
(3, 'DIAMOND', 'Kim Cương VIP (Diamond)',   1290000, 365, 20.00, NULL, NULL, FALSE, 'Đặc quyền đẳng cấp nhất hệ thống Ways Station Badminton', '#10b981', 'fa-solid fa-gem'),
(4, 'STUDENT', 'Gói Sinh Viên Thần Tốc',    99000,   30,  10.00, '00:00', '16:30', TRUE, 'Gói tiếp sức đam mê thể thao trẻ học đường (áp dụng slot bắt đầu trước 16:30)', '#8b5cf6', 'fa-solid fa-graduation-cap');

INSERT INTO `package_benefits` (`package_id`, `benefit_type`, `value`, `quota_limit`, `quota_period`, `branch_id`, `time_from`, `time_to`, `description`) VALUES
(1, 'FREE_GRIP',        NULL, 1,    'MONTH',   NULL, NULL,    NULL,    'Tặng 1 quấn cán vợt cao cấp/tháng'),
(1, 'HOLD_MINUTES',     15,   NULL, NULL,      NULL, NULL,    NULL,    'Đặt sân online ưu tiên giữ chỗ 15 phút'),
(2, 'PRIORITY_BOOKING', NULL, NULL, NULL,      NULL, '17:35', '22:55', 'Ưu tiên đặt cố định ca giờ vàng 17:35 - 22:55'),
(2, 'FREE_RENTAL',      NULL, 2,    'MONTH',   NULL, NULL,    NULL,    'Miễn phí mượn vợt cao cấp Yonex/Victor 2 lần/tháng'),
(2, 'PRODUCT_DISCOUNT', 10,   NULL, NULL,      NULL, NULL,    NULL,    'Giảm 10% khi mua nước và phụ kiện'),
(3, 'LOCKER',           NULL, NULL, NULL,      1,    NULL,    NULL,    'Tặng tủ để đồ riêng tại chi nhánh NVL trong thời hạn gói'),
(3, 'FREE_STRINGING',   NULL, 6,    'YEAR',    NULL, NULL,    NULL,    'Miễn phí căng cước vợt 6 lần/năm'),
(3, 'GUEST_DISCOUNT',   20,   NULL, NULL,      NULL, NULL,    NULL,    'Mời khách giao lưu được áp dụng ưu đãi chung');

-- 6. Nguoi dung (mat khau '123456' - BCrypt)
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `phone`, `role`, `status`) VALUES
(1, 'admin',        '$2a$10$7Jc5UoKPUfmL/MnAMk3f.OtRfR1BWxjjNm2dtPTMzc1lcV/Yv.tFq', 'Quản Trị Viên Hệ Thống', 'admin@waysstation.vn',      '0889555559', 'ROLE_ADMIN', 'ACTIVE'),
(2, 'hoivien_gold', '$2a$10$7Jc5UoKPUfmL/MnAMk3f.OtRfR1BWxjjNm2dtPTMzc1lcV/Yv.tFq', 'Nguyễn Văn Tuấn',        'tuan.badminton@gmail.com', '0909123456', 'ROLE_USER',  'ACTIVE'),
(3, 'khachhang1',   '$2a$10$7Jc5UoKPUfmL/MnAMk3f.OtRfR1BWxjjNm2dtPTMzc1lcV/Yv.tFq', 'Trần Minh Đức',          'duc.tm@gmail.com',         '0912345678', 'ROLE_USER',  'ACTIVE');

INSERT INTO `staff_branches` (`user_id`, `branch_id`) VALUES (1, 1), (1, 2), (1, 3), (1, 4);

-- 7. Vi
INSERT INTO `wallets` (`user_id`, `balance`) VALUES (1, 5000000), (2, 850000), (3, 0);

-- 8. Lich su mua goi (end_date = start_date + duration_days)
INSERT INTO `user_memberships`
(`id`, `subscription_code`, `user_id`, `package_id`, `price_paid`, `start_date`, `end_date`, `status`, `notes`) VALUES
(1, 'SUB-202610-GOLD-01', 2, 2, 499000,  '2026-10-01 08:00:00', '2026-12-30 08:00:00', 'ACTIVE', 'Kích hoạt gói Hội Viên Vàng 3 tháng'),
(2, 'SUB-202601-DIA-01',  1, 3, 1290000, '2026-01-01 00:00:00', '2027-01-01 00:00:00', 'ACTIVE', 'Tài khoản Quản Trị đặc quyền VIP');

INSERT INTO `payments`
(`payment_code`, `purpose`, `user_id`, `user_membership_id`, `amount`, `method`, `status`, `provider_txn_code`, `paid_at`) VALUES
('PAY-SUB-0001', 'MEMBERSHIP', 2, 1, 499000,  'VIETQR', 'PAID', 'TXN-QR-889922',  '2026-10-01 08:00:00'),
('PAY-SUB-0002', 'MEMBERSHIP', 1, 2, 1290000, 'SYSTEM', 'PAID', 'TXN-ADMIN-SYS',  '2026-01-01 00:00:00');

-- 9. Voucher mau
INSERT INTO `vouchers` (`code`, `description`, `discount_type`, `discount_value`, `max_discount`, `min_order`, `valid_from`, `valid_to`, `usage_limit`) VALUES
('WELCOME10', 'Giảm 10% cho khách mới, tối đa 50.000đ', 'PERCENT', 10, 50000, 100000, '2026-10-01 00:00:00', '2026-12-31 23:59:59', 500);

-- 10. San pham mau
INSERT INTO `product_categories` (`id`, `code`, `name`) VALUES
(1, 'RACKET', 'Vợt cầu lông'), (2, 'SHOES', 'Giày'), (3, 'ACCESSORY', 'Phụ kiện');

INSERT INTO `products` (`id`, `category_id`, `name`, `brand`, `product_type`, `price`, `price_unit`, `badge`, `description`, `specs`) VALUES
(1, 1, 'Vợt Yonex Astrox 77 Pro',  'Yonex',  'RENTAL', 50000, '/ buổi chơi', 'HOT', 'Vợt thiên công, phù hợp người chơi trung cấp', JSON_OBJECT('Trọng lượng', '4U (83g)', 'Điểm cân bằng', 'Nặng đầu')),
(2, 1, 'Vợt Victor Thruster K 12', 'Victor', 'RENTAL', 50000, '/ buổi chơi', NULL,  'Vợt công thủ toàn diện', JSON_OBJECT('Trọng lượng', '4U (83g)', 'Điểm cân bằng', 'Cân bằng')),
(3, 2, 'Giày Yonex Power Cushion',  'Yonex',  'RENTAL', 30000, '/ buổi chơi', NULL,  'Giày chuyên dụng chống trượt', JSON_OBJECT('Size', '38 - 44', 'Loại đế', 'Cao su chống trượt')),
(4, 3, 'Quấn cán vợt Yonex AC102',  'Yonex',  'RETAIL', 25000, '/ cuộn',      NULL,  'Quấn cán thấm hút mồ hôi', NULL);

INSERT INTO `product_inventory` (`branch_id`, `product_id`, `stock_quantity`)
SELECT b.id, p.id, CASE WHEN p.product_type = 'RENTAL' THEN 10 ELSE 50 END
FROM branches b CROSS JOIN products p;

-- ==========================================================================
-- K. TRUY VAN MAU
-- ==========================================================================
-- Gia 1 slot (chi nhanh :b, slot :s, ngay :d): lay rule priority cao nhat con hieu luc
--   SELECT price FROM price_rules
--   WHERE active AND (branch_id IS NULL OR branch_id = :b)
--     AND (time_slot_id IS NULL OR time_slot_id = :s)
--     AND (valid_from IS NULL OR :d >= valid_from) AND (valid_to IS NULL OR :d <= valid_to)
--     AND (day_type = 'ALL'
--          OR (day_type = 'WEEKEND' AND DAYOFWEEK(:d) IN (1, 7))
--          OR (day_type = 'WEEKDAY' AND DAYOFWEEK(:d) BETWEEN 2 AND 6))
--   ORDER BY priority DESC, branch_id IS NULL, time_slot_id IS NULL LIMIT 1;
--
-- Job moi phut: huy don PENDING het han giu cho
--   UPDATE booking_details d JOIN bookings b ON b.id = d.booking_id
--      SET d.status = 'CANCELLED'
--    WHERE b.status = 'PENDING' AND b.hold_expires_at < NOW();
--   UPDATE bookings SET status = 'EXPIRED' WHERE status = 'PENDING' AND hold_expires_at < NOW();
