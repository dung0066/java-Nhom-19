# Ôn báo cáo – Huỳnh Hữu Nghĩa (CRUD admin, Gmail, hội viên, ví)

> Cách thầy hỏi: **"thấy bạn thao tác tới đâu thì hỏi tới đó"**, khoảng 3–4 câu, **ai làm phần đó thì người đó trả lời**.
> Hãy học **theo phần mình làm**. Mỗi luồng bên dưới theo mẫu:
> **Thao tác trên giao diện → Frontend lưu/gọi gì → Backend xử lý ở đâu → DB đổi gì → Câu thầy hay hỏi.**

---

## 1. Phần của mình (theo Bảng 1.2)

| Mục | Nội dung |
|---|---|
| Nhiệm vụ | **CRUD trang admin còn lại**; tích hợp **Gmail SMTP** và **thông báo đặt sân về Gmail**; **gói hội viên** |
| Sản phẩm | API quản trị, `WalletService`, mã VietQR |
| Nhớ nhanh | "Admin thêm/sửa/xóa mọi danh mục (trừ đặt sân và chi nhánh của Hiếu) → gửi email OTP và email xác nhận → khách mua gói hội viên để được giảm giá → ví cộng/trừ tiền an toàn → ảnh VietQR" |

### Bản đồ file của mình

**Backend** (`backend/src/main/java/com/example/Dat_san_cau_long/`)

| Việc | File |
|---|---|
| Gửi mail OTP, mail xác nhận đặt sân | `service/EmailService.java` |
| Quên mật khẩu bằng OTP | `service/PasswordResetService.java`, `controller/AuthApiController.java` |
| Hội viên (khách) | `service/MembershipService.java`, `controller/MembershipApiController.java` |
| Hội viên (admin) | `controller/AdminMembershipController.java` |
| Ví, xác nhận thanh toán | `service/WalletService.java`, `controller/WalletApiController.java`, `controller/AdminPaymentController.java` |
| CRUD sản phẩm, kho | `controller/AdminProductController.java`, `service/ProductService.java` |
| CRUD quy tắc giá | `controller/AdminPriceRuleController.java` |
| CRUD tài khoản | `controller/AdminUserController.java` |
| CRUD bài viết | `controller/AdminArticleController.java` |
| CRUD sân | `controller/AdminCourtController.java` |
| Báo lỗi thống nhất | `exception/GlobalExceptionHandler.java` |

**Frontend** (`frontend/src/`)

| Việc | File |
|---|---|
| Các tab quản trị | `components/admin/AdminProductsTab`, `AdminPricingTab`, `AdminUsersTab`, `AdminArticlesTab`, `AdminMembershipsTab`, `AdminPaymentsTab` + các `*Modal.jsx` |
| Quên mật khẩu (3 bước) | `components/common/AuthModal.jsx` |
| Hội viên phía khách | `components/home/MembershipModal.jsx`, `components/common/PendingMembershipBanner.jsx`, `hooks/useMembershipStatus.js` |
| Ví và nạp ví | `components/common/AccountWalletTab.jsx` |
| Tạo ảnh VietQR | `services/payment.js` (`buildVietQrUrl`) |
| Thông báo và hộp thoại xác nhận | `components/admin/adminDialog.jsx` (toast, `confirmAction`) |

---

## 2. Demo luồng chính của web từ đầu đến cuối (cả nhóm – biết ai trả lời)

| Bước | Thao tác | Ai trả lời |
|---|---|---|
| 1 | Mở trang chủ, xem chi nhánh, tin tức, gói hội viên | Cả nhóm (React); danh sách gói/tin tức: **Nghĩa** (API) |
| 2 | Đăng ký / đăng nhập, nhận JWT | **Dũng** |
| 3 | Chọn chi nhánh, ngày, ô sân | **Hiếu** |
| 4 | Xem giá và giảm giá hội viên | **Hiếu** (giá) + **Nghĩa** (gói hội viên) |
| 5 | Chọn 100% hoặc cọc 50%, xác nhận → tạo đơn | **Hiếu** |
| 6 | Thanh toán ví / VietQR | Ví (`WalletService`): **Nghĩa**; SePay: **Dũng** |
| 7 | Nhận **email xác nhận** | **Nghĩa** |
| 8 | Xem đơn, hủy đơn hoàn về ví | **Hiếu** |
| 9 | Quên mật khẩu bằng OTP gửi Gmail | **Nghĩa** |
| 10 | Admin CRUD sản phẩm, giá, tài khoản, bài viết, hội viên | **Nghĩa** |

---

## 3. Các luồng của Nghĩa (học kỹ)

### Luồng A – Quên mật khẩu bằng OTP qua Gmail

**Người dùng làm:** bấm **Quên mật khẩu** → nhập email/username/SĐT → nhận mã 6 số trong hộp thư → nhập mã → nhập mật khẩu mới.

**Frontend:** `AuthModal.jsx` có 3 bước, gọi lần lượt:
1. `POST /api/auth/forgot-password/send-otp` (gửi `identifier`)
2. `POST /api/auth/forgot-password/verify-otp` (gửi `identifier`, `otp`)
3. `POST /api/auth/forgot-password/reset-password` (gửi `resetToken`, mật khẩu mới)

Ba endpoint này **công khai** (chưa đăng nhập vẫn dùng được). Người đã đăng nhập đổi mật khẩu dùng `/api/auth/otp/send-change-password-otp` và `/otp/verify-and-change-password`.

**Backend** – `PasswordResetService`
1. `sendOtp`: tìm user theo email/username/SĐT; sinh OTP **6 số bằng `SecureRandom`**; lưu **bản băm SHA-256** (`sha256Hex("OTP:" + userId + ":" + otp)`), **hạn 10 phút**; vô hiệu hóa các OTP cũ chưa dùng; gửi mail qua `EmailService.sendOtpEmail`.
2. `verifyOtp`: băm mã khách nhập rồi so với bản băm đã lưu; đúng thì đánh dấu OTP đã dùng và cấp **`resetToken`** (chuỗi 64 ký tự an toàn, cũng chỉ lưu bản băm `RESET_AUTH:`), **hạn 15 phút**.
3. `resetPassword`: kiểm tra token chưa dùng và chưa hết hạn, mật khẩu mới tối thiểu 6 ký tự, **mã hóa BCrypt**, đánh dấu token đã dùng.

**Câu thầy hay hỏi**
- *"Vì sao không lưu OTP thật vào DB?"* → Lưu bản băm SHA-256; lộ DB cũng không biết OTP. Mỗi OTP dùng một lần, hết hạn 10 phút.
- *"Token đặt lại mật khẩu dùng lại được không?"* → Không, đã dùng thì `usedAt` có giá trị và bị từ chối.
- *"Chặn spam OTP thế nào?"* → `RateLimitFilter` của Dũng: tối đa 5 yêu cầu / 10 phút theo IP.

### Luồng B – Gmail SMTP và email xác nhận đặt sân

**Cấu hình:** `application.properties` – `spring.mail.host=smtp.gmail.com`, cổng **587**, **STARTTLS bắt buộc**, xác thực bằng **mật khẩu ứng dụng (App Password)** của Gmail, đọc từ biến môi trường `MAIL_USERNAME`, `MAIL_PASSWORD`; có timeout 7 giây.

**Backend** – `EmailService` (dùng `JavaMailSender`, nội dung HTML):
- `sendOtpEmail`: mail mã OTP.
- `sendBookingSuccessEmail(booking)`: mail xác nhận có mã đơn, sân, khung giờ. Được gọi khi: đặt sân và trả ngay bằng ví, admin duyệt đơn, SePay xác nhận, thu nốt.
- Nếu khách **không nhập email** hoặc email sai → bỏ qua, không gửi.
- Lệnh gửi mail được bọc `try/catch`: **lỗi mail không làm hỏng việc tạo đơn**.

**Câu thầy hay hỏi**
- *"Vì sao dùng App Password?"* → Gmail bật xác minh 2 bước thì không dùng mật khẩu thường cho ứng dụng; App Password 16 ký tự chỉ dùng cho SMTP.
- *"Mail lỗi thì đơn có tạo không?"* → Có, vì tách riêng và bắt lỗi.

### Luồng C – Gói hội viên (khách)

**Người dùng làm:** trang chủ → thẻ **Gói hội viên** → chọn gói → thanh toán bằng ví hoặc VietQR.

**Dữ liệu:** hiện có **3 gói**: Bạc (giảm 5%, 199.000 đ, 30 ngày), Vàng (12%, 499.000 đ, 90 ngày), Kim Cương (20%, 1.290.000 đ, 365 ngày). Quyền lợi chi tiết nằm ở bảng `package_benefits` (ví dụ `HOLD_MINUTES`, `FREE_RENTAL`, `PRODUCT_DISCOUNT`…).

**Frontend**
- Trang chủ: `fetchMembershipPackages` → `GET /api/memberships/packages` (công khai) → hiện "Đến −X%" (mức giảm cao nhất).
- `MembershipModal.jsx`: gọi `buyMembership(packageId, paymentMethod)` → `POST /api/memberships/buy`. Nếu chọn VietQR thì hiện `buildVietQrUrl(amount, paymentCode)`.
- `useMembershipStatus.js`: lấy gói đang hiệu lực, gói đang chờ, số dư ví; **lắng nghe sự kiện `d2_membership_changed`** để mọi nơi (thanh menu, ví, hồ sơ) tự cập nhật sau khi mua.
- `PendingMembershipBanner.jsx`: nhắc khách khi có gói đang chờ thanh toán, cho **hủy yêu cầu**.

**Backend** – `MembershipService.buyMembership`
1. Kiểm tra gói còn phát hành, và **không cho mua khi đang có gói chờ thanh toán** (`rejectIfPaymentPending`).
2. **Gói mới nối tiếp gói cũ**: ngày bắt đầu = max(bây giờ, ngày hết hạn xa nhất của gói đang hiệu lực).
3. Luôn tạo gói ở trạng thái **PENDING** kèm `Payment` mục đích `MEMBERSHIP`.
4. **Ví:** trừ ví bằng `deductBalanceAtomic` → gói thành **ACTIVE ngay**, giao dịch `PAID`.
5. **VietQR:** giữ `PENDING` đến khi **admin xác nhận** giao dịch (`WalletService.confirmPayment` kích hoạt gói).
6. `cancelPendingMembership`: chỉ chủ gói (hoặc admin) hủy được gói còn `PENDING` → gói `CANCELLED`, giao dịch `FAILED`.
7. Hết hạn: `BookingExpirationScheduler.expireOldMemberships` chuyển `EXPIRED` (chạy mỗi 60 giây).

**Giảm giá được áp dụng ở đâu?** Khi báo giá và tạo đơn, `PricingService.calculateDiscount` (phần của Hiếu) lấy gói đang hiệu lực của user rồi **giá gốc × % giảm** cho từng ca.

**Trạng thái gói (`MembershipStatus`):** `PENDING` → `ACTIVE` → `EXPIRED`; hoặc `CANCELLED`.

**Câu thầy hay hỏi**
- *"Mua gói bằng ví và bằng VietQR khác gì nhau?"* → Ví: trừ tiền và kích hoạt ngay. VietQR: chờ admin xác nhận đã nhận tiền mới kích hoạt.
- *"Đang có gói Vàng, mua thêm gói thì sao?"* → Gói mới bắt đầu sau khi gói hiện tại hết hạn (nối tiếp).
- *"Giảm giá hội viên tính ở frontend hay backend?"* → Backend; frontend chỉ hiển thị kết quả báo giá.

### Luồng D – Ví (`WalletService`)

- `getWalletBalance`: trả số dư, chưa có ví thì tạo ví số dư 0.
- `createTopupPayment`: tạo yêu cầu nạp `PENDING` (tối thiểu 1.000 đ, mã `PAY-TOPUP-yyyyMMdd-xxxx`).
- `confirmPayment(paymentId)` (admin xác nhận) – tùy **mục đích** giao dịch:
  - `WALLET_TOPUP` → **cộng tiền vào ví** (`addBalanceAtomic`);
  - `MEMBERSHIP` → chuyển gói sang `ACTIVE`;
  - `BOOKING` → chuyển đơn sang `CONFIRMED` (từ chối nếu đơn đã hủy hoặc hết hạn).
- Giao dịch đã `PAID` mà bấm xác nhận lại → báo lỗi; giao dịch đã hủy/hoàn tiền → không xác nhận được.
- **Cộng/trừ bằng câu UPDATE nguyên tử**: `UPDATE Wallet SET balance = balance - :amount WHERE userId = :id AND balance >= :amount` → ví **không bao giờ âm** kể cả khi hai yêu cầu đến cùng lúc.

*Câu hỏi mẫu:* "Hai người cùng trừ một ví cùng lúc thì sao?" → Mỗi câu UPDATE nguyên tử có điều kiện `balance >= amount`; câu nào không đủ trả về 0 dòng và service ném lỗi.

### Luồng E – Mã VietQR

- `services/payment.js` – `buildVietQrUrl(amount, content)` ghép URL ảnh của `api.vietqr.io` gồm **số tài khoản, số tiền, nội dung chuyển khoản, tên chủ tài khoản**.
- Nội dung chuyển khoản: **mã đơn** (đặt sân, dùng ở `OrderPayModal.jsx`), hoặc **mã giao dịch** (nạp ví ở `AccountWalletTab.jsx`, mua gói ở `MembershipModal.jsx`).
- *Ranh giới với Dũng:* mình lo **tạo ảnh QR**; **Dũng** lo phần **nhận tiền và tự xác nhận** (webhook SePay).

### Luồng F – CRUD trang admin (phần còn lại)

| Tab (giao diện) | API | Controller | Bảng DB | Quyền |
|---|---|---|---|---|
| Dụng cụ, vợt & giày | `/api/admin/products` (+ `/{id}/inventory`, `/inventory/branch/{id}`) | `AdminProductController` | `products`, `product_inventory` | Staff, Admin (staff chỉ kho chi nhánh mình) |
| Cấu hình giá | `/api/admin/price-rules` (thêm, **sửa**, xóa) | `AdminPriceRuleController` | `price_rules` | Admin |
| Tài khoản | `/api/admin/users` (tạo, đổi vai trò, khóa/mở, xóa, chi tiết) | `AdminUserController` | `users` | Admin |
| Tin tức | `/api/admin/articles` (thêm, sửa, ẩn/hiện, xóa) | `AdminArticleController` | `articles` | Staff, Admin |
| Sân | `/api/admin/courts` (+ thùng rác) | `AdminCourtController` | `courts` | Admin |
| Gói hội viên | `/api/admin/memberships/packages`, `/history` | `AdminMembershipController` | `membership_packages`, `user_memberships` | Admin |
| Thanh toán | `/api/admin/payments`, `/{id}/confirm` | `AdminPaymentController` | `payments` | Staff, Admin |

**Quy tắc chung của CRUD**
- **Bean Validation** (`@NotBlank`, `@Min`, `@DecimalMin`…, nhóm `OnCreate` cho trường chỉ bắt buộc khi tạo): giá âm hoặc thiếu tên → **400**.
- Trùng dữ liệu (mã chi nhánh, username, email, SĐT) → **409**.
- `GlobalExceptionHandler` đổi ngoại lệ sang mã HTTP thống nhất: `IllegalArgumentException` → 400, `BadCredentials` → 401, `AccessDenied` → 403, `ResourceNotFound` → 404, `IllegalState` / ràng buộc CSDL → 409, lỗi khác → 500; thông báo bằng tiếng Việt.
- Quản lý tài khoản: admin **không tự khóa, tự xóa, tự đổi vai trò của chính mình**; không xóa được admin/nhân viên (phải hạ quyền hoặc khóa); tài khoản đã có đơn thì không xóa mà khóa.
- Kho: `product_inventory` có khóa `(branch_id, product_id)` → **mỗi chi nhánh có tồn kho riêng**; trừ kho khi đặt bằng `deductStockAtomic` (UPDATE có điều kiện `stock >= qty`).
- Giao diện: tìm kiếm, lọc, **phân trang** (`usePagination`), thao tác quan trọng dùng **hộp thoại xác nhận** và **toast** (`adminDialog.jsx`) thay cho `alert/confirm`.

---

## 4. Câu hỏi nhanh – trả lời trong 1–2 câu

| Câu hỏi | Trả lời |
|---|---|
| Phần của bạn là gì? | CRUD admin còn lại, Gmail SMTP và email xác nhận, OTP quên mật khẩu, gói hội viên, `WalletService`, ảnh VietQR. |
| OTP lưu thế nào? | Băm SHA-256, một lần dùng, hạn 10 phút. |
| Gửi mail bằng gì? | `JavaMailSender` qua `smtp.gmail.com:587` STARTTLS với App Password. |
| Mail lỗi có ảnh hưởng đơn không? | Không, đã bọc `try/catch`. |
| Khách có gói hội viên thì được gì? | Giảm giá % mỗi ca và có thể thêm quyền lợi (giữ chỗ lâu hơn…). |
| Mua gói bằng ví khác VietQR ở đâu? | Ví: kích hoạt ngay; VietQR: chờ admin xác nhận. |
| Ví không âm nhờ đâu? | UPDATE nguyên tử có điều kiện `balance >= amount`. |
| Frontend lưu gì phần hội viên? | State từ `useMembershipStatus` (gói, gói chờ, số dư), tự cập nhật qua sự kiện `d2_membership_changed`. |
| Validate dữ liệu ở đâu? | Bean Validation ở backend (trả 400), frontend chỉ kiểm tra cơ bản. |

## 5. Điểm yếu cần biết (nói thật nếu thầy hỏi)

- **`PasswordResetService.sendOtp` trả thêm trường `debugOtp`** (và ghi OTP ra log) để test nhanh ở localhost; khi triển khai thật phải **bỏ trường này**, nếu không ai gọi API cũng thấy OTP.
- Mật khẩu ứng dụng Gmail và khóa JWT đang có giá trị mặc định trong `application.properties`; khi công khai phải chuyển sang biến môi trường.
- **Khung giờ ở tab Cấu hình giá chỉ lưu cục bộ trong trình duyệt** (`localStorage`, các khóa `d2_admin_timeslots*`): thêm/sửa/xóa khung giờ ở giao diện **chưa ghi vào bảng `time_slots`** của CSDL. Còn **quy tắc giá** thì lưu đúng vào DB.
- Nạp ví phải chờ admin xác nhận, chưa tự động.
- `Thymeleaf` còn khai báo trong `pom.xml` nhưng không dùng; chưa có test tự động cho giao diện React.

## 6. Câu chuyển giao

- "Đặt sân, tính giá, scheduler, quản lý đơn và chi nhánh do **Hiếu** trả lời."
- "Đăng nhập, JWT, rate limit, SePay và luồng nạp ví phía khách do **Dũng** trả lời."
- "Test của mình: `AdminCrudValidationIntegrationTest`, `AdminUserManagementIntegrationTest`, `ProductInventoryIntegrationTest`, `MembershipWalletIntegrationTest`, `MembershipPendingIntegrationTest`."
