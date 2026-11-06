# Ôn báo cáo – Đào Duy Dũng (Bảo mật, SePay, nạp ví)

> Cách thầy hỏi: **"thấy bạn thao tác tới đâu thì hỏi tới đó"**, khoảng 3–4 câu, **ai làm phần đó thì người đó trả lời**.
> Hãy học **theo phần mình làm**. Mỗi luồng bên dưới theo mẫu:
> **Thao tác trên giao diện → Frontend lưu/gọi gì → Backend xử lý ở đâu → DB đổi gì → Câu thầy hay hỏi.**

---

## 1. Phần của mình (theo Bảng 1.2)

| Mục | Nội dung |
|---|---|
| Nhiệm vụ | **Spring Security và JWT**, **chống tấn công** (rate limit, CORS, CSP), **tích hợp SePay**, **nạp tiền ví** |
| Sản phẩm | `SecurityConfig`, `RateLimitFilter`, `SepayWebhookController` |
| Nhớ nhanh | "Ai được vào đâu (JWT + vai trò) → chặn kẻ xấu (rate limit, CORS, CSP) → tiền chuyển khoản vào thì tự xác nhận đơn (SePay) → nạp tiền vào ví" |

### Bản đồ file của mình

**Backend** (`backend/src/main/java/com/example/Dat_san_cau_long/`)

| Việc | File |
|---|---|
| Cấu hình phân quyền, CORS, CSP, chuỗi filter | `security/SecurityConfig.java` |
| Tạo và kiểm tra JWT | `security/JwtTokenProvider.java` |
| Đọc token mỗi request | `security/JwtAuthenticationFilter.java` |
| Chống dò mật khẩu, spam | `security/RateLimitFilter.java` |
| Trả JSON 401 / 403 | `security/JwtAuthenticationEntryPoint.java`, `CustomAccessDeniedHandler.java` |
| Kiểm tra chủ dữ liệu (IDOR) | `security/AccessChecks.java` |
| Giới hạn theo chi nhánh | `security/BranchAccess.java` |
| Đăng ký, đăng nhập | `service/AuthService.java`, `controller/AuthApiController.java` |
| Nhận tiền SePay | `controller/SepayWebhookController.java` |
| Nạp ví | `controller/WalletApiController.java`, `service/WalletService.java` |

**Frontend** (`frontend/src/`)

| Việc | File |
|---|---|
| Form đăng nhập / đăng ký, captcha | `components/common/AuthModal.jsx` |
| Gắn token vào mọi request | `services/api.js` (`authFetch`, `loginUser`, `registerUser`) |
| Tạo ảnh VietQR | `services/payment.js` (`buildVietQrUrl`) |
| Nạp ví | `components/common/AccountWalletTab.jsx` |

---

## 2. Demo luồng chính của web từ đầu đến cuối (cả nhóm – biết ai trả lời)

| Bước | Thao tác | Ai trả lời |
|---|---|---|
| 1 | Mở trang chủ, xem chi nhánh, tin tức, gói hội viên | Cả nhóm (React) |
| 2 | Đăng ký / đăng nhập, nhận JWT | **Dũng** |
| 3 | Chọn chi nhánh, ngày, ô sân | **Hiếu** |
| 4 | Xem giá và giảm giá hội viên | **Hiếu** (giá) + **Nghĩa** (hội viên) |
| 5 | Chọn 100% hoặc cọc 50%, xác nhận → tạo đơn | **Hiếu** |
| 6 | Thanh toán VietQR → ngân hàng báo SePay → webhook xác nhận đơn | **Dũng** |
| 7 | Email xác nhận | **Nghĩa** |
| 8 | Xem đơn, hủy đơn hoàn về ví | **Hiếu** |
| 9 | Nạp ví bằng VietQR, admin xác nhận | **Dũng** (luồng nạp) + **Nghĩa** (cộng ví trong `WalletService`) |
| 10 | Admin: duyệt đơn, CRUD | **Hiếu** / **Nghĩa** |

---

## 3. Các luồng của Dũng (học kỹ)

### Luồng A – Đăng ký, đăng nhập và JWT

**Người dùng làm:** bấm **Đăng nhập**, nhập tài khoản, mật khẩu, mã captcha, bấm gửi.

**Frontend**
- `AuthModal.jsx`: state `captchaCode`, `inputCaptcha`. Hàm `generateCaptcha` tạo **4 chữ số ngẫu nhiên**; so sánh **ngay ở trình duyệt** trước khi gọi API.
- Gọi `loginUser(username, password)` → `POST /api/auth/login`.
- Đăng nhập đúng: lưu **`token`** và **`user`** vào **localStorage** (`services/api.js`). Mỗi request sau do `authFetch` tự thêm header `Authorization: Bearer <token>`.
- Nếu server trả **401** (token hết hạn hoặc không hợp lệ) → `authFetch` gọi `logoutUser()` xóa token và user.

**Backend**
- `AuthService.login`:
  1. Tìm user theo **username, hoặc số điện thoại, hoặc email**.
  2. `passwordEncoder.matches` (BCrypt) so mật khẩu; sai thì ném `BadCredentialsException` → **401**, thông báo chung "Tài khoản hoặc mật khẩu không chính xác!" (không tiết lộ là sai cái nào).
  3. Tài khoản `LOCKED` → từ chối.
  4. `JwtTokenProvider.generateToken(user)`.
- **JWT gồm:** `subject` = id người dùng; claim `userId`, `username`, `email`, `role`; ký bằng khóa bí mật (HMAC, jjwt 0.12.6); **hết hạn sau 24 giờ** (`app.jwt.expiration-ms = 86400000`).
- `AuthService.register`: mã hóa mật khẩu **BCrypt**, tạo user vai trò `ROLE_USER` và **tự tạo ví** số dư 0.

**Mỗi request sau đó** – `JwtAuthenticationFilter`:
1. Đọc header `Authorization: Bearer …`.
2. `validateToken` kiểm tra chữ ký và hạn.
3. **Nạp lại user từ CSDL** (`loadUserById`), chỉ cho vào `SecurityContext` nếu tài khoản **đang hoạt động và không bị khóa**. Vì thế admin khóa tài khoản thì **token cũ mất tác dụng ngay**.
4. Stateless: server **không lưu session**.

**Câu thầy hay hỏi**
- *"JWT là gì, lưu ở đâu?"* → Chuỗi chứa danh tính và vai trò, được ký; frontend lưu trong localStorage; server chỉ cần kiểm tra chữ ký, không lưu phiên.
- *"Mật khẩu lưu thế nào?"* → Băm **BCrypt** (một chiều, có salt ngẫu nhiên nên cùng mật khẩu cho chuỗi băm khác nhau). Không lưu mật khẩu thật.
- *"Captcha chống được gì?"* → Chỉ giảm đăng nhập tự động ở giao diện. **Nói thật:** captcha là mã sinh và so sánh phía frontend, không phải captcha phía server; phần chặn thật là `RateLimitFilter`.
- *"Token hết hạn thì sao?"* → Server trả 401, frontend xóa token và yêu cầu đăng nhập lại.

### Luồng B – Phân quyền (ai được vào đâu)

`SecurityConfig.filterChain`: **mặc định mọi đường dẫn đều phải đăng nhập**, chỉ những endpoint được liệt kê mới công khai.

| Nhóm | Ai vào được |
|---|---|
| Công khai | đăng nhập, đăng ký, quên mật khẩu, xem chi nhánh/ma trận/sân/sản phẩm/bài viết, báo giá, tạo đơn, tra cứu đơn, webhook SePay |
| Đã đăng nhập | ví, hội viên, hồ sơ, đổi mật khẩu, đơn của mình |
| `ROLE_STAFF` hoặc `ROLE_ADMIN` | `/api/admin/**`, xem tất cả đơn, sản phẩm |
| Chỉ `ROLE_ADMIN` | quản lý chi nhánh, sân, giá, hội viên, tài khoản |

Ba vai trò: `ROLE_USER`, `ROLE_STAFF` (quản lý cửa hàng), `ROLE_ADMIN`.
Hai lớp bảo vệ: (1) theo URL trong `SecurityConfig`; (2) `@PreAuthorize` trên từng controller (ví dụ `AdminUserController` chỉ cho `ROLE_ADMIN`).
Lỗi trả JSON thống nhất: **401** (`JwtAuthenticationEntryPoint`) khi chưa đăng nhập, **403** (`CustomAccessDeniedHandler`) khi không đủ quyền.

**Chống IDOR** (xem đơn người khác bằng cách đổi id): `AccessChecks.requireSelfOrStaff` – chỉ chủ dữ liệu hoặc nhân viên/admin. Ví dụ `GET /api/booking/user/{id}` của người khác → **403**.

**Giới hạn theo chi nhánh:** `BranchAccess` – quản lý cửa hàng chỉ thao tác chi nhánh được ủy quyền (`staff_branches`); đơn, thanh toán, dashboard chi nhánh khác bị chặn hoặc không hiển thị.

*Câu hỏi mẫu:* "User thường gọi `/api/admin/branches` thì sao?" → **403 Forbidden**.

### Luồng C – Chống tấn công

| Mối đe dọa | Cách chặn | File |
|---|---|---|
| Dò mật khẩu (brute force) | Đăng nhập **sai 5 lần** từ một IP → khóa **15 phút**, trả **429**; đăng nhập đúng thì xóa bộ đếm | `RateLimitFilter` |
| Spam OTP / dò OTP | Quên mật khẩu, OTP: tối đa **5 lần / 10 phút** | `RateLimitFilter` |
| Đăng ký hàng loạt | Tối đa **10 lần / 60 phút** | `RateLimitFilter` |
| Dò thông tin khách qua tra cứu | Tra cứu đơn: tối đa **30 lần / phút** | `RateLimitFilter` |
| Trang web lạ gọi API | **CORS** chỉ cho các địa chỉ liệt kê (localhost 5173/3000, tên miền và IP của nhóm) | `SecurityConfig.corsConfigurationSource` |
| XSS, clickjacking | Header **CSP** (`script-src 'self'; object-src 'none'; frame-ancestors 'none'…`), `X-Frame-Options: deny`, `X-Content-Type-Options`, Referrer-Policy | `SecurityConfig` |
| SQL injection | Truy vấn JPA/JPQL có tham số, không nối chuỗi | repository |
| Đoán id đơn của người khác | `AccessChecks` (IDOR) | `AccessChecks` |
| Token giả | Sai chữ ký → `validateToken` false → coi như chưa đăng nhập → 401 | `JwtTokenProvider` |

Chi tiết cần nhớ của `RateLimitFilter`: cửa sổ trượt **lưu trong bộ nhớ** (`ConcurrentHashMap` các mốc thời gian theo `loại + IP`); **chỉ dùng `getRemoteAddr`**, không tin header `X-Forwarded-For` vì client có thể giả mạo.

*Câu hỏi mẫu:* "Vì sao tắt CSRF?" → Hệ thống dùng JWT trong header `Authorization`, không dựa vào cookie phiên nên trình duyệt không tự gửi thông tin xác thực sang trang lạ; kết hợp CORS giới hạn nguồn.

### Luồng D – SePay: tự xác nhận khi có tiền chuyển vào

**Bối cảnh:** khách chọn VietQR → đơn ở `PENDING` (hoặc chờ cọc). Frontend hiện ảnh QR (`buildVietQrUrl`: số tài khoản, số tiền, **nội dung = mã đơn** `WAY-…`). Khách quét và chuyển tiền → ngân hàng báo **SePay** → SePay gọi **webhook** về server.

**Backend** – `SepayWebhookController` (`POST /api/payment/sepay-webhook`, công khai):
1. Nếu có cấu hình `app.sepay.api-key` thì kiểm tra header `Authorization` có khớp, sai → **401**.
2. Chỉ xử lý **tiền vào** (`transferType = "in"`), bỏ qua tiền ra.
3. **Chuẩn hóa nội dung chuyển khoản** (bỏ ký tự đặc biệt, viết hoa) vì một số ngân hàng tự bỏ dấu gạch ngang.
4. Tìm đơn khớp: trước hết trong đơn `PENDING`, nếu không có thì trong đơn `DEPOSITED` (khách trả nốt phần còn lại).
5. Đơn `PENDING` khớp → đơn thành `CONFIRMED` (hoặc `DEPOSITED` nếu là cọc), các ô → `BOOKED`, giao dịch `PENDING` → `PAID`, lưu **mã tham chiếu ngân hàng** vào `provider_txn_code` (cột `UNIQUE` nên một giao dịch không ghi nhận hai lần), gửi email xác nhận.
6. Đơn `DEPOSITED` khớp → tạo thêm giao dịch thu nốt `PAID` (phương thức VietQR), đơn thành `CONFIRMED`.
7. Không khớp đơn nào → vẫn trả 200 để SePay không gửi lại liên tục.

**Phía frontend** chờ kết quả bằng cách **hỏi định kỳ**: `OrderPayModal` hỏi trạng thái đơn mỗi **2,5 giây**; `SuccessReceiptModal` hỏi mỗi **10 giây**. Khi đơn đổi trạng thái thì hiện "Thanh toán thành công".

**Câu thầy hay hỏi**
- *"Sao biết khách đã chuyển tiền?"* → SePay theo dõi biến động số dư tài khoản ngân hàng đã liên kết, gọi webhook báo; server so nội dung chuyển khoản với mã đơn.
- *"Webhook công khai thì ai cũng gọi được?"* → Có API key trong header để xác thực (cấu hình `app.sepay.api-key`). **Nói thật:** nếu để trống key thì không kiểm tra xác thực; và hiện **chưa so sánh số tiền** nhận được với số tiền của đơn – đây là hạn chế đã ghi trong báo cáo (mục 6.3) và hướng phát triển.
- *"Frontend biết đã thanh toán bằng cách nào?"* → Polling: gọi lại API lấy đơn theo mã (`/api/booking/code/{code}`) mỗi vài giây.

### Luồng E – Nạp tiền vào ví

**Người dùng làm:** hồ sơ → tab **Ví & hội viên** → nhập số tiền → **Nạp tiền** → quét QR chuyển khoản.

**Frontend:** `AccountWalletTab.jsx` gọi `topupWallet(amount, 'VIETQR')` → `POST /api/wallet/topup` (cần đăng nhập). State `topup` giữ giao dịch vừa tạo; hiển thị `buildVietQrUrl(amount, paymentCode)`.

**Backend**
1. `WalletApiController` → `WalletService.createTopupPayment`: số tiền **tối thiểu 1.000 đ**, tạo `Payment` mục đích `WALLET_TOPUP`, trạng thái **PENDING**, mã `PAY-TOPUP-yyyyMMdd-xxxx` (đây cũng là **nội dung chuyển khoản**).
2. Khách chuyển khoản theo QR.
3. **Admin xác nhận** ở tab Thanh toán: `POST /api/admin/payments/{id}/confirm` → `WalletService.confirmPayment` → giao dịch `PAID` và `walletRepository.addBalanceAtomic` **cộng tiền vào ví** (một câu UPDATE nguyên tử).

*Ranh giới với Nghĩa:* mình trả lời "luồng nạp, QR, chờ xác nhận"; còn "`WalletService` cộng/trừ ví nguyên tử, xác nhận 3 loại giao dịch" là phần **Nghĩa**.
*Nói thật:* hiện nạp ví do **admin duyệt tay**; webhook SePay chỉ tự xác nhận **đơn đặt sân**, chưa tự cộng ví cho giao dịch nạp.

---

## 4. Câu hỏi nhanh – trả lời trong 1–2 câu

| Câu hỏi | Trả lời |
|---|---|
| Phần của bạn là gì? | Spring Security + JWT, rate limit, CORS, CSP, tích hợp SePay, nạp ví. |
| Đoạn code kiểm tra quyền ở đâu? | `SecurityConfig` (theo URL) và `@PreAuthorize` trên controller, thêm `AccessChecks`, `BranchAccess` cho dữ liệu. |
| Dùng thuộc tính nào để biết vai trò? | Claim `role` trong JWT, và `User.role` nạp lại từ CSDL ở `JwtAuthenticationFilter`. |
| Frontend lưu gì sau khi đăng nhập? | `token` và `user` trong localStorage; `authFetch` gắn `Authorization: Bearer`. |
| Token sống bao lâu? | 24 giờ. |
| Đăng nhập sai nhiều lần thì sao? | 5 lần sai từ một IP bị khóa 15 phút, trả 429. |
| SePay là gì? | Dịch vụ theo dõi biến động số dư ngân hàng, gọi webhook khi có tiền vào. |
| Nội dung chuyển khoản là gì? | Mã đơn (đặt sân) hoặc mã giao dịch (nạp ví, mua gói). |
| Vì sao 401 khác 403? | 401: chưa xác thực / token sai; 403: đã đăng nhập nhưng không đủ quyền. |

## 5. Điểm yếu cần biết (nói thật nếu thầy hỏi)

- Webhook SePay: chưa so sánh số tiền; xác thực bằng API key chỉ bật khi có cấu hình.
- Rate limit **lưu trong bộ nhớ**: khởi động lại server thì mất bộ đếm, chạy nhiều server thì mỗi server đếm riêng (hướng phát triển: Redis).
- Captcha chỉ ở frontend.
- Khóa JWT và mật khẩu ứng dụng Gmail đang có **giá trị mặc định trong `application.properties`**; khi đưa lên GitHub công khai phải chuyển hết sang biến môi trường (`JWT_SECRET`, `MAIL_PASSWORD`).
- Nạp ví phải chờ admin xác nhận, chưa tự động.

## 6. Câu chuyển giao

- "Đặt sân, tính giá, scheduler, quản lý đơn và chi nhánh do **Hiếu** trả lời."
- "Gửi email, quên mật khẩu OTP, hội viên, CRUD admin, `WalletService` do **Nghĩa** trả lời."
- "Test của mình: `AuthSecurityIntegrationTest`, `SecurityHardeningIntegrationTest` (rate limit, IDOR, SQL injection, token giả, header), `XssAndCorsIntegrationTest`."
