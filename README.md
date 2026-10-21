# Ways Station Badminton Management & Online Booking System (V2 Architecture)

Hệ thống đặt sân cầu lông trực tuyến tiêu chuẩn quốc tế BWF và cổng quản trị hệ thống toàn diện cho **Ways Station Badminton Club**.
Hệ thống được tái cấu trúc hoàn chỉnh theo chuẩn **Database V2** (27 bảng, 4 views, MySQL 8.0.16+, `spring.jpa.hibernate.ddl-auto=validate`).

---

## 🌟 Tính Năng Nổi Bật

- **Giao Diện Đặt Sân & Trang Chủ Hiện Đại (GSAP Animations + Glassmorphism)**:
  - Hero Showcase đa dạng hoạt cảnh động độc bản (Kinetic Power Smash, 3D Depth Card, Golden Luxury VIP...).
  - Ma trận lịch đặt sân thời gian thực theo 4 cơ sở chi nhánh (`NVL`, `Q8`, `NQA`, `HB`).
  - Động cơ định giá động (`PricingService`): giờ vàng cao điểm, ngày cuối tuần, ưu đãi hội viên Silver/Gold/Diamond/Student.
- **Quy Trình Đặt Sân & Dịch Vụ 4 Bước Không Mock Fallback**:
  - **Bước 1 - Giờ Đặt Sân**: Khóa slot thời gian thực theo cơ chế `holdExpiresAt` (giữ chỗ 15 phút).
  - **Bước 2 - Dịch Vụ Đi Kèm**: Thuê vợt, giày thi đấu, nước giải khát bù khoáng trừ tồn kho nguyên tử (`deductStockAtomic`), báo lỗi 409 Conflict khi hết hàng.
  - **Bước 3 - Căng Cước Vợt**: Tùy chỉnh thông số cước Yonex/Lining/Kizuna và mức căng kg/lbs.
  - **Bước 4 - Thanh Toán & Giữ Chỗ**: Sinh mã QR VietQR tự động, đồng hồ đếm ngược giữ chỗ, kiểm tra trạng thái thanh toán thời gian thực.
- **Sàn Giao Dịch Chuyển Nhượng Suất Chơi (Slot Transfer Marketplace)**:
  - Cho phép người đặt sân pass lại slot không thể chơi (`POST /api/transfers/list`).
  - Khách hàng khác có thể nhận lại slot (`POST /api/transfers/{id}/claim`) bảo đảm an toàn giao dịch.
- **Hệ Thống Hội Viên & Ví Điện Tử Nội Bộ**:
  - Gói thành viên Silver, Gold, Diamond và Student (sinh viên giảm 30% khung giờ trước 16:30).
  - Ví điện tử nạp tiền (`/api/wallet/topup`), thanh toán tức thì trừ số dư nguyên tử bảo vệ chống âm tiền.
- **Cổng Quản Trị Hệ Thống (Admin Portal & Role Guard)**:
  - Phân quyền nghiêm ngặt với Spring Security 6 và JWT (`ROLE_ADMIN`, `ROLE_STAFF`).
  - Quản lý đơn đặt sân, check-in, hủy đơn, duyệt thanh toán, quản lý kho dụng cụ và cấu hình giá.

---

## 🏗️ Kiến Trúc Công Nghệ

- **Backend**:
  - **Java 21 LTS** / **Spring Boot 3.4.1**
  - **Spring Security 6** + **JJWT (0.12.6)** (Stateless, Bearer Token)
  - **Spring Data JPA** / **Hibernate 6** với `spring.jpa.hibernate.ddl-auto=validate`
  - **MySQL 8.0.16+** (Tận dụng JSON Specs, CHECK constraint, Generated Columns)
  - **BigDecimal** xử lý 100% tiền tệ, Enums ánh xạ `STRING`
  - Zero mock fallback trên các API ghi dữ liệu
- **Frontend**:
  - **React 18** / **Vite 8**
  - **GSAP (GreenSock Animation Platform)**
  - **Vanilla CSS** chuẩn Glassmorphism
  - Axios / Native Fetch tự động gắn JWT Header
  - Đa ngôn ngữ song ngữ Tiếng Việt 🇻🇳 / Tiếng Anh 🇬🇧

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chuẩn Bị Cơ Sở Dữ Liệu MySQL 8

Tạo database `badminton_court_booking` và import schema chuẩn V2:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS badminton_court_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p badminton_court_booking < database_v2_27bang.sql
```

> **Lưu ý:** File `database_v2_27bang.sql` chứa toàn bộ 27 bảng, 4 views, các ràng buộc toàn vẹn và dữ liệu mẫu đầy đủ.

### 2. Cấu Hình Backend (`backend/src/main/resources/application.properties`)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/badminton_court_booking?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=validate
```

### 3. Chạy Backend:
```bash
cd backend
./mvnw clean spring-boot:run
```
- API Base URL: `http://localhost:8080/api`
- Chạy toàn bộ 32 test tích hợp:
  ```bash
  ./mvnw test
  ```

### 4. Chạy Frontend:
```bash
cd frontend
npm install
npm run dev
```
- Truy cập Website: `http://localhost:5173/`
- Kiểm tra build production:
  ```bash
  npm run build
  ```

---

## 🔑 Tài Khoản Mẫu Kiểm Thử (Seed Users)

Mật khẩu mặc định cho toàn bộ tài khoản thử nghiệm là: `123456`

| Tài Khoản (Username) | Quyền Hạn (Role) | Mô Tả & Dữ Liệu Sẵn Có |
|---|---|---|
| `admin` | `ROLE_ADMIN` | Toàn quyền quản trị hệ thống, duyệt đơn, cấu hình giá, quản lý kho thiết bị |
| `hoivien_gold` | `ROLE_USER` | Hội viên Gold (chiết khấu 15%), số dư ví 500.000 đ |
| `khachhang1` | `ROLE_USER` | Khách hàng thành viên thường, số dư ví 100.000 đ |

---

## 📄 Bản Quyền
Bản quyền thuộc về **Ways Station Badminton Club**.
