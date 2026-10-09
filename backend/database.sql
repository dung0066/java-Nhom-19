-- ==========================================================
-- SCRIPT TẠO DATABASE VÀ DỮ LIỆU MẪU ĐẶT SÂN CẦU LÔNG (XAMPP / MySQL)
-- ==========================================================

-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS `dat_san_cau_long` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dat_san_cau_long`;

-- 2. Bảng Branches (Chi nhánh)
CREATE TABLE IF NOT EXISTS `branches` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `total_courts` INT
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

-- 5. Bảng Bookings (Đơn đặt sân)
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_code` VARCHAR(30) NOT NULL UNIQUE,
    `customer_name` VARCHAR(100) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `customer_email` VARCHAR(100),
    `booking_date` DATE NOT NULL,
    `branch_id` BIGINT NOT NULL,
    `total_price` DOUBLE,
    `total_hours` DOUBLE,
    `status` VARCHAR(30) DEFAULT 'CONFIRMED',
    `payment_method` VARCHAR(50) DEFAULT 'VIETQR',
    `notes` VARCHAR(500),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng Booking Details (Chi tiết từng khung giờ và sân)
CREATE TABLE IF NOT EXISTS `booking_details` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` BIGINT NOT NULL,
    `court_id` BIGINT NOT NULL,
    `time_slot_id` BIGINT NOT NULL,
    `slot_date` DATE NOT NULL,
    `price` DOUBLE,
    `status` VARCHAR(30) DEFAULT 'BOOKED',
    `pass_contact` VARCHAR(100),
    CONSTRAINT `fk_details_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_details_court` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`),
    CONSTRAINT `fk_details_timeslot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`),
    CONSTRAINT `uk_court_slot_date` UNIQUE (`court_id`, `time_slot_id`, `slot_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DỮ LIỆU BAN ĐẦU (SEED DATA)
-- ==========================================================

-- 1. Thêm Chi Nhánh
INSERT INTO `branches` (`id`, `code`, `name`, `address`, `phone`, `total_courts`) VALUES
(1, 'NVL', 'Ways Station NVL', '70 Nguyễn Văn Lượng, P. 10, Gò Vấp', '0889555559', 7),
(2, 'DQII', 'Ways Station DQII', '262 Dương Quảng Hàm, Gò Vấp', '0889555559', 6),
(3, 'NQA', 'Ways Station NQA', '86 Nguyễn Quý Anh, Tân Phú', '0889555559', 6),
(4, 'HB', 'Ways Station HB', '135 Hiệp Bình, Thủ Đức', '0889555559', 8)
ON DUPLICATE KEY UPDATE `code`=`code`;

-- 2. Thêm Sân cho chi nhánh NVL (Sân 1 -> Sân 7)
INSERT INTO `courts` (`id`, `branch_id`, `name`, `court_number`, `court_group`, `active`) VALUES
(1, 1, 'Sân 1', 1, 'Sân 1+2', 1),
(2, 1, 'Sân 2', 2, 'Sân 1+2', 1),
(3, 1, 'Sân 3', 3, 'Sân 3+4', 1),
(4, 1, 'Sân 4', 4, 'Sân 3+4', 1),
(5, 1, 'Sân 5', 5, 'Sân 5+6', 1),
(6, 1, 'Sân 6', 6, 'Sân 5+6', 1),
(7, 1, 'Sân 7', 7, 'Sân 7', 1)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- 3. Thêm các Khung Giờ (24h tương tự hình ảnh san.ways.io.vn)
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
ON DUPLICATE KEY UPDATE `display_label`=`display_label`;
