-- ==========================================================================
-- DU LIEU DEMO LON - chay SAU database_v2_19bang.sql de thu phan trang / tim kiem / loc
--   mysql -u root < database_v2_19bang.sql
--   mysql -u root < sample_data_demo.sql
-- Them: 60 khach hang, 17 san pham, 40 bai viet, 150 don dat san (kem chi tiet + thanh toan)
-- Mat khau tai khoan demo = '123456' (cung ma BCrypt voi tai khoan mau)
-- ==========================================================================
USE `dat_san_cau_long`;
SET NAMES utf8mb4;

-- 1. Khach hang demo: user_001 .. user_060 (SDT 0900000001.., email user_xxx@example.com)
INSERT INTO `users` (`username`, `password`, `full_name`, `email`, `phone`, `role`, `status`)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 60)
SELECT CONCAT('user_', LPAD(i, 3, '0')),
       '$2a$10$7Jc5UoKPUfmL/MnAMk3f.OtRfR1BWxjjNm2dtPTMzc1lcV/Yv.tFq',
       CONCAT('Khách Hàng Demo ', LPAD(i, 3, '0')),
       CONCAT('user_', LPAD(i, 3, '0'), '@example.com'),
       CONCAT('090', LPAD(i, 7, '0')),
       'ROLE_USER',
       CASE WHEN i % 15 = 0 THEN 'LOCKED' ELSE 'ACTIVE' END
FROM n;

INSERT INTO `wallets` (`user_id`, `balance`)
SELECT id, 100000 FROM users WHERE username LIKE 'user\_%';

-- 2. San pham demo (thuoc 5 danh muc co san)
INSERT INTO `products` (`category_id`, `name`, `brand`, `product_type`, `price`, `price_unit`, `badge`, `description`)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 17)
SELECT 1 + (i % 5),
       CONCAT('Sản phẩm demo ', LPAD(i, 2, '0')),
       ELT(1 + (i % 4), 'Yonex', 'Lining', 'Victor', 'Kawasaki'),
       IF(i % 2 = 0, 'RENTAL', 'RETAIL'),
       10000 + i * 5000,
       IF(i % 2 = 0, '/ ca chơi', '/ cái'),
       NULL,
       'Dữ liệu demo để thử phân trang và tìm kiếm'
FROM n;

INSERT INTO `product_inventory` (`branch_id`, `product_id`, `stock_quantity`)
SELECT b.id, p.id, 20 FROM branches b CROSS JOIN products p
WHERE p.name LIKE 'Sản phẩm demo%';

-- 3. Bai viet demo
INSERT INTO `articles` (`title`, `summary`, `content`, `category`, `category_label`, `author`, `published`)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 40)
SELECT CONCAT('Bài viết demo số ', i),
       'Tóm tắt ngắn của bài viết demo.',
       'Nội dung bài viết demo dùng để kiểm tra phân trang và tìm kiếm.',
       IF(i % 2 = 0, 'TIN_TUC', 'HUONG_DAN'),
       IF(i % 2 = 0, 'Tin Tức', 'Hướng Dẫn'),
       'D2 Media',
       i % 10 <> 0
FROM n;

-- 4. Don dat san demo: 150 don, moi don 1 slot (khong trung san/khung gio/ngay)
INSERT INTO `bookings` (`booking_code`, `user_id`, `branch_id`, `customer_name`, `customer_phone`, `customer_email`, `status`, `created_at`)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 150)
SELECT CONCAT('WAY-DEMO-', LPAD(n.i, 4, '0')),
       u.id,
       1 + (n.i % 4),
       u.full_name, u.phone, u.email,
       ELT(1 + (n.i % 4), 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'PENDING'),
       NOW() - INTERVAL n.i HOUR
FROM n
JOIN users u ON u.username = CONCAT('user_', LPAD(1 + (n.i % 60), 3, '0'));

INSERT INTO `booking_details` (`booking_id`, `branch_id`, `court_id`, `time_slot_id`, `slot_date`, `price`, `status`)
WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 150)
SELECT b.id, b.branch_id, c.id,
       1 + ((n.i DIV 24) % 12) + 6,
       CURDATE() + INTERVAL (n.i % 7) - 3 DAY,
       IF(1 + ((n.i DIV 24) % 12) + 6 >= 17, 120000, 70000),
       CASE b.status WHEN 'CANCELLED' THEN 'CANCELLED' WHEN 'COMPLETED' THEN 'COMPLETED' ELSE 'BOOKED' END
FROM n
JOIN bookings b ON b.booking_code = CONCAT('WAY-DEMO-', LPAD(n.i, 4, '0'))
JOIN courts c ON c.branch_id = b.branch_id AND c.court_number = 1 + ((n.i DIV 4) % 6);

-- 5. Thanh toan cho cac don khong bi huy
INSERT INTO `payments` (`payment_code`, `purpose`, `user_id`, `booking_id`, `amount`, `method`, `status`, `paid_at`)
SELECT CONCAT('PAY-DEMO-', LPAD(SUBSTRING(b.booking_code, 10), 4, '0')),
       'BOOKING', b.user_id, b.id, d.price,
       ELT(1 + (b.id % 3), 'VIETQR', 'CASH', 'WALLET'),
       IF(b.status IN ('CONFIRMED', 'COMPLETED'), 'PAID', 'PENDING'),
       IF(b.status IN ('CONFIRMED', 'COMPLETED'), b.created_at, NULL)
FROM bookings b
JOIN booking_details d ON d.booking_id = b.id
WHERE b.booking_code LIKE 'WAY-DEMO-%' AND b.status <> 'CANCELLED';
