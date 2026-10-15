-- ==========================================================
-- SCRIPT TẠO DATABASE VÀ DỮ LIỆU ĐẦY ĐỦ CHO HỆ THỐNG ĐẶT SÂN CẦU LÔNG (SPRING BOOT / MYSQL)
-- Hỗ trợ: Đặt sân, Quản lý tài khoản User, Đăng ký/Đăng nhập, Mua Gói Hội Viên (Membership VIP)
-- ==========================================================

-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS `dat_san_cau_long` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dat_san_cau_long`;

-- Tắt kiểm tra khóa ngoại tạm thời để khởi tạo/reset an toàn nếu cần
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Bảng Branches (Chi nhánh)
CREATE TABLE IF NOT EXISTS `branches` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `total_courts` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng Courts (Sân cầu lông)
CREATE TABLE IF NOT EXISTS `courts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `branch_id` BIGINT NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `court_number` INT,
    `court_group` VARCHAR(50),
    `active` BOOLEAN DEFAULT TRUE,
    CONSTRAINT `fk_courts_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng Time Slots (Khung giờ)
CREATE TABLE IF NOT EXISTS `time_slots` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `start_time` VARCHAR(10) NOT NULL,
    `end_time` VARCHAR(10) NOT NULL,
    `display_label` VARCHAR(30) NOT NULL,
    `standard_price` DOUBLE DEFAULT 70000,
    `peak_price` DOUBLE DEFAULT 120000,
    `is_peak_hour` BOOLEAN DEFAULT FALSE,
    `sort_order` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng Membership Packages (Các gói hội viên)
CREATE TABLE IF NOT EXISTS `membership_packages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `price` DOUBLE NOT NULL,
    `duration_days` INT NOT NULL,
    `discount_percent` DOUBLE DEFAULT 0,
    `perks` TEXT,
    `description` VARCHAR(500),
    `badge_color` VARCHAR(30) DEFAULT '#0284c7',
    `icon` VARCHAR(50) DEFAULT 'fa-solid fa-crown',
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Users (Người dùng, Hội viên, Nhân viên, Quản trị)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE,
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `role` VARCHAR(20) DEFAULT 'ROLE_USER',
    `membership_package_id` BIGINT DEFAULT NULL,
    `membership_expires_at` DATETIME DEFAULT NULL,
    `wallet_balance` DOUBLE DEFAULT 0,
    `avatar` VARCHAR(255) DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_membership_package` FOREIGN KEY (`membership_package_id`) REFERENCES `membership_packages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng User Memberships (Lịch sử đăng ký & mua gói hội viên)
CREATE TABLE IF NOT EXISTS `user_memberships` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `subscription_code` VARCHAR(50) NOT NULL UNIQUE,
    `user_id` BIGINT NOT NULL,
    `package_id` BIGINT NOT NULL,
    `price_paid` DOUBLE NOT NULL,
    `discount_applied` DOUBLE DEFAULT 0,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `payment_method` VARCHAR(50) DEFAULT 'VIETQR',
    `payment_status` VARCHAR(30) DEFAULT 'PAID',
    `transaction_code` VARCHAR(100),
    `notes` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_user_memberships_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_memberships_package` FOREIGN KEY (`package_id`) REFERENCES `membership_packages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng Bookings (Đơn đặt sân)
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(30) NOT NULL UNIQUE,
    `user_id` BIGINT DEFAULT NULL,
    `customer_name` VARCHAR(100) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `customer_email` VARCHAR(100),
    `booking_date` DATE NOT NULL,
    `branch_id` BIGINT NOT NULL,
    `original_price` DOUBLE DEFAULT 0,
    `discount_amount` DOUBLE DEFAULT 0,
    `total_price` DOUBLE NOT NULL,
    `total_hours` DOUBLE DEFAULT 1.0,
    `status` VARCHAR(30) DEFAULT 'CONFIRMED',
    `payment_method` VARCHAR(50) DEFAULT 'VIETQR',
    `notes` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Bảng Booking Details (Chi tiết từng khung giờ và sân)
CREATE TABLE IF NOT EXISTS `booking_details` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT NOT NULL,
    `court_id` BIGINT NOT NULL,
    `time_slot_id` BIGINT NOT NULL,
    `slot_date` DATE NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` VARCHAR(30) DEFAULT 'BOOKED',
    `pass_contact` VARCHAR(100),
    CONSTRAINT `fk_details_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_details_court` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`),
    CONSTRAINT `fk_details_timeslot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`),
    CONSTRAINT `uk_court_slot_date` UNIQUE (`court_id`, `time_slot_id`, `slot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng Products (Dụng cụ cho thuê: Vợt, Giày, Phụ kiện)
CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `brand` VARCHAR(100),
    `price` DOUBLE NOT NULL,
    `price_unit` VARCHAR(50) DEFAULT '/ buổi chơi',
    `image_url` VARCHAR(500),
    `badge` VARCHAR(50),
    `spec1` VARCHAR(150),
    `spec2` VARCHAR(150),
    `description` TEXT,
    `active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- DỮ LIỆU BAN ĐẦU (SEED DATA)
-- ==========================================================

-- 1. Thêm Chi Nhánh
INSERT INTO `branches` (`id`, `code`, `name`, `address`, `phone`, `total_courts`) VALUES
(1, 'NVL', 'Ways Station NVL', '70 Nguyễn Văn Lượng, P. 10, Gò Vấp, TP.HCM', '0889555559', 7),
(2, 'DQII', 'Ways Station DQII', '262 Dương Quảng Hàm, P. 6, Gò Vấp, TP.HCM', '0889555559', 6),
(3, 'NQA', 'Ways Station NQA', '86 Nguyễn Quý Anh, P. Tân Sơn Nhì, Tân Phú, TP.HCM', '0889555559', 6),
(4, 'HB', 'Ways Station HB', '135 Hiệp Bình, TP. Thủ Đức, TP.HCM', '0889555559', 8)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `address`=VALUES(`address`), `phone`=VALUES(`phone`), `total_courts`=VALUES(`total_courts`);

-- 2. Thêm Sân cho chi nhánh NVL (Sân 1 -> Sân 7)
INSERT INTO `courts` (`id`, `branch_id`, `name`, `court_number`, `court_group`, `active`) VALUES
(1, 1, 'Sân 1', 1, 'Sân 1+2', 1),
(2, 1, 'Sân 2', 2, 'Sân 1+2', 1),
(3, 1, 'Sân 3', 3, 'Sân 3+4', 1),
(4, 1, 'Sân 4', 4, 'Sân 3+4', 1),
(5, 1, 'Sân 5', 5, 'Sân 5+6', 1),
(6, 1, 'Sân 6', 6, 'Sân 5+6', 1),
(7, 1, 'Sân 7', 7, 'Sân 7', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. Thêm các Khung Giờ (24h)
INSERT INTO `time_slots` (`id`, `start_time`, `end_time`, `display_label`, `standard_price`, `peak_price`, `is_peak_hour`, `sort_order`) VALUES
(1, '00:15', '01:15', '0:15-1:15', 70000, 120000, 0, 1),
(2, '01:20', '02:20', '1:20-2:20', 70000, 120000, 0, 2),
(3, '02:25', '03:25', '2:25-3:25', 70000, 120000, 0, 3),
(4, '03:30', '04:30', '3:30-4:30', 70000, 120000, 0, 4),
(5, '04:35', '05:35', '4:35-5:35', 70000, 120000, 0, 5),
(6, '05:40', '06:40', '5:40-6:40', 70000, 120000, 0, 6),
(7, '06:45', '07:45', '6:45-7:45', 70000, 120000, 0, 7),
(8, '07:50', '08:50', '7:50-8:50', 70000, 120000, 0, 8),
(9, '08:55', '09:55', '8:55-9:55', 70000, 120000, 0, 9),
(10, '10:00', '11:00', '10:00-11:00', 70000, 120000, 0, 10),
(11, '11:05', '12:05', '11:05-12:05', 70000, 120000, 0, 11),
(12, '12:10', '13:10', '12:10-13:10', 70000, 120000, 0, 12),
(13, '13:15', '14:15', '13:15-14:15', 70000, 120000, 0, 13),
(14, '14:20', '15:20', '14:20-15:20', 70000, 120000, 0, 14),
(15, '15:25', '16:25', '15:25-16:25', 70000, 120000, 0, 15),
(16, '16:30', '17:30', '16:30-17:30', 70000, 120000, 0, 16),
(17, '17:35', '18:35', '17:35-18:35', 70000, 120000, 1, 17),
(18, '18:40', '19:40', '18:40-19:40', 70000, 120000, 1, 18),
(19, '19:45', '20:45', '19:45-20:45', 70000, 120000, 1, 19),
(20, '20:50', '21:50', '20:50-21:50', 70000, 120000, 1, 20),
(21, '21:55', '22:55', '21:55-22:55', 70000, 120000, 1, 21),
(22, '23:00', '00:00', '23:00-0:00', 70000, 120000, 0, 22)
ON DUPLICATE KEY UPDATE `display_label`=VALUES(`display_label`), `standard_price`=VALUES(`standard_price`), `peak_price`=VALUES(`peak_price`);

-- 4. Thêm Các Gói Hội Viên (Membership Packages)
INSERT INTO `membership_packages` (`id`, `code`, `name`, `price`, `duration_days`, `discount_percent`, `perks`, `description`, `badge_color`, `icon`, `active`) VALUES
(1, 'SILVER', 'Hội Viên Bạc (Silver)', 199000, 30, 5.0, 'Giảm 5% giá giờ chơi; Miễn phí gửi đồ tại quầy lễ tân; Tặng 1 khăn lạnh ướp hương mỗi buổi chơi; Giảm 10% khi mua nước căn tin', 'Gói khởi đầu tiết kiệm, đầy đủ tiện ích gửi đồ và khăn lạnh mỗi buổi tập', '#0284c7', 'fa-solid fa-medal', 1),
(2, 'GOLD', 'Hội Viên Vàng (Gold)', 499000, 90, 8.0, 'Giảm 8% giá giờ chơi; Miễn phí tủ locker riêng khi chơi; Tặng khăn tập & sấy khử khuẩn giày bằng UV 2 lần/tháng; Trợ giá 50% công căng vợt; Ưu tiên giữ ca giờ vàng', 'Gói phổ biến nhất, tặng kèm dịch vụ tủ locker riêng, sấy khử khuẩn giày và ưu đãi căng vợt', '#f59e0b', 'fa-solid fa-crown', 1),
(3, 'DIAMOND', 'Kim Cương VIP (Diamond)', 1290000, 365, 10.0, 'Giảm 10% giá giờ chơi (mức tối đa); Tủ đồ cá nhân riêng để vợt qua đêm; Miễn phí công căng cước vợt 6 lần/năm; Vệ sinh sấy khô khử khuẩn giày không giới hạn; Miễn phí set khăn tập & nước khoáng mỗi buổi', 'Đặc quyền đẳng cấp nhất hệ thống Ways Station Badminton', '#10b981', 'fa-solid fa-gem', 1),
(4, 'STUDENT', 'Gói Sinh Viên Thần Tốc', 99000, 30, 7.0, 'Giảm 7% giá giờ chơi ca sáng & chiều (trước 16:30); Miễn phí gửi balo & tài liệu học tập; Miễn phí mượn vợt tập; Tặng khăn lạnh mỗi buổi', 'Gói tiếp sức thể thao học đường với tiện ích gửi đồ an tâm và mượn vợt miễn phí', '#8b5cf6', 'fa-solid fa-graduation-cap', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `price`=VALUES(`price`), `discount_percent`=VALUES(`discount_percent`), `perks`=VALUES(`perks`);

-- 5. Thêm Tài Khoản Người Dùng Mẫu (Mật khẩu mặc định: '123456')
-- Hash SHA-256 của '123456': e10adc3949ba59abbe56e057f20f883e (hoặc mã hóa chuẩn hệ thống)
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `phone`, `role`, `membership_package_id`, `membership_expires_at`, `wallet_balance`, `status`) VALUES
(1, 'admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Quản Trị Viên Hệ Thống', 'admin@waysstation.vn', '0889555559', 'ROLE_ADMIN', 3, '2027-12-31 23:59:59', 5000000, 'ACTIVE'),
(2, 'hoivien_gold', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Nguyễn Văn Tuấn', 'tuan.badminton@gmail.com', '0909123456', 'ROLE_USER', 2, '2026-12-31 23:59:59', 850000, 'ACTIVE'),
(3, 'khachhang1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Trần Minh Đức', 'duc.tm@gmail.com', '0912345678', 'ROLE_USER', NULL, NULL, 0, 'ACTIVE')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`), `email`=VALUES(`email`), `phone`=VALUES(`phone`), `membership_package_id`=VALUES(`membership_package_id`);

-- 6. Thêm Lịch Sử Mua Gói Mẫu (User Memberships)
INSERT INTO `user_memberships` (`id`, `subscription_code`, `user_id`, `package_id`, `price_paid`, `discount_applied`, `start_date`, `end_date`, `payment_method`, `payment_status`, `transaction_code`, `notes`) VALUES
(1, 'SUB-202610-GOLD-01', 2, 2, 499000, 0, '2026-10-01 08:00:00', '2026-12-31 23:59:59', 'VIETQR', 'PAID', 'TXN-QR-889922', 'Kích hoạt gói Hội Viên Vàng 3 tháng'),
(2, 'SUB-202610-DIA-01', 1, 3, 1290000, 0, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 'SYSTEM', 'PAID', 'TXN-ADMIN-SYS', 'Tài khoản Quản Trị đặc quyền VIP')
ON DUPLICATE KEY UPDATE `price_paid`=VALUES(`price_paid`);
