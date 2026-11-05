# 🏸 Hệ Thống Quản Lý & Đặt Sân Cầu Lông Trực Tuyến - Ways Station Badminton
> **Đồ Án Môn Học - Nhóm 19**  
> Kiến trúc Full-Stack hiện đại: **Spring Boot 3.4.1 (Java 17 LTS)** + **React 18 / Vite 8** + **MySQL 8 (XAMPP)** + **Dịch Vụ Google SMTP Email OTP**.

---

## 📑 Mục Lục
1. [Giới Thiệu Tổng Quan](#-giới-thiệu-tổng-quan)
2. [Kiến Trúc Công Nghệ](#-kiến-trúc-công-nghệ)
3. [Cấu Hình Dịch Vụ Google SMTP (Gửi Email OTP)](#-cấu-hình-dịch-vụ-google-smtp-gửi-email-otp)
4. [Quy Trình Quên Mật Khẩu & Đổi Mật Khẩu Bằng OTP 6 Số](#-quy-trình-quên-mật-khẩu--đổi-mật-khẩu-bằng-otp-6-số)
5. [Cấu Trúc Danh Mục API Hệ Thống (RESTful APIs)](#-cấu-trúc-danh-mục-api-hệ-thống-restful-apis)
6. [Hướng Dẫn Cài Đặt & Khởi Chạy Từ A-Z](#-hướng-dẫn-cài-đặt--khởi-chạy-từ-a-z)
7. [Tài Khoản Mẫu Kiểm Thử & Phân Quyền](#-tài-khoản-mẫu-kiểm-thử--phân-quyền)

---

## 🌟 Giới Thiệu Tổng Quan

**Ways Station Badminton** là giải pháp phần mềm quản lý toàn diện dành cho chuỗi sân cầu lông tiêu chuẩn thi đấu quốc tế BWF:
- **Dành cho Khách hàng**:
  - Xem sơ đồ sân và ma trận lịch trống thời gian thực theo 4 cụm chi nhánh lớn tại TP.HCM (`NVL`, `DQII`, `NQA`, `HB`).
  - Đặt sân đa khung giờ, thuê dụng cụ (vợt Yonex/Victor, giày thi đấu, nước giải khát) và dịch vụ căng cước chuẩn kg/lbs.
  - Tự động giữ chỗ trong 15 phút, thanh toán tiện lợi qua cổng VietQR động hoặc Ví điện tử nội bộ.
  - Sàn giao dịch chuyển nhượng suất chơi (Slot Transfer Marketplace) khi khách có lịch bận đột xuất.
  - Mua và quản lý các gói Hội viên VIP (Silver, Gold, Diamond, Student) với mức chiết khấu tự động.
- **Dành cho Quản trị viên (Admin & Staff)**:
  - Cổng Admin Dashboard 5 phân hệ: Quản lý đơn đặt sân (Check-in, Hủy, Duyệt thanh toán), Quản lý cơ sở sân & chi nhánh, Quản lý tài khoản khách hàng, Quản lý kho dụng cụ, Quản lý bảng giá & Tin tức giải đấu.
  - Chức năng **Đổi mật khẩu & Quên mật khẩu 2 lớp** bảo mật cao qua **Google SMTP Email OTP 6 số**, tự động sinh `resetToken` chống tấn công phát lại (Replay Attack).

---

## 🏗️ Kiến Trúc Công Nghệ

```
                  ┌───────────────────────────────────────────┐
                  │          React 18 + Vite Frontend         │
                  │   (GSAP Animations + Glassmorphism UI)    │
                  └─────────────────────┬─────────────────────┘
                                        │ HTTP / REST APIs (Port 5173 -> 8080)
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │        Spring Boot 3.4.1 (Java 17 LTS)    │
                  │  ┌─────────────────────────────────────┐  │
                  │  │ Spring Security 6 + JJWT (Stateless)│  │
                  │  ├─────────────────────────────────────┤  │
                  │  │ Spring Data JPA + Hibernate 6       │  │
                  │  ├─────────────────────────────────────┤  │
                  │  │ JavaMailSender (Google SMTP)        │  │
                  │  └─────────────────────────────────────┘  │
                  └──────────────┬──────────────────┬─────────┘
                                 │                  │
                JDBC Port 3306   │                  │ SMTP Port 587 (TLS)
                                 ▼                  ▼
                  ┌──────────────────────┐  ┌──────────────────┐
                  │ MySQL (dat_san_cau_  │  │ Google SMTP Mail │
                  │ long / XAMPP)        │  │ (smtp.gmail.com) │
                  └──────────────────────┘  └──────────────────┘
```

- **Backend**:
  - **Java 17 LTS** / **Spring Boot 3.4.1**
  - **Spring Security 6** kết hợp **JWT (JSON Web Token)** phân quyền `ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_USER`.
  - **Spring Data JPA** (`spring.jpa.hibernate.ddl-auto=update`), tự động map schema và khởi tạo dữ liệu mẫu với `DataInitializer`.
  - **JavaMailSender** hỗ trợ chuẩn TLSv1.2/TLSv1.3 với Google SMTP Server.
- **Frontend**:
  - **React 18** / **Vite 8**
  - Thư viện chuyển động **GSAP (GreenSock)** tạo trải nghiệm mượt mà.
  - Giao diện thiết kế theo phong cách hiện đại **Glassmorphism**, tối ưu hóa hiển thị Responsive.

---

## 📧 Cấu Hình Dịch Vụ Google SMTP (Gửi Email OTP)

Hệ thống tích hợp trực tiếp với máy chủ Gmail SMTP (`smtp.gmail.com:587`) để gửi email mã OTP 6 số với mẫu thư HTML tiêu chuẩn.

### 1. Chuẩn Bị Mật Khẩu Ứng Dụng (App Password)
Google yêu cầu sử dụng **App Password** 16 ký tự thay vì mật khẩu thông thường:
1. Truy cập [https://myaccount.google.com/security](https://myaccount.google.com/security) và bật **Xác minh 2 bước (2-Step Verification)**.
2. Truy cập [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Tại ô đặt tên ứng dụng, nhập `WaysStation` rồi nhấn nút **Tạo (Create)**.
4. Google sẽ hiển thị một mật khẩu 16 chữ cái (dạng `abcd efgh ijkl mnop`). Hãy sao chép mã này.

### 2. Thiết Lập File Môi Trường `.env`
Tạo hoặc mở file `.env` tại thư mục gốc của dự án (`H:\java-Nhom-19\.env`) và điền thông tin:

```env
# ==========================================================
# CẤU HÌNH GMAIL SMTP (GỬI MÃ OTP TỰ ĐỘNG)
# ==========================================================
MAIL_USERNAME=email_cua_ban@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
```

> [!TIP]
> Hệ thống được lập trình tự động nạp các biến từ file `.env` vào bộ nhớ Spring Boot khi khởi động (`DatSanCauLongApplication.java`). Bạn không cần cấu hình biến môi trường thủ công trên Windows.

### 3. Kiểm Tra Kết Nối SMTP Trực Tiếp
Sau khi điền thông tin vào `.env`, bạn có thể kiểm tra gửi mail thử nghiệm bằng lệnh:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/test-mail" -Method POST -Body '{"email":"email_nhan_test@gmail.com"}' -ContentType "application/json"
```
Kết quả trả về:
```json
{
  "success": true,
  "message": "Đã gửi email test thành công tới: email_nhan_test@gmail.com"
}
```

> [!NOTE]
> **Cơ chế Fallback thông minh:** Khi chạy máy tính không có internet hoặc chưa điền mã App Password, hệ thống **không làm gián đoạn** hoạt động: mã OTP 6 số vẫn được ghi rõ ràng vào Console Log của Backend và gửi kèm trong phản hồi JSON để giảng viên/sinh viên kiểm thử đồ án bình thường.

---

## 🔐 Quy Trình Quên Mật Khẩu & Đổi Mật Khẩu Bằng OTP 6 Số

Quy trình bảo mật 3 bước chuẩn BWF chống tấn công Brute-force và Replay Attack:

```
[Người dùng / Admin]
       │
       ▼ (1) Yêu cầu gửi OTP
POST /api/auth/forgot-password/send-otp { identifier: "admin" }
       │
       ├─► Server tạo OTP 6 số ngẫu nhiên (hiệu lực 10 phút)
       ├─► Gửi Email HTML qua Google SMTP
       ▼
[Nhập mã 6 số OTP vào giao diện]
       │
       ▼ (2) Xác thực mã OTP từ Server
POST /api/auth/forgot-password/verify-otp { identifier: "admin", otp: "123456" }
       │
       ├─► Server kiểm tra tính hợp lệ & đánh dấu OTP đã sử dụng
       ├─► Cấp chuỗi bí mật resetToken (SHA-256 64 ký tự)
       ▼
[Frontend tự động chuyển tiếp sang Form Đặt Mật Khẩu Mới]
       │
       ▼ (3) Đặt mật khẩu mới với Token
POST /api/auth/forgot-password/reset-password { resetToken: "...", newPassword: "..." }
       │
       ├─► Kiểm tra mật khẩu >= 6 ký tự
       ├─► Mã hóa BCrypt & cập nhật DB MySQL
       ├─► Tiêu hủy token
       ▼
[Thông báo thành công & Tự động đăng nhập]
```

---

## 🌐 Cấu Trúc Danh Mục API Hệ Thống (RESTful APIs)

### 1. Xác Thực & Đổi Mật Khẩu (`/api/auth`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản khách hàng mới |
| `POST` | `/api/auth/login` | Public | Đăng nhập (hỗ trợ Username, Email hoặc SĐT) |
| `GET` | `/api/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại kèm gói Hội viên |
| `PUT` | `/api/auth/profile` | Authenticated | Cập nhật họ tên, số điện thoại, avatar |
| `POST` | `/api/auth/change-password` | Authenticated | Đổi mật khẩu thông thường bằng mật khẩu cũ |
| `POST` | `/api/auth/forgot-password/send-otp` | Public | **Bước 1**: Gửi OTP 6 số đặt lại mật khẩu qua Email |
| `POST` | `/api/auth/forgot-password/verify-otp` | Public | **Bước 2**: Xác thực OTP & nhận `resetToken` |
| `POST` | `/api/auth/forgot-password/reset-password` | Public | **Bước 3**: Cập nhật mật khẩu mới bằng `resetToken` |
| `POST` | `/api/auth/otp/send-change-password-otp` | Authenticated | Gửi mã OTP đổi mật khẩu cho Admin/User đã đăng nhập |
| `POST` | `/api/auth/otp/verify-and-change-password` | Authenticated | Xác thực OTP và cập nhật mật khẩu tức thì |
| `POST` | `/api/auth/test-mail` | Public | Kiểm tra kết nối gửi thư Google SMTP |

### 2. Đặt Sân & Lịch Trình (`/api/booking`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/booking/branches` | Public | Lấy danh sách toàn bộ cụm chi nhánh |
| `GET` | `/api/booking/matrix?branch={code}&date={YYYY-MM-DD}` | Public | Lấy ma trận trạng thái slot sân theo ngày |
| `POST` | `/api/booking/create` | Public | Tạo đơn đặt sân trực tuyến kèm dịch vụ thuê đồ |
| `GET` | `/api/booking/lookup/{code}` | Public | Tra cứu chi tiết đơn đặt sân qua mã đơn (Booking Code) |
| `GET` | `/api/booking/all` | Public | Xem danh sách tất cả các đơn đặt sân |
| `DELETE`| `/api/booking/cancel/{id}` | Public/User | Hủy đơn đặt sân |

### 3. Dụng Cụ, Vợt & Giày Cầu Lông (`/api/products`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Danh sách vợt cho thuê, giày thi đấu, phụ kiện |
| `GET` | `/api/products/{id}` | Public | Chi tiết thông số kỹ thuật sản phẩm |
| `POST` | `/api/products` | `ADMIN` / `STAFF` | Thêm mới sản phẩm vào kho |
| `PUT` | `/api/products/{id}` | `ADMIN` / `STAFF` | Cập nhật thông tin, giá thuê và số lượng tồn kho |
| `DELETE`| `/api/products/{id}` | `ADMIN` / `STAFF` | Xóa sản phẩm khỏi danh mục |

### 4. Chi Nhánh & Sân Đấu (`/api/branches` & `/api/courts`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/branches` | Public | Lấy danh sách chi nhánh hoạt động |
| `POST` | `/api/branches` | `ADMIN` | Tạo thêm chi nhánh sân mới |
| `PUT` | `/api/branches/{id}` | `ADMIN` | Sửa thông tin, địa chỉ, hotline chi nhánh |
| `DELETE`| `/api/branches/{id}` | `ADMIN` | Xóa chi nhánh |
| `GET` | `/api/courts` | Public | Danh sách sân cầu lông kèm phân nhóm thảm Taraflex |
| `POST` | `/api/courts` | `ADMIN` | Thêm sân đấu mới vào cơ sở |
| `PUT` | `/api/courts/{id}` | `ADMIN` | Cập nhật số sân, tên sân, loại thảm thi đấu |
| `PATCH`| `/api/courts/{id}/toggle-active` | `ADMIN` | Bật / Tắt trạng thái bảo trì của sân đấu |
| `DELETE`| `/api/courts/{id}` | `ADMIN` | Xóa sân đấu |

### 5. Tin Tức & Bài Viết (`/api/articles`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/articles` | Public | Danh sách tin tức thể thao, sự kiện giải đấu |
| `POST` | `/api/articles` | `ADMIN` / `STAFF` | Đăng bài viết mới |
| `PUT` | `/api/articles/{id}` | `ADMIN` / `STAFF` | Cập nhật nội dung bài viết |
| `PATCH`| `/api/articles/{id}/toggle` | `ADMIN` / `STAFF` | Bật / Ẩn bài viết khỏi trang chủ |
| `DELETE`| `/api/articles/{id}` | `ADMIN` / `STAFF` | Xóa bài viết |

### 6. Gói Hội Viên & Ví Điện Tử (`/api/memberships` & `/api/wallet`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/memberships/packages` | Public | Danh sách gói hội viên: Silver, Gold, Diamond, Student |
| `POST` | `/api/memberships/buy` | Authenticated | Đăng ký mua gói hội viên trừ tiền qua ví |
| `GET` | `/api/wallet/balance` | Authenticated | Kiểm tra số dư ví hiện tại |
| `POST` | `/api/wallet/topup` | Authenticated | Nạp tiền vào tài khoản ví |
| `POST` | `/api/wallet/pay` | Authenticated | Thanh toán đơn hàng trực tiếp bằng số dư ví |

### 7. Cổng Quản Trị Hệ Thống (`/api/admin`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `ADMIN` / `STAFF` | Thống kê doanh thu, tỷ lệ lấp đầy sân, số đơn trong ngày |
| `GET` | `/api/admin/bookings` | `ADMIN` / `STAFF` | Danh sách đơn đặt sân phân trang, lọc theo trạng thái |
| `POST` | `/api/admin/bookings/{id}/confirm` | `ADMIN` / `STAFF` | Xác nhận đơn đã thanh toán |
| `POST` | `/api/admin/bookings/{id}/checkin` | `ADMIN` / `STAFF` | Khách đến sân nhận ca đấu (Check-in) |
| `POST` | `/api/admin/bookings/{id}/cancel` | `ADMIN` / `STAFF` | Hủy đơn đặt sân |
| `GET` | `/api/admin/users` | `ADMIN` | Quản lý danh sách tài khoản người dùng |
| `PATCH`| `/api/admin/users/{id}/toggle-status`| `ADMIN` | Khóa / Kích hoạt tài khoản người dùng |
| `DELETE`| `/api/admin/users/{id}` | `ADMIN` | Xóa tài khoản |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Từ A-Z

### 1. Yêu Cầu Môi Trường
- **Cơ sở dữ liệu**: XAMPP (chạy Apache & MySQL trên cổng 3306).
- **Backend**: **JDK 17 LTS** (khuyến nghị Java 17 để tương thích hoàn toàn với Spring Boot 3.4.1 và Lombok).
- **Frontend**: **Node.js 18+** / **npm 9+**.

### 2. Thiết Lập Cơ Sở Dữ Liệu MySQL
1. Mở **XAMPP Control Panel** và Start module **MySQL**.
2. Mở trình duyệt truy cập: `http://localhost/phpmyadmin`.
3. Tạo Database mới có tên: `dat_san_cau_long` với bảng mã `utf8mb4_unicode_ci`.
*(Khi khởi chạy, Hibernate với chế độ `ddl-auto=update` và lớp `DataInitializer` sẽ tự động tạo bảng và nạp toàn bộ dữ liệu mẫu ban đầu)*.

### 3. Cấu Hình File `.env` (Google SMTP)
Tạo file `.env` tại thư mục gốc dự án:
```env
MAIL_USERNAME=email_cua_ban@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
```

### 4. Khởi Chạy Backend (Spring Boot)
Mở PowerShell tại thư mục dự án:
```powershell
# Chỉ định JAVA_HOME tới thư mục JDK 17
$env:JAVA_HOME = "D:\Online Games\Minecraft\Java" # hoặc đường dẫn JDK 17 trên máy bạn
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# Di chuyển vào thư mục backend và chạy
cd backend
.\mvnw.cmd spring-boot:run
```
- Khi màn hình xuất hiện: `Tomcat started on port 8080 (http)` $\rightarrow$ Backend đã sẵn sàng!

### 5. Khởi Chạy Frontend (React Vite)
Mở một cửa sổ PowerShell mới:
```powershell
cd frontend
npm install
npm run dev
```
- Mở trình duyệt truy cập: `http://localhost:5173/`

---

## 🔑 Tài Khoản Mẫu Kiểm Thử & Phân Quyền

Toàn bộ tài khoản khởi tạo mặc định đều có mật khẩu là: `123456`

| Tên Đăng Nhập (Username) | Mật Khẩu | Email Đăng Ký | Quyền Hạn (Role) | Chức Năng Chính |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `123456` | `admin@waysstation.vn` | `ROLE_ADMIN` | Toàn quyền Quản Trị Hệ Thống, Duyệt đơn, Đổi mật khẩu bằng Email OTP |
| `staff_govap` | `123456` | `staff.gv@waysstation.vn` | `ROLE_STAFF` | Nhân viên quản lý ca đấu và check-in tại sân |
| `hoivien_gold` | `123456` | `gold@waysstation.vn` | `ROLE_USER` | Hội viên Gold (giảm 15%), số dư ví 5.000.000 đ |
| `hungnguyen` | `123456` | `hung.nv@gmail.com` | `ROLE_USER` | Khách hàng thành viên thường |

---

## 👥 Thành Viên Thực Hiện (Nhóm 19)
- **Đề Tài**: Hệ thống Quản Lý & Đặt Sân Cầu Lông Trực Tuyến Ways Station Badminton.
- Bản quyền thuộc về **Nhóm 19** - Đồ án môn học Công Nghệ Phần Mềm / Lập Trình Ứng Dụng Nâng Cao.
