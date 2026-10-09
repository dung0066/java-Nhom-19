# Ways Station Badminton Management & Online Booking System

Hệ thống đặt sân cầu lông trực tuyến tiêu chuẩn quốc tế BWF và quản trị hệ thống toàn diện cho Ways Station Badminton Club.

---

## 🌟 Tính Năng Nổi Bật

- **Giao Diện Trang Chủ Hiện Đại (GSAP Animations)**:
  - Hero Slideshow 5 phong cách hoạt cảnh động độc bản (Kinetic Power Smash, 3D Depth Card, Golden Luxury VIP...).
  - Thanh Dock phân tầng kính mờ cao cấp (Apple/macOS Glassmorphism) với con trượt động thích ứng dải màu (GSAP Sliding Pill Indicator).
  - Tùy chọn song ngữ Tiếng Việt 🇻🇳 / Tiếng Anh 🇬🇧 chuyển đổi tức thì.
- **Quy Trình Đặt Sân & Tính Đơn Trọn Gói 4 Bước**:
  - **Bước 1 - Giờ Đặt Sân**: Chọn khung giờ ma trận thời gian thực, tự động chiết khấu gói Combo Giờ Vắng (Off-Peak) giảm 35% - 40%.
  - **Bước 2 - Dịch Vụ Đi Kèm**: Tích hợp đồ uống bù khoáng (Pocari, Revive, LaVie), khăn lạnh/cotton kháng khuẩn, thuê giày UV và vợt thi đấu.
  - **Bước 3 - Căng Cước Vợt**: Chọn loại dây cước Yonex/Lining/Kizuna, mức căng kg/lbs (9.5kg - 12.5kg) và kiểu đan 2/4 nút.
  - **Bước 4 - Bảng Kê & Đóng Đơn**: Bảng kê chi tiết đơn hàng, chuyển khoản VietQR MB Bank hoặc tiền mặt, lưu trữ danh sách đơn đã đóng.
- **Cổng Quản Trị Hệ Thống (Admin Portal)**:
  - Bảng điều khiển phân tích doanh thu, tỷ lệ lấp đầy sân, quản lý lịch đặt sân và sản phẩm.

---

## 🏗️ Kiến Trúc Công Nghệ

- **Frontend**:
  - React 18 / Vite
  - GSAP (GreenSock Animation Platform)
  - Vanilla CSS / Glassmorphism
  - Context API (Bilingual i18n & Theme)
- **Backend**:
  - Java 17+ / Spring Boot
  - Spring Data JPA / RESTful APIs
  - H2 Database / MySQL
  - Maven

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi chạy Frontend:
```bash
cd frontend
npm install
npm run dev
```
Truy cập: `http://localhost:5173/`

### 2. Khởi chạy Backend:
```bash
cd backend
./mvnw spring-boot:run
```
API Endpoint: `http://localhost:8080/`

---

## 📄 Bản Quyền
Bản quyền thuộc về **Ways Station Badminton Club**. Bảo lưu mọi quyền.
