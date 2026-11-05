# PROMPT: Refactor đồ án "D2 BadmintonShop" sang Database v2 (27 bảng)

> **Chuẩn bị trước khi dán prompt:**
> 1. Mở thư mục project `java-Nhom-19` làm workspace.
> 2. Copy 3 file vào workspace: `backend/database/database_v2_27bang.sql`, `docs/erd_v2_27bang.mermaid`, `docs/database_v2_27bang_danh_sach_bang.xlsx` (hoặc chỉ cần file .sql và .mermaid).
> 3. Tạo MySQL 8.0+ local (XAMPP bản MySQL 8 hoặc Docker), chạy file `.sql` một lần để có database `dat_san_cau_long`.
> 4. Dán toàn bộ phần bên dưới đường kẻ vào Antigravity (nếu có chế độ Planning thì bật).

---

## 1. VAI TRÒ VÀ MỤC TIÊU

Bạn là senior Java/Spring Boot engineer. Hãy **refactor toàn bộ backend (và phần frontend bị ảnh hưởng)** của đồ án đặt sân cầu lông trong workspace này để chạy đúng trên **schema database v2** nằm ở `backend/database/database_v2_27bang.sql` (27 bảng, 4 view, MySQL 8.0.16+).

Project hiện tại: Spring Boot 3.4.1, Java 21, Spring Data JPA, MySQL; frontend React 18 + Vite + GSAP trong `frontend/`. Package gốc Java giữ nguyên `com.example.Dat_san_cau_long`.

**Nguyên tắc cứng:**
- File `.sql` là **nguồn sự thật**. **Không tự ý sửa schema.** Nếu thấy bắt buộc phải sửa, dừng lại, nêu lý do và đề xuất đoạn SQL diff rồi chờ tôi duyệt.
- Giữ nguyên tên endpoint và tên field JSON mà frontend đang dùng, **trừ** những chỗ mục 6 và 7 nói rõ phải đổi. Mục tiêu là frontend sửa ít nhất có thể.
- Không viết code giả (stub, TODO rỗng, mock trả về thành công). Mỗi chức năng đã làm phải chạy được thật.
- Làm theo từng phase (mục 9). **Trước khi code, hãy đọc toàn bộ project và tạo implementation plan + task list**, rồi mới bắt đầu. Mỗi phase phải build và test xanh mới sang phase sau, mỗi phase một commit riêng.

---

## 2. DANH SÁCH 27 BẢNG VÀ MỨC ĐỘ TRIỂN KHAI

**Mức 1: làm đầy đủ (entity + repository + service + API + frontend nếu có liên quan):**
`branches`, `courts`, `time_slots`, `price_rules`, `users`, `wallets`, `membership_packages`, `package_benefits`, `user_memberships`, `bookings`, `booking_details`, `payments`, `product_categories`, `products`, `product_inventory`, `booking_items`, `slot_transfers`

**Mức 2: chỉ cần entity + repository đúng mapping (để `ddl-auto=validate` qua), chưa cần API/UI** trừ những chỗ mục 5 nhắc tới:
`court_groups`, `court_blocks`, `recurring_bookings`, `membership_usage`, `vouchers`, `refunds`, `reviews`, `notifications`, `password_reset_tokens`, `staff_branches`

Các bảng đã **bị bỏ khỏi v2**, tuyệt đối không tạo lại: `holidays`, `wallet_transactions`, `product_specs`, `audit_logs`.

---

## 3. QUY TẮC MAPPING DATABASE → JPA

1. `spring.jpa.hibernate.ddl-auto=validate` (không còn `update`). Schema chỉ do file `.sql` tạo.
   Nếu validate báo lỗi do kiểu cột (ENUM, JSON, generated column), **sửa mapping** (ví dụ `@JdbcTypeCode`, `columnDefinition`), không sửa schema. Chỉ khi bất khả thi mới dùng `ddl-auto=none` và phải ghi rõ lý do trong README.
2. **Tiền:** mọi cột `DECIMAL` → `BigDecimal`. Không dùng `Double`/`double` cho tiền ở bất cứ tầng nào (entity, DTO, service).
3. **Giờ:** `time_slots.start_time/end_time` là `TIME` → `LocalTime`. Slot cuối `23:00–00:00` qua nửa đêm, chú ý khi so sánh.
4. **ENUM:** tạo Java `enum` cho mọi cột ENUM (`UserRole`, `UserStatus`, `BookingStatus`, `BookingDetailStatus`, `PaymentPurpose`, `PaymentMethod`, `PaymentStatus`, `MembershipStatus`, `PriceDayType`, `BenefitType`, `QuotaPeriod`, `TransferStatus`, `ProductType`, `BookingItemStatus`...). Dùng `@Enumerated(EnumType.STRING)`. **Xóa toàn bộ chuỗi trạng thái hardcode** (`"BOOKED"`, `"CONFIRMED"`, `"PASS_WANTED"`...) khỏi code.
5. **Generated column:** `booking_details.active_slot_key` map `@Column(insertable = false, updatable = false)`, chỉ đọc, không bao giờ set từ code.
6. **Khóa chính kép / khóa chính chung:** `staff_branches (user_id, branch_id)` và `product_inventory (branch_id, product_id)` dùng `@EmbeddedId`; `wallets.user_id` vừa là PK vừa là FK → `@MapsId`.
7. **`booking_details.branch_id`** là cột thường (`Long`), luôn set = `booking.branch.id`; DB có FK kép ép `court.branch_id` phải trùng. Service phải kiểm tra trước để báo lỗi dễ hiểu thay vì để DB ném lỗi FK.
8. **`products.specs`** kiểu JSON → `@JdbcTypeCode(SqlTypes.JSON) Map<String,String>`.
9. **View** (`v_booking_totals`, `v_user_active_membership`, `v_branch_court_count`, `v_time_slots`): không bắt buộc map entity. Có thể dùng projection/native query hoặc `@Immutable`; hoặc tính lại trong service cho cùng kết quả.
10. Mọi `@ManyToOne` dùng `fetch = LAZY`; query danh sách dùng `JOIN FETCH` hoặc `@EntityGraph` để tránh N+1. Không dùng `FetchType.EAGER` bừa.
11. Dùng **Lombok** để bỏ builder/getter/setter viết tay (thêm dependency nếu chưa có).
12. Xóa cấu trúc cũ không còn trong v2: `branches.total_courts`, `courts.name/court_group`, `time_slots.display_label/standard_price/peak_price/is_peak_hour`, `users.membership_package_id/membership_expires_at/wallet_balance`, `bookings.booking_date/original_price/total_price/total_hours`, `booking_details.pass_contact`, `products.spec1/spec2`, và các cột thanh toán cũ trong `user_memberships`.

---

## 4. CÁC GIÁ TRỊ TỪNG LƯU SẴN NAY PHẢI TÍNH Ở TẦNG DTO/SERVICE

Để frontend ít phải đổi, API vẫn trả các field cũ nhưng **tính từ dữ liệu**:

| Field cũ trong JSON | Cách tính |
|---|---|
| `branch.totalCourts` | số `courts` active của chi nhánh |
| `court.name` | `"Sân " + courtNumber`; `court.courtGroup` = tên từ `court_groups` |
| `timeSlot.displayLabel` | `H:mm-H:mm` từ start/end, ví dụ `0:15-1:15`, `23:00-0:00` |
| `timeSlot.standardPrice / peakPrice / isPeakHour` | thay bằng `price` (đã resolve theo chi nhánh + ngày) và `isPeak` (= giá resolve > giá nền `priority 0`) |
| `booking.bookingDate` | ngày `slot_date` nhỏ nhất của các detail chưa hủy |
| `booking.totalHours` | số detail chưa `CANCELLED` (mỗi slot = 1 giờ) |
| `booking.originalPrice` | tổng `price` các detail chưa hủy + tổng `quantity*unit_price` các item chưa hủy |
| `booking.totalPrice` | `originalPrice - discountAmount` |
| `user.isMember / membershipPackage / membershipExpiresAt / discountPercent` | từ membership đang hiệu lực (xem mục 5.4) |
| `user.walletBalance` | `wallets.balance` |

---

## 5. NGHIỆP VỤ CẦN CÀI ĐẶT

### 5.1 Bảng giá động (`price_rules`)
Tạo `PricingService.resolvePrice(branchId, timeSlotId, date)`:
- Rule hợp lệ khi: `active = true`; `branch_id` NULL hoặc = chi nhánh; `time_slot_id` NULL hoặc = slot; `valid_from/valid_to` NULL hoặc chứa `date`; `day_type` = `ALL`, hoặc `WEEKEND` khi thứ 7/CN, hoặc `WEEKDAY` khi thứ 2–6. (Không có ngày lễ.)
- Chọn rule có `priority` cao nhất; hòa thì ưu tiên rule có `branch_id` cụ thể rồi đến rule có `time_slot_id` cụ thể.
- Giá chốt vào `booking_details.price` lúc đặt (snapshot), không tính lại sau.
- Ma trận đặt sân (`/api/booking/matrix`) trả luôn giá và `isPeak` cho từng slot.

### 5.2 Đặt sân (`bookings` + `booking_details` + `booking_items`)
Luồng `POST /api/booking/create`:
1. Kiểm tra đầu vào bằng Bean Validation: có ít nhất 1 slot, tối đa N slot (property `booking.max-slots`, mặc định 12), SĐT hợp lệ, ngày **không ở quá khứ** và slot hôm nay không được đã bắt đầu.
2. Mỗi `courtId` phải thuộc đúng chi nhánh, sân `active`, không bị `court_blocks` chặn trong khoảng thời gian slot.
3. Tạo booking `PENDING`, `hold_expires_at = now + holdMinutes` (mặc định 15 phút; hội viên có benefit `HOLD_MINUTES` thì lấy giá trị đó). Các detail tạo ngay ở trạng thái `BOOKED` để **giữ chỗ**.
4. **Chống trùng chỗ dựa vào UNIQUE `uk_slot_active` của DB**: bắt `DataIntegrityViolationException` và trả 409 với thông báo "Sân X lúc Y vừa có người đặt". Không dùng kiểu "check rồi insert" làm cơ chế chính.
5. `booking_code` sinh bằng `SecureRandom`, định dạng `WAY-yyyyMMdd-XXXXXX` (6 ký tự chữ+số), retry khi trùng. Không dùng 4 chữ số ngẫu nhiên.
6. Dịch vụ đi kèm gửi trong `items: [{productId, quantity}]` → lưu `booking_items` (snapshot `unit_price`). Kiểm tra tồn kho theo `product_inventory` của chi nhánh:
   - `RETAIL`: trừ `stock_quantity` khi tạo, hoàn lại khi hủy/hết hạn;
   - `RENTAL`: khả dụng = `stock_quantity` − tổng `quantity` của `booking_items` trạng thái `RESERVED/TAKEN` thuộc cùng chi nhánh và cùng `slot_date`.
   - Dịch vụ căng cước vợt (bước 3 ở frontend): **không thêm bảng mới**. Thêm `product_categories` mã `SERVICE` + vài `products` seed (`RETAIL`) và lưu qua `booking_items`. Ghi quyết định này vào README.
7. `userId` **không lấy từ request**, lấy từ người đăng nhập (JWT). Khách vãng lai (chưa đăng nhập) vẫn được đặt: `user_id` NULL, dùng `customer_*`.
8. Tạo kèm bản ghi `payments` trạng thái `PENDING` (`purpose = BOOKING`, `method` theo yêu cầu: `VIETQR`/`CASH`/`WALLET`). Với `WALLET`: trừ ví **nguyên tử** (xem 5.5) và chuyển `PAID` + booking `CONFIRMED` ngay.
9. Xác nhận thanh toán VietQR/tiền mặt: endpoint `POST /api/admin/payments/{id}/confirm` (ADMIN/STAFF) → payment `PAID`, `paid_at`, booking `CONFIRMED`. (Chưa cần tích hợp cổng thanh toán thật; ghi rõ trong README đây là bước xác nhận thủ công.)
10. Job `@Scheduled` mỗi phút: booking `PENDING` quá `hold_expires_at` → booking `EXPIRED`, mọi detail `CANCELLED`, hoàn lại tồn kho, payment `PENDING` → `FAILED`.

Hủy đơn `POST /api/booking/{id}/cancel` (chủ đơn hoặc ADMIN/STAFF): `status = CANCELLED`, `cancelled_at`, `cancel_reason`, mọi detail → `CANCELLED`, hoàn tồn kho. Nếu payment đã `PAID` và còn cách giờ chơi ≥ `booking.refund-hours-before` (mặc định 2) thì tạo bản ghi `refunds` `PENDING`; với `WALLET` thì cộng lại ví. **Sau khi hủy, slot phải đặt lại được** (nhờ `active_slot_key`); viết test chứng minh điều này.

### 5.3 Pass sân (`slot_transfers`)
Thay hoàn toàn cơ chế `PASS_WANTED` + `pass_contact` cũ:
- Chủ đơn (đúng `booking.user_id`) đăng pass một detail chưa diễn ra → tạo `slot_transfers` `LISTED` (`pass_price`, `contact`). Chỉ chủ đơn mới được đăng hoặc gỡ.
- Ma trận hiển thị slot có transfer `LISTED` là "cần pass" (trạng thái suy ra, không lưu vào `booking_details.status`).
- Người nhận (đã đăng nhập, khác chủ đơn) claim: trong **một transaction** → transfer `CLAIMED`, `to_user_id`, `claimed_at`; detail cũ của chủ đơn → `CANCELLED`; tạo booking mới cho người nhận với detail cùng sân/giờ/ngày (hợp lệ nhờ `active_slot_key`). Người nhận trả theo giá bình thường qua luồng thanh toán ở 5.2; chủ cũ xử lý hoàn tiền theo quy tắc hủy ở trên. Ghi rõ quy tắc này trong README.
- Job hết hạn: transfer `LISTED` mà slot đã bắt đầu → `EXPIRED`.

### 5.4 Hội viên (`membership_packages`, `package_benefits`, `user_memberships`)
- **Hội viên hiện tại** = bản ghi `user_memberships` có `status = ACTIVE` và `now BETWEEN start_date AND end_date`, lấy bản có `end_date` muộn nhất (tương đương view `v_user_active_membership`). Không còn đọc từ bảng `users`.
- Mua gói `POST /api/memberships/buy`: tạo `user_memberships` `PENDING` + `payments` (`purpose = MEMBERSHIP`). Chỉ khi payment `PAID` (ví trừ ngay, hoặc admin xác nhận) mới chuyển `ACTIVE`. **Tuyệt đối không được kích hoạt gói khi chưa có payment `PAID`.**
- Ngày bắt đầu = `max(now, end_date lớn nhất của các gói ACTIVE hiện có)` (xếp nối tiếp, không bị hạ cấp giữa chừng); `end_date = start_date + duration_days`; `price_paid` snapshot giá gói.
- Gói `student_only = true` chỉ mua được khi `users.student_verified_at IS NOT NULL`.
- Job hằng ngày chuyển `ACTIVE` đã quá `end_date` → `EXPIRED`.
- **Áp dụng giảm giá đặt sân theo từng slot**, không giảm cả đơn một cách mù quáng: slot được giảm `discount_percent` khi (a) user có hội viên hiệu lực, (b) nếu gói có `discount_from_time/discount_to_time` thì `slot.start_time` thuộc `[from, to)`. Cộng dồn thành `bookings.discount_amount`, ghi `applied_membership_id`. Làm tròn về đồng (`RoundingMode.HALF_UP`).
- `package_benefits`: chỉ cần trả ra trong API gói (thay cho chuỗi `perks` cũ) và dùng `HOLD_MINUTES` ở 5.2. Các benefit có hạn mức (`FREE_RENTAL`, `FREE_STRINGING`...) + `membership_usage` thuộc mức 2: để entity/repository, **không** cài logic.

### 5.5 Ví và thanh toán (`wallets`, `payments`)
- Tạo `wallets` (balance 0) cùng lúc đăng ký user, trong cùng transaction.
- Không còn bảng sổ cái; mọi lần nạp/trừ phải có dấu vết trong `payments`. Nạp ví: `POST /api/wallet/topup` tạo payment `WALLET_TOPUP` `PENDING`, admin xác nhận → cộng ví.
- Trừ ví phải **nguyên tử và không âm**: dùng câu update có điều kiện (`UPDATE wallets SET balance = balance - :amt WHERE user_id = :id AND balance >= :amt`, kiểm tra số dòng ảnh hưởng) hoặc `@Lock(PESSIMISTIC_WRITE)`.
- Hoàn tiền (`refunds`): chỉ tạo bản ghi và xử lý ví như 5.2; chưa cần tích hợp ngân hàng.

### 5.6 Sản phẩm (`product_categories`, `products`, `product_inventory`)
- Mã danh mục theo seed v2: `RACKET`, `SHOES`, `ACCESSORY` (+ `SERVICE` nếu thêm theo 5.2). **Frontend đang dùng `RACQUET`: đổi frontend sang `RACKET`.**
- API trả `specs` (map) và **tạm thời** thêm `spec1`, `spec2` (lấy 2 entry đầu của `specs`) để frontend cũ không vỡ; sau đó sửa frontend render từ `specs` rồi bỏ `spec1/spec2`.
- Admin CRUD sản phẩm + chỉnh `stock_quantity` theo chi nhánh.

---

## 6. BẢO MẬT (SỬA CÁC LỖI HIỆN TẠI)

Hiện tại project **không có xác thực**, mọi API mở, `userId` lấy từ client, mật khẩu SHA-256 với salt hardcode, CORS `*` kèm credentials. Phải sửa:

1. Thêm **Spring Security 6 + JWT** (stateless, thư viện `jjwt`), `BCryptPasswordEncoder`. Xóa `PasswordUtil`.
2. **Migration mật khẩu:** seed v2 đã dùng BCrypt (`123456`), nên không cần tương thích hash cũ.
3. Secret JWT, thông tin DB lấy từ biến môi trường/`application.properties` có giá trị mặc định cho dev; **không commit secret thật**.
4. Phân quyền:

   | Nhóm endpoint | Quyền |
   |---|---|
   | `POST /api/auth/register`, `/login`, `GET` danh mục (branches, courts, matrix, products, packages) | public |
   | `POST /api/booking/create` | public (khách vãng lai) hoặc đã đăng nhập |
   | `/api/auth/me`, `/profile`, `/change-password`, đơn của tôi, mua gói, ví, pass sân | `ROLE_USER` trở lên, **`userId` lấy từ token**, bỏ tham số `userId` |
   | `/api/admin/**` (đơn, user, sản phẩm, sân, chi nhánh, giá, gói, xác nhận thanh toán) | `ROLE_ADMIN` (một số GET/confirm cho `ROLE_STAFF`, giới hạn theo `staff_branches`) |

   Chuyển các endpoint ghi hiện có (`POST/PUT/DELETE` của branches, courts, products, memberships/admin) vào `/api/admin/**`.
5. CORS chỉ cho origin cấu hình (`http://localhost:5173` mặc định), bỏ `@CrossOrigin(origins="*")` rải rác ở từng controller.
6. **Không trả entity ra JSON.** Dùng DTO/record cho mọi response (không lộ email, SĐT, số dư của người khác).
7. Thêm `@RestControllerAdvice` xử lý lỗi thống nhất: 400 (validation), 401, 403, 404, 409 (trùng slot), 500 (không lộ `e.getMessage()` nội bộ). Bỏ `try/catch (Exception)` trong controller.
8. Dùng `@Valid` cho mọi request DTO.
9. Đăng nhập sai nhiều lần: chỉ cần thông báo chung "Tài khoản hoặc mật khẩu không chính xác" (đã có), không cần rate limit.
10. User `status` `LOCKED/DELETED` không được đăng nhập. Xóa user = soft delete (`DELETED`, `deleted_at`).

---

## 7. FRONTEND CẦN SỬA

1. `services/api.js`: gắn header `Authorization: Bearer <jwt>`; lưu token ở `localStorage` (ghi chú trong README về rủi ro XSS); xử lý 401 → về màn đăng nhập.
2. **Bỏ hoàn toàn nhánh "mô phỏng thành công" khi backend lỗi** ở các thao tác ghi (`createBooking`, hủy đơn, pass sân, mua gói...). Backend lỗi thì hiện lỗi rõ ràng. Dữ liệu mock chỉ được dùng cho phần đọc khi dev, có cờ bật tắt rõ ràng.
3. **Chặn trang admin:** gọi `/api/auth/me`, chỉ cho vào `#admin` nếu role là `ROLE_ADMIN`/`ROLE_STAFF`; ngược lại chuyển về trang đặt sân. (Đây chỉ là tiện lợi UI, bảo vệ thật nằm ở backend.)
4. Thêm bước **chờ thanh toán** sau khi đặt: hiển thị mã đơn, QR VietQR (đã có sẵn), đếm ngược tới `holdExpiresAt`, trạng thái payment; tự làm mới hoặc có nút kiểm tra.
5. Bước dịch vụ đi kèm gửi `items` theo 5.2, hiển thị cảnh báo hết hàng nếu backend trả lỗi tồn kho.
6. Sửa hiển thị sản phẩm theo `specs`; đổi `RACQUET` → `RACKET`.
7. Pass sân: dùng API mới (đăng pass, gỡ pass, nhận pass) theo 5.3; chỉ hiện nút của chủ đơn đúng người.
8. Hiển thị hội viên và giảm giá lấy từ response mới (mục 4); hiển thị rõ điều kiện giờ của gói Student.
9. **Dọn code trùng**: trước khi xóa, kiểm tra bằng đồ thị import. Các ứng viên: `frontend/booking.html` và `frontend/dat-san.html` (cùng dung lượng), `frontend/admin.html`, `frontend/index.html` bản tĩnh, `frontend/public/js/app.js`, `backend/src/main/resources/templates/*` và `static/*`, `components/AdminPortal.jsx` so với `pages/AdminPage.jsx`, hai file `InitialWelcomeModal.jsx`, `BookingModal.jsx` so với `components/booking/*`. **Liệt kê danh sách định xóa và lý do rồi xin tôi xác nhận trước khi xóa.**

---

## 8. DỌN DẸP BACKEND KHÁC

- **Bỏ `DataInitializer` seed dữ liệu lớn**; dữ liệu mẫu đã nằm trong file `.sql`. Nếu cần giữ gì cho môi trường dev, đặt sau `@Profile("dev")`.
- Bỏ dependency `h2` nếu không dùng. Cập nhật README cho đúng thực tế (MySQL 8, Java 21, cách chạy file `.sql`, tài khoản mẫu `admin / hoivien_gold / khachhang1`, mật khẩu `123456` chỉ dùng dev).
- Phân trang (`Pageable`) cho mọi danh sách có thể lớn: đơn đặt sân, user, lịch sử gói.
- Không còn lệnh/script nào tự DROP database ở runtime.

---

## 9. CÁC PHASE (làm tuần tự, mỗi phase một commit)

0. **Đọc hiểu và lập kế hoạch**: đọc toàn bộ code + file `.sql`, xuất implementation plan, danh sách file sẽ tạo/sửa/xóa, rủi ro. *Dừng lại chờ tôi xác nhận kế hoạch.*
1. **Nền tảng dữ liệu**: Lombok, enum, entity cho đủ 27 bảng, repository, `ddl-auto=validate` chạy được với database đã import `.sql`.
2. **Bảo mật**: Spring Security + JWT + BCrypt, phân quyền, CORS, `@RestControllerAdvice`, DTO cho auth.
3. **Catalog + giá**: chi nhánh, sân, khung giờ, `PricingService`, ma trận đặt sân.
4. **Đặt sân**: luồng PENDING → thanh toán → CONFIRMED, hết hạn giữ chỗ, hủy/hoàn, `booking_items`, tồn kho.
5. **Hội viên + ví + thanh toán**: mua gói, giảm giá theo slot, nạp/trừ ví, xác nhận payment.
6. **Pass sân** bằng `slot_transfers`.
7. **Admin API** (`/api/admin/**`) + sản phẩm/tồn kho.
8. **Frontend** theo mục 7.
9. **Test + README + dọn dẹp**.

---

## 10. KIỂM THỬ BẮT BUỘC

Dùng **Testcontainers MySQL 8.0** (nếu không có Docker thì nói rõ và hướng dẫn chạy với MySQL local qua profile `test`). **Không dùng H2**, vì schema có generated column, JSON và CHECK constraint.

Các test tối thiểu:
- Đặt 2 lần cùng sân/giờ/ngày → lần 2 trả 409; chạy đồng thời 2 request vẫn chỉ 1 thành công.
- **Đặt → hủy → đặt lại cùng slot thì thành công** (lỗi hiện tại của project).
- Đặt sân với court thuộc chi nhánh khác → bị từ chối.
- `PricingService`: rule mặc định, rule giờ cao điểm, rule cuối tuần, rule theo chi nhánh, tie-break theo priority.
- Giảm giá hội viên: gói thường, gói Student (trong và ngoài khung `< 16:30`), user không phải sinh viên không mua được Student, gói hết hạn không còn giảm.
- Mua gói chưa thanh toán **không** kích hoạt; thanh toán xong mới `ACTIVE`; mua nối tiếp không hạ cấp.
- Hết hạn giữ chỗ giải phóng slot và tồn kho.
- Trừ ví không bao giờ âm khi gọi đồng thời.
- Pass sân: người không phải chủ đơn không đăng/gỡ được; claim đổi chủ đúng một lần.
- Phân quyền: gọi API admin không token → 401; có token USER → 403; user A không xem được đơn của user B.

---

## 11. TIÊU CHÍ NGHIỆM THU

- [ ] Import `.sql` xong, `mvn spring-boot:run` khởi động sạch với `ddl-auto=validate`.
- [ ] Đủ 27 entity, không còn `Double` cho tiền, không còn chuỗi trạng thái hardcode.
- [ ] Không còn entity trả thẳng ra JSON; không còn `userId` do client gửi để xác định danh tính.
- [ ] Không có API ghi/quản trị nào truy cập được khi chưa đăng nhập đúng quyền.
- [ ] Toàn bộ test mục 10 xanh (`mvn test`).
- [ ] Frontend `npm run build` không lỗi; luồng đặt sân → thanh toán → xác nhận, mua gói, pass sân, trang admin chạy thật với backend.
- [ ] Không còn đường nào báo "đặt sân thành công" khi backend không phản hồi.
- [ ] README cập nhật; báo cáo cuối liệt kê: file đã tạo/sửa/xóa, quyết định thiết kế (đặc biệt 5.2.6, 5.3, 5.4), và những việc **chưa làm** (mức 2).

**Cuối mỗi phase, báo cáo ngắn:** đã làm gì, test nào đã chạy và kết quả, vấn đề cần tôi quyết định. Nếu gặp mâu thuẫn giữa prompt này và file `.sql`, **file `.sql` thắng**, và hãy nêu mâu thuẫn đó cho tôi.
