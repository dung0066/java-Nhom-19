# Ôn báo cáo – Phùng Văn Hiếu (Trưởng nhóm)

> Cách thầy hỏi: **"thấy bạn thao tác tới đâu thì hỏi tới đó"**, khoảng 3–4 câu, **ai làm phần đó thì người đó trả lời**.
> Vì vậy hãy học **theo phần mình làm**, không cần thuộc cả đồ án. Mỗi luồng bên dưới đều theo một mẫu:
> **Thao tác trên giao diện → Frontend lưu/gọi gì → Backend xử lý ở đâu → DB đổi gì → Câu thầy hay hỏi.**

---

## 1. Phần của mình (theo Bảng 1.2)

| Mục | Nội dung |
|---|---|
| Nhiệm vụ | Trưởng nhóm. Thiết kế CSDL và ERD, entity, repository, **nghiệp vụ đặt sân**, **tính giá**, **scheduler**, **quản lý đặt sân (admin)**, **quản lý chi nhánh** |
| Sản phẩm | ERD, script SQL, `BookingService`, `PricingService`, commit trên GitHub |
| Nhớ nhanh | "Từ lúc khách chọn ô sân → ra giá → tạo đơn → giữ chỗ 10 phút → tự hủy nếu không trả → admin duyệt / thu nốt / hủy" |

### Bản đồ file của mình

**Backend** (`backend/src/main/java/com/example/Dat_san_cau_long/`)

| Việc | File |
|---|---|
| API khách đặt sân | `controller/BookingApiController.java` |
| Nghiệp vụ đặt sân, báo giá, hủy, thu nốt | `service/BookingService.java` |
| Tính giá, giảm giá hội viên | `service/PricingService.java` |
| Tự hủy đơn quá hạn (chạy nền) | `service/BookingExpirationScheduler.java` |
| API admin quản lý đơn | `controller/AdminBookingController.java` |
| API admin quản lý chi nhánh, ủy quyền | `controller/AdminBranchController.java` |
| Thùng rác chi nhánh, sân (xóa mềm) | `service/CatalogTrashService.java` |
| Entity | `model/Booking.java`, `BookingDetail.java`, `BookingItem.java`, `Branch.java`, `Court.java`, `TimeSlot.java`, `PriceRule.java` … |
| Script CSDL | `backend/database/database_v2_19bang.sql` (nay có **20 bảng**) |

**Frontend** (`frontend/src/`)

| Việc | File |
|---|---|
| Trang đặt sân 4 bước | `pages/BookingPage.jsx` |
| Ma trận sân × khung giờ | `components/booking/BookingMatrix.jsx` |
| Hàm gọi API | `services/api.js` (`fetchMatrixData`, `quoteBooking`, `createBooking`, `cancelBooking`, `payRemainingBooking`) |
| Màn hình quản lý đơn (admin) | `components/admin/AdminBookingsTab.jsx` |
| Quản lý chi nhánh (admin) | `components/admin/AdminBranchesTab.jsx` |

---

## 2. Demo luồng chính của web từ đầu đến cuối (cả nhóm – biết ai trả lời)

| Bước | Thao tác | Ai trả lời |
|---|---|---|
| 1 | Mở trang chủ, xem chi nhánh, tin tức, gói hội viên | Cả nhóm (React) |
| 2 | Đăng ký / đăng nhập, nhận JWT | **Dũng** |
| 3 | Chọn chi nhánh, ngày, ô sân trên ma trận | **Hiếu** |
| 4 | Xem giá và giảm giá hội viên | **Hiếu** (giá) + **Nghĩa** (gói hội viên) |
| 5 | Chọn thanh toán 100% hoặc cọc 50%, bấm xác nhận → tạo đơn | **Hiếu** |
| 6 | Thanh toán ví / VietQR / tiền mặt | Ví: **Hiếu** (trừ ví lúc đặt), **Nghĩa** (WalletService); VietQR + SePay: **Dũng** |
| 7 | Nhận email xác nhận | **Nghĩa** |
| 8 | Xem đơn, bấm vào đơn xem chi tiết, hủy đơn được hoàn về ví | **Hiếu** |
| 9 | Admin duyệt, check-in, thu nốt, hủy đơn | **Hiếu** |
| 10 | Admin CRUD sản phẩm, giá, tài khoản, bài viết | **Nghĩa** |

---

## 3. Các luồng của Hiếu (học kỹ)

### Luồng A – Xem lịch sân (ma trận)

**Người dùng làm:** vào trang **Đặt sân**, chọn chi nhánh (NVL, DQII, NQA, HB) và ngày.

**Frontend**
- `BookingPage.jsx`: state `branch`, `date`; `useEffect` gọi `loadMatrix(branch, date)` mỗi khi đổi.
- `services/api.js` → `fetchMatrixData` → `GET /api/booking/matrix?branch=NVL&date=2026-11-06`.
- Lưu vào state: `courts` (danh sách sân), `timeSlots` (38 ca), `slotStatusMap` (ô nào đã đặt).
- `BookingMatrix.jsx` vẽ mỗi ô với class `status-available` / `status-booked` / `status-selected`.

**Backend**
- `BookingApiController.getMatrix` → `BookingService.getMatrixData(branchCode, date)`:
  1. Lấy sân của chi nhánh (`courtRepository.findByBranchCodeOrderByCourtNumberAsc`).
  2. Lấy 38 khung giờ (`timeSlotRepository.findAllByOrderBySortOrderAsc`).
  3. `fillDynamicPrices`: gắn giá theo từng khung giờ (gọi `PricingService`).
  4. Lấy các ô đang có đơn còn hiệu lực rồi `buildSlotStatusMap` tạo map `"courtId_timeSlotId"` → trạng thái.
- Endpoint này **công khai** (khách vãng lai cũng xem được).

**Câu thầy hay hỏi**
- *"Ô đã đặt được tô đỏ dựa vào đâu?"* → Backend trả `slotStatusMap` với khóa `courtId_timeSlotId`; frontend dò từng ô, có khóa thì `status-booked`.
- *"Giờ đã qua có cho chọn không?"* → **Không.** Frontend: hàm `isPastSlot` trong `BookingPage.jsx` (ngày < hôm nay, hoặc hôm nay mà giờ bắt đầu ≤ giờ hiện tại) → hiện cảnh báo "Khung giờ này đã qua…", không thêm vào `selectedSlots`. **Backend chặn lần nữa** ở `BookingService.hasStarted` (ném lỗi → mã 409). Frontend chặn cho tiện, backend chặn mới là chặn thật.
- *"Vì sao chỉ chọn được các ca liền kề?"* → `handleToggleSlot` + `areSlotsConsecutive` so `sortOrder` của các ca đã chọn, phải liên tiếp nhau (chênh đúng 1).

### Luồng B – Báo giá trước khi đặt

**Frontend:** `BookingPage.jsx` có `useEffect` gọi `quoteBooking` **sau 250ms** khi khách đổi sân, giờ hoặc dịch vụ (debounce để không gọi liên tục). Kết quả lưu ở state `quote` (giá từng ca, `discountAmount`, `totalPrice`).

**Backend:** `POST /api/booking/quote` → `BookingService.quoteBooking(req, user)` (chỉ đọc, **không lưu đơn**). Nếu có token thì kèm giảm giá hội viên.

**Ý chính để nói:** báo giá và tạo đơn **dùng chung `PricingService`**, nên số tiền khách thấy khớp số tiền thật.

### Luồng C – Tạo đơn đặt sân (quan trọng nhất)

**Người dùng làm:** bước 4 chọn **Thanh toán 100%** hoặc **Đặt cọc 50%**, chọn phương thức (ví / VietQR / tiền mặt), bấm xác nhận.

**Frontend** (`handleSubmitBooking`)
- State liên quan: `selectedSlots`, `serviceQuantities`, `customerName`, `customerPhone`, `customerEmail`, `depositOption` (`"FULL"` hoặc `"DEPOSIT_50"`), `paymentType` (`"VIETQR"`, `"CASH"`, `"WALLET"`), `bookingResult`.
- Gửi `createBooking(payload)` với `branchCode`, `bookingDate`, `selectedSlots[{courtId, timeSlotId}]`, `addonItems`, thông tin khách, `paymentMethod`, `isDeposit`.
- Dữ liệu đăng nhập: `token`, `user` lưu ở **localStorage**, `authFetch` tự gắn `Authorization: Bearer …`.

**Backend** – `BookingService.createBooking` chạy trong **một `@Transactional`**:
1. Tìm chi nhánh, đọc ngày, kiểm tra có chọn ít nhất 1 ca.
2. Tìm user (khách vãng lai thì `null`) và gói hội viên đang hiệu lực.
3. Tạo `Booking` ở trạng thái **PENDING**, `holdExpiresAt` = bây giờ + **10 phút** (`DEFAULT_HOLD_MINUTES`), hoặc số phút theo quyền lợi `HOLD_MINUTES` của gói.
4. `buildSlotDetails`: với từng ô – kiểm tra **chưa qua giờ** (`hasStarted`) và **chưa có người đặt** (`findByCourtIdAndTimeSlotIdAndSlotDate…StatusNot(CANCELLED)`), lấy giá từ `PricingService`.
5. Tính giảm giá hội viên (`calculateTotalDiscount`), thêm dịch vụ kèm (`buildAddonItems`, **trừ tồn kho** theo chi nhánh bằng câu UPDATE có điều kiện).
6. Nếu đặt cọc: số tiền cần trả = 50% tổng (làm tròn), ghi chú `[COC_50%]`. Nếu 100%: ghi chú `[THANH_TOAN_100%]`.
7. Thanh toán:
   - **Ví:** `walletRepository.deductBalanceAtomic` (UPDATE `balance = balance - x WHERE balance >= x`). Không đủ tiền → ném lỗi, **cả transaction hoàn tác**. Thành công → `CONFIRMED` (đủ) hoặc `DEPOSITED` (cọc).
   - **VietQR / tiền mặt:** đơn giữ ở `PENDING`, tạo `Payment` trạng thái `PENDING`.
8. Lưu `Booking`, `Payment`; nếu đã trả bằng ví thì gửi email xác nhận (lỗi mail **không** làm hỏng đơn).

**Bảng trạng thái đơn (`BookingStatus`):** `PENDING` (chờ trả) → `DEPOSITED` (đã cọc 50%) / `CONFIRMED` (đã trả đủ) → `COMPLETED` (đã nhận sân); `CANCELLED`, `EXPIRED`, `NO_SHOW`.

**Câu thầy hay hỏi**
- *"Hai người bấm đặt cùng một ô cùng lúc thì sao?"* → Hai lớp bảo vệ: (1) `BookingService` kiểm tra ô đã có đơn chưa; (2) **CSDL** có khóa duy nhất `uk_slot_active (court_id, time_slot_id, slot_date, active_slot_key)`, trong đó `active_slot_key` là cột sinh tự động = 1 khi dòng chưa hủy và `NULL` khi đã hủy. Người đến sau bị lỗi, **toàn bộ transaction của họ hoàn tác** (kể cả tồn kho đã trừ). Vì MySQL cho nhiều `NULL` trong khóa duy nhất nên đơn đã hủy không chặn người khác đặt lại.
- *"Vì sao ví không bao giờ bị âm?"* → Câu `UPDATE … WHERE balance >= :amount`; trả về 0 dòng nghĩa là không đủ, service ném lỗi.
- *"Khách vãng lai đặt được không?"* → Được (`/api/booking/create` là công khai) nhưng **không** thanh toán bằng ví và không có giảm giá hội viên.
- *"Tiền cọc tính ở đâu?"* → Backend: `createBooking` (50% làm tròn). Frontend chỉ hiển thị (`depositAmount = round(total × 0.5)`); số thật do backend quyết định.

### Luồng D – Tính giá (`PricingService`)

- `resolvePriceInfo(branchId, timeSlotId, date)`:
  1. Xác định loại ngày: Thứ 7, Chủ nhật = `WEEKEND`, còn lại `WEEKDAY` (`determineDayType`).
  2. `priceRuleRepository.findCandidateRules` lấy các **quy tắc giá** phù hợp (chi nhánh – hoặc rỗng = mọi chi nhánh, khung giờ – hoặc rỗng = cả ngày, loại ngày `ALL`/đúng loại, còn hiệu lực).
  3. Sắp xếp theo **`priority` giảm dần**, rồi ưu tiên quy tắc cụ thể hơn (có chi nhánh, có khung giờ). **Quy tắc đầu tiên thắng.**
  4. Không có quy tắc nào → **giá mặc định 70.000 đ**.
- Giờ cao điểm (`isPeakRule`): giá ≥ 100.000 đ **hoặc** quy tắc riêng cho một khung giờ có `priority > 0`.
- Dữ liệu mẫu: một quy tắc chung 70.000 đ (ưu tiên 0) và 5 quy tắc 120.000 đ (ưu tiên 10) cho khung giờ cao điểm.
- `calculateDiscount`: giảm giá hội viên = **giá gốc × % giảm của gói** (làm tròn đồng), có kiểm tra khung giờ áp dụng của gói nếu có.
- Admin chỉnh quy tắc giá ở tab **Cấu hình giá** (có thêm / sửa / xóa) – phần CRUD này do **Nghĩa** phụ trách.

*Câu hỏi mẫu:* "Hai quy tắc cùng khớp thì lấy cái nào?" → Cái có `priority` cao hơn; bằng nhau thì cái cụ thể hơn (có chi nhánh / khung giờ).

### Luồng E – Scheduler tự hủy đơn quá hạn

- `BookingExpirationScheduler.cancelExpiredPendingBookings`: `@Scheduled(fixedRate = 60000)` – **mỗi 60 giây** tìm đơn `PENDING` có `holdExpiresAt` trước bây giờ.
- Mỗi đơn: chuyển `CANCELLED` (lý do "Hết thời gian giữ chỗ thanh toán"), các ô sang `CANCELLED` (nhả sân), **cộng lại tồn kho** (`addStockAtomic`), giao dịch `PENDING` chuyển `FAILED`.
- Cùng lớp còn `expireOldMemberships`: gói hội viên quá hạn → `EXPIRED`.
- *Hỏi:* "Vì sao phải giữ chỗ 10 phút?" → để khách kịp quét QR; hết hạn thì trả sân cho người khác, không để đơn chưa trả "treo" ô sân.

### Luồng F – Xem đơn, chi tiết đơn, hủy đơn và hoàn tiền

**Khách:** vào hồ sơ → **Đơn hàng đã đặt**.
- Frontend: `AccountModal.jsx` gọi `fetchMyBookings(userId)` → `GET /api/booking/user/{userId}`.
- Bấm vào một đơn mở `OrderDetailModal.jsx`: cơ sở, các ca, dịch vụ kèm, giảm giá, đã trả, còn lại, đã hoàn. Dữ liệu lấy từ chính danh sách đơn (không gọi thêm API).
- **Chống xem trộm (IDOR):** `AccessChecks.requireSelfOrStaff` – chỉ chủ tài khoản hoặc nhân viên.

**Hủy đơn:** `DELETE /api/booking/cancel/{id}` → `BookingService.cancelBooking` → `cancelBookingInternal`:
1. Đơn đã `CANCELLED` thì **trả về 0, không hoàn gì thêm** (hủy hai lần chỉ hoàn một lần).
2. Đơn, các ô → `CANCELLED`; sản phẩm kèm được **cộng lại kho**.
3. `settlePaymentsOfCancelledBooking`: giao dịch `PENDING` → `FAILED`; giao dịch `PAID` (dù cọc hay 100%, dù phương thức nào) → **cộng vào ví** (`addBalanceAtomic`), ghi bảng **`refunds`** trạng thái `DONE`, giao dịch → `REFUNDED`.

**Thanh toán nốt cho đơn đặt cọc**
- Khách: `POST /api/booking/{id}/pay-remaining` → `payRemainingBookingByOwner`: **chỉ chủ đơn** và **chỉ ví** (đã vá lỗ hổng cũ: trước đây ai cũng gọi được và chọn tiền mặt).
- Quầy: `POST /api/admin/bookings/{id}/pay-remaining` (tiền mặt, ví, chuyển khoản).
- Số còn lại = tổng tiền − tổng các giao dịch `PAID` (`Booking.getRemainingAmount`). Xong đơn thành `CONFIRMED`.

### Luồng G – Quản lý đặt sân (trang admin)

**Frontend:** `AdminBookingsTab.jsx` – 4 ô thống kê, bảng đơn có tìm kiếm, lọc chi nhánh/trạng thái, phân trang. Cột tiền hiển thị: *Thanh toán 100%*, *Đã cọc + còn thiếu*, *Chờ cọc 50%*, *Chưa thanh toán*, đơn hủy hiện giá trị đơn và số đã hoàn.

**Backend:** `AdminBookingController`
| Nút | API | Ghi chú |
|---|---|---|
| Duyệt / Duyệt cọc | `POST /api/admin/bookings/{id}/confirm` | đơn → `CONFIRMED` hoặc `DEPOSITED`, giao dịch `PENDING` → `PAID`, gửi email |
| Check-in | `POST …/{id}/checkin` | đơn và các ô → `COMPLETED` |
| Thu nốt | `POST …/{id}/pay-remaining` | thu 50% còn lại |
| Hủy | `POST …/{id}/cancel` | hoàn tiền về ví khách |

**Phân quyền theo chi nhánh** (`security/BranchAccess.java`): admin xem tất cả; **quản lý cửa hàng (ROLE_STAFF)** chỉ thấy và thao tác đơn của chi nhánh được ủy quyền trong bảng `staff_branches`. Thao tác lên đơn chi nhánh khác → **403**; chưa được ủy quyền chi nhánh nào → không thấy đơn nào.

### Luồng H – Quản lý chi nhánh

- Frontend: `AdminBranchesTab.jsx` (tìm kiếm, phân trang, Thêm / Sửa / Xóa, **Ủy quyền QL**, thùng rác).
- Backend: `AdminBranchController` – CRUD chi nhánh, `assign-manager` và `revoke-manager` để ủy quyền quản lý cửa hàng; chỉ **ROLE_ADMIN** (`@PreAuthorize`).
- **Xóa mềm:** `CatalogTrashService` đặt `deleted_at` thay vì xóa thật → giữ được lịch sử đơn cũ; có khôi phục và xóa vĩnh viễn. Chi nhánh/sân còn lượt đặt chưa diễn ra thì **không cho xóa**.
- **Ủy quyền:** chọn tài khoản → đổi vai trò thành `ROLE_STAFF` và ghi dòng `(user_id, branch_id)` vào `staff_branches`; thu hồi thì xóa dòng đó (và hạ về người dùng thường nếu không còn quản lý chi nhánh nào).

### Luồng I – CSDL và ERD

- **20 bảng**, chuẩn hóa 3NF, `utf8mb4`, tiền `DECIMAL(12,0)` (Java dùng `BigDecimal`, không dùng số thực).
- Nhóm bảng: danh mục (`branches`, `courts`, `time_slots`, `price_rules`), người dùng (`users`, `wallets`, `staff_branches`, `password_reset_tokens`), hội viên (`membership_packages`, `package_benefits`, `user_memberships`), đặt sân (`bookings`, `booking_details`, `booking_items`), sản phẩm (`product_categories`, `products`, `product_inventory`), thanh toán (`payments`, `refunds`), nội dung (`articles`).
- **Ràng buộc quan trọng:**
  - Chống đặt trùng: `uk_slot_active` (đã nêu ở luồng C).
  - **Khóa ngoại kép:** `booking_details` tham chiếu `(court_id, branch_id)` tới `courts` và `(booking_id, branch_id)` tới `bookings` → ô sân trong chi tiết luôn **cùng chi nhánh** với đơn.
  - `CHECK`: giá, số lượng, số dư ví không âm; % giảm 0–100; ngày kết thúc gói lớn hơn ngày bắt đầu.
  - `UNIQUE`: mã chi nhánh, mã đơn, mã giao dịch, username, email, SĐT, `provider_txn_code`.
  - Xóa mềm: `branches`, `courts` có `deleted_at`.
- Tổng tiền đơn **không lưu cứng**: `Booking.getTotalPrice()` tính từ các ô và dịch vụ còn hiệu lực trừ giảm giá (`@Transient`). Vì thế đơn đã hủy có `totalPrice = 0`; để biết giá trị lúc đặt dùng `getGrossAmount()`.

---

## 4. Câu hỏi nhanh – trả lời trong 1–2 câu

| Câu hỏi | Trả lời |
|---|---|
| Backend của bạn làm gì? | Đặt sân, tính giá, scheduler, API quản lý đơn và chi nhánh, thiết kế CSDL. |
| Đoạn code kiểm tra ô đã đặt nằm ở đâu? | `BookingService.buildSlotDetails` (+ khóa duy nhất `uk_slot_active` ở CSDL). |
| Dùng thuộc tính nào để biết ô đã đặt? | Backend trả `slotStatusMap` với khóa `courtId_timeSlotId`. |
| Frontend lưu dữ liệu gì? | State React: `selectedSlots`, `quote`, `depositOption`, `paymentType`; `token` và `user` ở localStorage. |
| Tại sao dùng `@Transactional`? | Nhiều bước (tạo đơn, trừ ví, trừ kho, tạo giao dịch) phải cùng thành công hoặc cùng hoàn tác. |
| Giữ chỗ bao lâu? | 10 phút mặc định, gói hội viên có quyền lợi `HOLD_MINUTES` thì lâu hơn. |
| Hủy đơn thì tiền đi đâu? | Hoàn 100% số đã trả về **ví nội bộ**, ghi bảng `refunds`. |
| Quản lý cửa hàng khác admin ở đâu? | Chỉ thao tác chi nhánh được ủy quyền (`BranchAccess`, bảng `staff_branches`). |

## 5. Điểm yếu cần biết (nói thật nếu thầy hỏi)

- Một số API (ví dụ danh sách đơn) trả **thẳng entity**; chưa tách DTO hết, phải dùng `@JsonIgnore` để tránh vòng lặp JSON.
- Trạng thái "đơn đặt cọc" được suy ra từ ghi chú `[COC_50%]` và số tiền đã trả (`Booking.isDeposit()`), chưa có cột riêng.
- Frontend ghi thêm bản sao tạm trong localStorage (`d2_booked_slots_*`, `d2_user_bookings`) để tô ô nhanh; **dữ liệu thật luôn lấy từ backend**.
- Giờ đã qua chỉ bị chặn khi **bấm** (cảnh báo), ô chưa được tô xám riêng; backend vẫn chặn đúng.
- Cơ sở dữ liệu dùng `ddl-auto=update`, chưa có Flyway/Liquibase để quản lý phiên bản schema.

## 6. Câu chuyển giao

- "Phần đăng nhập, JWT, rate limit và nhận tiền SePay do **Dũng** trả lời."
- "Gửi email, quên mật khẩu OTP, hội viên, CRUD admin còn lại và `WalletService` do **Nghĩa** trả lời."
- "Giao diện React và test do cả nhóm làm chung; test của mình là `BookingFlow`, `BookingPayment`, `BookingQuote`, `PricingAndMatrix`, `CatalogTrash`."
