package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.BookingQuoteDto;
import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.dto.ResolvedPriceInfo;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.*;
import com.example.Dat_san_cau_long.model.enums.*;
import com.example.Dat_san_cau_long.repository.*;
import com.example.Dat_san_cau_long.security.AccessChecks;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Nghiệp vụ đặt sân: dựng ma trận lịch sân, tạo đơn, hủy đơn.
 *
 * Luồng tạo đơn (createBooking):
 *   1. Kiểm tra chi nhánh và danh sách slot khách chọn.
 *   2. Xác định thời gian giữ chỗ (hội viên có thể được giữ lâu hơn).
 *   3. Với mỗi slot: kiểm tra chưa ai đặt, lấy giá động, tạo BookingDetail.
 *   4. Với mỗi sản phẩm mua kèm: trừ tồn kho bằng câu lệnh atomic.
 *   5. Tính tiền giảm giá hội viên rồi lưu đơn.
 *   6. Tạo giao dịch thanh toán: trả bằng ví thì trừ ví và xác nhận đơn ngay; VietQR hoặc tiền mặt
 *      thì đơn ở trạng thái PENDING (giữ chỗ có thời hạn) chờ admin xác nhận đã nhận tiền.
 * Cả hàm chạy trong một transaction nên lỗi ở bước nào cũng hoàn tác toàn bộ.
 */
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private static final String DEFAULT_BRANCH_CODE = "NVL";
    private static final int DEFAULT_HOLD_MINUTES = 10;
    private static final double FALLBACK_SLOT_PRICE = 70000.0;

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final PackageBenefitRepository packageBenefitRepository;
    private final ProductRepository productRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final PricingService pricingService;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final EmailService emailService;
    private final RefundRepository refundRepository;

    public BookingService(BranchRepository branchRepository,
                          CourtRepository courtRepository,
                          TimeSlotRepository timeSlotRepository,
                          BookingRepository bookingRepository,
                          BookingDetailRepository bookingDetailRepository,
                          UserRepository userRepository,
                          UserMembershipRepository userMembershipRepository,
                          PackageBenefitRepository packageBenefitRepository,
                          ProductRepository productRepository,
                          ProductInventoryRepository productInventoryRepository,
                          PricingService pricingService,
                          PaymentRepository paymentRepository,
                          WalletRepository walletRepository,
                          EmailService emailService,
                          RefundRepository refundRepository) {
        this.branchRepository = branchRepository;
        this.courtRepository = courtRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.userRepository = userRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.packageBenefitRepository = packageBenefitRepository;
        this.productRepository = productRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.pricingService = pricingService;
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
        this.emailService = emailService;
        this.refundRepository = refundRepository;
    }

    // ==================== MA TRẬN LỊCH SÂN ====================

    /** Dữ liệu cho màn hình đặt sân: danh sách sân, khung giờ (kèm giá) và ô nào đã có người đặt. */
    public MatrixResponseDto getMatrixData(String branchCode, LocalDate date) {
        if (branchCode == null || branchCode.isEmpty()) {
            branchCode = DEFAULT_BRANCH_CODE;
        }
        if (date == null) {
            date = LocalDate.now();
        }

        Branch currentBranch = findBranchOrFirst(branchCode);
        List<Court> courts = courtRepository.findByBranchCodeOrderByCourtNumberAsc(currentBranch.getCode());
        List<TimeSlot> timeSlots = timeSlotRepository.findAllByOrderBySortOrderAsc();
        fillDynamicPrices(timeSlots, currentBranch, date);

        List<BookingDetail> activeBookings =
                bookingDetailRepository.findActiveBookingsByBranchAndDate(currentBranch.getCode(), date);

        return MatrixResponseDto.builder()
                .currentBranch(currentBranch)
                .allBranches(branchRepository.findByDeletedAtIsNull())
                .selectedDate(date)
                .courts(courts)
                .timeSlots(timeSlots)
                .slotStatusMap(buildSlotStatusMap(activeBookings))
                .build();
    }

    /** Tìm chi nhánh theo mã; không thấy thì dùng chi nhánh đầu tiên. */
    private Branch findBranchOrFirst(String branchCode) {
        return branchRepository.findByCodeAndDeletedAtIsNull(branchCode)
                .orElseGet(() -> branchRepository.findByDeletedAtIsNull().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Chưa có dữ liệu chi nhánh!")));
    }

    /** Gắn giá động và cờ giờ cao điểm cho từng khung giờ theo chi nhánh và ngày. */
    private void fillDynamicPrices(List<TimeSlot> timeSlots, Branch branch, LocalDate date) {
        for (TimeSlot slot : timeSlots) {
            ResolvedPriceInfo priceInfo = pricingService.resolvePriceInfo(branch.getId(), slot.getId(), date);
            slot.setPrice(priceInfo.getPrice());
            slot.setIsPeak(priceInfo.isPeak());
            slot.setIsPeakHour(priceInfo.isPeak());
            slot.setStandardPrice(priceInfo.getStandardPrice());
            slot.setPeakPrice(priceInfo.getPeakPrice());
        }
    }

    /** Tạo map "sân_khungGiờ" -> trạng thái, để frontend tô màu ô đã đặt. */
    private Map<String, MatrixResponseDto.SlotStatusDto> buildSlotStatusMap(List<BookingDetail> activeBookings) {
        Map<String, MatrixResponseDto.SlotStatusDto> statusMap = new HashMap<>();
        for (BookingDetail detail : activeBookings) {
            String key = detail.getCourt().getId() + "_" + detail.getTimeSlot().getId();
            statusMap.put(key, MatrixResponseDto.SlotStatusDto.builder()
                    .status(detail.getStatus().name())
                    .customerName(detail.getBooking() != null ? detail.getBooking().getCustomerName() : "Khách đã đặt")
                    .passContact(null)
                    .price(detail.getPrice() != null ? detail.getPrice().doubleValue() : FALLBACK_SLOT_PRICE)
                    .bookingDetailId(detail.getId())
                    .build());
        }
        return statusMap;
    }

    // ==================== TẠO ĐƠN ĐẶT SÂN ====================

    @Transactional
    public Booking createBooking(BookingRequestDto req) {
        Branch branch = branchRepository.findByCodeAndDeletedAtIsNull(req.getBranchCode())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh: " + req.getBranchCode()));

        LocalDate date = LocalDate.parse(req.getBookingDate());

        if (req.getSelectedSlots() == null || req.getSelectedSlots().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 khung giờ đặt sân!");
        }

        // Khách vãng lai không có userId nên user = null và không có hội viên.
        User user = (req.getUserId() != null) ? userRepository.findById(req.getUserId()).orElse(null) : null;
        Optional<UserMembership> activeMembership = (user != null)
                ? userMembershipRepository.findActiveMembershipForUser(user.getId(), LocalDateTime.now())
                : Optional.empty();

        PaymentMethod method = resolveBookingPaymentMethod(req.getPaymentMethod());
        if (method == PaymentMethod.WALLET && user == null) {
            throw new IllegalArgumentException("Bạn cần đăng nhập để thanh toán bằng ví!");
        }

        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode(date))
                .customerName(req.getCustomerName())
                .customerPhone(req.getCustomerPhone())
                .customerEmail(req.getCustomerEmail())
                .branch(branch)
                .notes(req.getNotes())
                .status(BookingStatus.PENDING)
                .holdExpiresAt(LocalDateTime.now().plusMinutes(resolveHoldMinutes(activeMembership)))
                .user(user)
                .build();

        List<BookingDetail> details = buildSlotDetails(req, booking, branch, date);

        booking.setDiscountAmount(calculateTotalDiscount(details, user, date));
        booking.setDetails(details);
        booking.setItems(buildAddonItems(req, booking, branch));
        activeMembership.ifPresent(booking::setAppliedMembership);

        BigDecimal total = booking.getTotalPrice();
        boolean isDeposit = req.isDeposit50();
        BigDecimal payAmount = total;
        if (isDeposit && total.compareTo(BigDecimal.ZERO) > 0) {
            payAmount = total.multiply(new BigDecimal("0.5")).setScale(0, java.math.RoundingMode.HALF_UP);
            BigDecimal remaining = total.subtract(payAmount);
            String depositNote = "[COC_50%] Đã chọn đặt cọc 50%: " + payAmount.toPlainString() + " đ. Số tiền còn lại tại quầy: " + remaining.toPlainString() + " đ.";
            booking.setNotes(booking.getNotes() != null && !booking.getNotes().isBlank()
                    ? depositNote + " | " + booking.getNotes()
                    : depositNote);
        } else if (total.compareTo(BigDecimal.ZERO) > 0) {
            String fullNote = "[THANH_TOAN_100%] Đã chọn thanh toán toàn bộ 100%: " + total.toPlainString() + " đ.";
            booking.setNotes(booking.getNotes() != null && !booking.getNotes().isBlank()
                    ? fullNote + " | " + booking.getNotes()
                    : fullNote);
        }

        boolean needsPayment = payAmount.compareTo(BigDecimal.ZERO) > 0;
        boolean paidNow = false;
        if (!needsPayment) {
            // Đơn 0 đồng (giảm giá toàn phần) không cần thanh toán nên xác nhận luôn
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setHoldExpiresAt(null);
        } else if (method == PaymentMethod.WALLET) {
            // Trừ ví bằng một câu UPDATE atomic; không đủ số dư thì cả transaction (kể cả giữ chỗ) bị hoàn tác
            if (walletRepository.deductBalanceAtomic(user.getId(), payAmount) == 0) {
                throw new IllegalStateException("Số dư ví không đủ để thanh toán " + (isDeposit ? "tiền cọc 50% (" : "") + payAmount.toPlainString()
                        + " đ" + (isDeposit ? ")" : "") + ". Hãy nạp thêm hoặc chọn cách thanh toán khác!");
            }
            booking.setStatus(isDeposit ? BookingStatus.DEPOSITED : BookingStatus.CONFIRMED);
            booking.setHoldExpiresAt(null);
            paidNow = true;
        }

        Booking saved = bookingRepository.save(booking);

        if (needsPayment) {
            Payment savedPayment = paymentRepository.save(Payment.builder()
                    .paymentCode(generateBookingPaymentCode(date))
                    .purpose(PaymentPurpose.BOOKING)
                    .user(user)
                    .booking(saved)
                    .amount(payAmount)
                    .method(method)
                    .status(paidNow ? PaymentStatus.PAID : PaymentStatus.PENDING)
                    .paidAt(paidNow ? LocalDateTime.now() : null)
                    .build());
            if (saved.getPayments() == null) {
                saved.setPayments(new ArrayList<>());
            }
            saved.getPayments().add(savedPayment);
        }

        if (paidNow) {
            try {
                emailService.sendBookingSuccessEmail(saved);
            } catch (Exception ex) {
                log.error("Không thể gửi email xác nhận đặt sân: {}", ex.getMessage());
            }
        }

        return saved;
    }

    /** Phương thức thanh toán khách chọn khi đặt sân; SYSTEM chỉ dành cho nghiệp vụ nội bộ. */
    private PaymentMethod resolveBookingPaymentMethod(String raw) {
        PaymentMethod method = PaymentMethod.fromStringOrDefault(raw);
        if (method == PaymentMethod.SYSTEM) {
            throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ!");
        }
        return method;
    }

    private String generateBookingPaymentCode(LocalDate date) {
        return "PAY-BK-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (100000 + new Random().nextInt(900000));
    }

    /** Giao dịch thanh toán mới nhất của đơn (null nếu đơn không cần thanh toán). */
    public Payment findLatestPayment(Long bookingId) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        return payments.isEmpty() ? null : payments.get(payments.size() - 1);
    }

    // ==================== BÁO GIÁ (KHÔNG LƯU ĐƠN) ====================

    /**
     * Báo giá trước khi đặt: dùng đúng PricingService như lúc tạo đơn nên số tiền khách thấy
     * khớp với số tiền thật. Không lưu gì và không trừ tồn kho.
     */
    @Transactional(readOnly = true)
    public BookingQuoteDto quoteBooking(BookingRequestDto req, User user) {
        Branch branch = branchRepository.findByCodeAndDeletedAtIsNull(req.getBranchCode())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh: " + req.getBranchCode()));

        LocalDate date;
        try {
            date = LocalDate.parse(req.getBookingDate());
        } catch (Exception e) {
            throw new IllegalArgumentException("Ngày đặt sân không hợp lệ (cần dạng yyyy-MM-dd)!");
        }
        if (req.getSelectedSlots() == null || req.getSelectedSlots().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 khung giờ đặt sân!");
        }

        List<BookingQuoteDto.SlotQuote> slotQuotes = new ArrayList<>();
        BigDecimal courtAmount = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (BookingRequestDto.SlotItemDto item : req.getSelectedSlots()) {
            Court court = resolveCourtForBranch(item.getCourtId(), branch);
            TimeSlot slot = timeSlotRepository.findById(item.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ id: " + item.getTimeSlotId()));

            BigDecimal price = pricingService.resolvePrice(branch.getId(), slot.getId(), date);
            BigDecimal discount = pricingService.calculateDiscount(price, user, slot, date);
            boolean available = !hasStarted(date, slot) && bookingDetailRepository
                    .findByCourtIdAndTimeSlotIdAndSlotDateAndStatusNot(
                            court.getId(), slot.getId(), date, BookingDetailStatus.CANCELLED)
                    .isEmpty();

            courtAmount = courtAmount.add(price);
            discountAmount = discountAmount.add(discount);
            slotQuotes.add(BookingQuoteDto.SlotQuote.builder()
                    .courtId(court.getId()).timeSlotId(slot.getId())
                    .courtName(court.getName()).timeSlotLabel(slot.getDisplayLabel())
                    .price(price).discount(discount).available(available)
                    .build());
        }

        BigDecimal itemsAmount = BigDecimal.ZERO;
        if (req.getAddonItems() != null) {
            for (BookingRequestDto.AddonItemDto addon : req.getAddonItems()) {
                if (addon.getProductId() == null || addon.getQuantity() == null || addon.getQuantity() <= 0) {
                    continue;
                }
                Product product = productRepository.findById(addon.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + addon.getProductId()));
                itemsAmount = itemsAmount.add(product.getPrice().multiply(BigDecimal.valueOf(addon.getQuantity())));
            }
        }

        Optional<UserMembership> membership = (user != null)
                ? userMembershipRepository.findActiveMembershipForUser(user.getId(), LocalDateTime.now())
                : Optional.empty();

        BigDecimal original = courtAmount.add(itemsAmount);
        BigDecimal total = original.subtract(discountAmount).max(BigDecimal.ZERO);
        BigDecimal depositAmount = total.multiply(new BigDecimal("0.5")).setScale(0, java.math.RoundingMode.HALF_UP);
        BigDecimal remainingAmount = total.subtract(depositAmount);

        return BookingQuoteDto.builder()
                .slots(slotQuotes)
                .courtAmount(courtAmount)
                .itemsAmount(itemsAmount)
                .originalPrice(original)
                .discountAmount(discountAmount)
                .totalPrice(total)
                .depositAmount(depositAmount)
                .remainingAmount(remainingAmount)
                .membershipName(membership.map(m -> m.getMembershipPackage().getName()).orElse(null))
                .membershipDiscountPercent(membership.map(m -> m.getMembershipPackage().getDiscountPercent()).orElse(null))
                .build();
    }

    /** Slot đã bắt đầu (hoặc đã qua) thì không còn đặt được; cùng quy tắc với chợ pass sân và scheduler. */
    private boolean hasStarted(LocalDate date, TimeSlot slot) {
        LocalDate today = LocalDate.now();
        if (date.isBefore(today)) {
            return true;
        }
        return date.isEqual(today) && !slot.getStartTime().isAfter(LocalTime.now());
    }

    /** Mã đơn dạng WAY-yyyyMMdd-xxxx (xxxx là 4 chữ số ngẫu nhiên). */
    private String generateBookingCode(LocalDate date) {
        return "WAY-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + new Random().nextInt(9000));
    }

    /** Thời gian giữ chỗ mặc định 10 phút; hội viên có đặc quyền HOLD_MINUTES thì lấy theo gói. */
    private int resolveHoldMinutes(Optional<UserMembership> activeMembership) {
        if (activeMembership.isEmpty()) {
            return DEFAULT_HOLD_MINUTES;
        }
        Long packageId = activeMembership.get().getMembershipPackage().getId();
        for (PackageBenefit benefit : packageBenefitRepository.findByMembershipPackageId(packageId)) {
            if (benefit.getBenefitType() == BenefitType.HOLD_MINUTES
                    && benefit.getValue() != null
                    && benefit.getValue().compareTo(BigDecimal.ZERO) > 0) {
                return benefit.getValue().intValue();
            }
        }
        return DEFAULT_HOLD_MINUTES;
    }

    /** Tạo BookingDetail cho từng slot khách chọn; báo lỗi nếu slot đã có người đặt. */
    private List<BookingDetail> buildSlotDetails(BookingRequestDto req, Booking booking, Branch branch, LocalDate date) {
        List<BookingDetail> details = new ArrayList<>();

        for (BookingRequestDto.SlotItemDto item : req.getSelectedSlots()) {
            Court court = resolveCourtForBranch(item.getCourtId(), branch);
            TimeSlot slot = timeSlotRepository.findById(item.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ id: " + item.getTimeSlotId()));

            if (hasStarted(date, slot)) {
                throw new IllegalStateException("Khung giờ " + slot.getDisplayLabel() + " ngày " + date
                        + " đã qua giờ bắt đầu nên không thể đặt!");
            }

            boolean alreadyBooked = bookingDetailRepository
                    .findByCourtIdAndTimeSlotIdAndSlotDateAndStatusNot(
                            court.getId(), slot.getId(), date, BookingDetailStatus.CANCELLED)
                    .isPresent();
            if (alreadyBooked) {
                throw new IllegalStateException("Sân " + court.getName() + " lúc " + slot.getDisplayLabel() + " đã có người đặt trước!");
            }

            details.add(BookingDetail.builder()
                    .booking(booking)
                    .branchId(branch.getId())
                    .court(court)
                    .timeSlot(slot)
                    .slotDate(date)
                    .price(pricingService.resolvePrice(branch.getId(), slot.getId(), date))
                    .status(BookingDetailStatus.BOOKED)
                    .build());
        }
        return details;
    }

    /** Tự động chuẩn hóa sân thuộc đúng chi nhánh đang đặt (chống lỗi lệch id giữa các chi nhánh). */
    private Court resolveCourtForBranch(Long rawCourtId, Branch branch) {
        Court court = (rawCourtId != null) ? courtRepository.findByIdAndDeletedAtIsNull(rawCourtId).orElse(null) : null;
        if (court == null || court.getBranch() == null || !court.getBranch().getId().equals(branch.getId())) {
            Integer courtNumber = (court != null && court.getCourtNumber() != null)
                    ? court.getCourtNumber()
                    : ((rawCourtId != null) ? (int) (rawCourtId % 10 == 0 ? 1 : rawCourtId % 10) : 1);

            court = courtRepository.findByBranchIdAndCourtNumberAndDeletedAtIsNull(branch.getId(), courtNumber)
                    .orElseGet(() -> courtRepository.findByBranchIdOrderByCourtNumberAsc(branch.getId()).stream().findFirst()
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân phù hợp tại chi nhánh " + branch.getName())));
        }
        return court;
    }

    /** Tổng tiền giảm của hội viên trên tất cả slot (khách vãng lai = 0). */
    private BigDecimal calculateTotalDiscount(List<BookingDetail> details, User user, LocalDate date) {
        BigDecimal totalDiscount = BigDecimal.ZERO;
        if (user == null) {
            return totalDiscount;
        }
        for (BookingDetail detail : details) {
            totalDiscount = totalDiscount.add(
                    pricingService.calculateDiscount(detail.getPrice(), user, detail.getTimeSlot(), date));
        }
        return totalDiscount;
    }

    /** Tạo BookingItem cho sản phẩm mua kèm và trừ tồn kho; hết hàng thì báo lỗi. */
    private List<BookingItem> buildAddonItems(BookingRequestDto req, Booking booking, Branch branch) {
        List<BookingItem> bookingItems = new ArrayList<>();
        if (req.getAddonItems() == null) {
            return bookingItems;
        }

        for (BookingRequestDto.AddonItemDto addon : req.getAddonItems()) {
            if (addon.getProductId() == null || addon.getQuantity() == null || addon.getQuantity() <= 0) {
                continue;
            }

            Product product = productRepository.findById(addon.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + addon.getProductId()));

            deductStockOrFail(branch, product, addon.getQuantity());

            bookingItems.add(BookingItem.builder()
                    .booking(booking)
                    .product(product)
                    .quantity(addon.getQuantity())
                    .unitPrice(product.getPrice())
                    .status(BookingItemStatus.RESERVED)
                    .build());
        }
        return bookingItems;
    }

    /** Trừ tồn kho bằng một câu UPDATE atomic (tránh bán vượt khi nhiều người đặt cùng lúc). */
    private void deductStockOrFail(Branch branch, Product product, int quantity) {
        int updated = productInventoryRepository.deductStockAtomic(branch.getId(), product.getId(), quantity);
        if (updated == 0) {
            int remaining = productInventoryRepository.findByBranchIdAndProductId(branch.getId(), product.getId())
                    .map(ProductInventory::getStockQuantity)
                    .orElse(0);
            throw new IllegalStateException("Sản phẩm '" + product.getName() + "' tại chi nhánh " + branch.getName()
                    + " không đủ tồn kho (cần " + quantity + ", hiện có " + remaining + ")!");
        }
    }

    // ==================== TRA CỨU VÀ HỦY ĐƠN ====================

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void togglePassStatus(Long detailId, String passContact) {
        BookingDetail detail = bookingDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đặt sân!"));
        bookingDetailRepository.save(detail);
    }

    /**
     * Hủy đơn:
     * - Các giao dịch PENDING chuyển thành FAILED.
     * - Đặc biệt luồng hoàn tiền về Ví: Mọi giao dịch đã thanh toán (PAID) - bao gồm cọc 50% hoặc thanh toán 100%,
     *   bằng WALLET, VIETQR, BANK_TRANSFER, hoặc CASH - đều được hoàn trả tự động vào Ví điện tử (wallets.balance)
     *   của khách hàng, ghi nhận chi tiết vào bảng refunds với trạng thái DONE.
     */
    private BigDecimal settlePaymentsOfCancelledBooking(Booking booking) {
        BigDecimal totalRefunded = BigDecimal.ZERO;
        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());

        Long bookingUserId = null;
        if (booking.getUser() != null) {
            try {
                bookingUserId = booking.getUser().getId();
            } catch (Exception ignored) {}
        }
        if (bookingUserId == null && booking.getCustomerPhone() != null) {
            bookingUserId = userRepository.findByPhone(booking.getCustomerPhone()).map(User::getId).orElse(null);
        }
        if (bookingUserId == null && booking.getCustomerEmail() != null && !booking.getCustomerEmail().isBlank()) {
            bookingUserId = userRepository.findByEmail(booking.getCustomerEmail()).map(User::getId).orElse(null);
        }

        for (Payment payment : payments) {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            } else if (payment.getStatus() == PaymentStatus.PAID) {
                Long refundUserId = null;
                if (payment.getUser() != null) {
                    try {
                        refundUserId = payment.getUser().getId();
                    } catch (Exception ignored) {}
                }
                if (refundUserId == null) {
                    refundUserId = bookingUserId;
                }

                if (refundUserId != null) {
                    final Long finalRefundUserId = refundUserId;
                    User refundUser = userRepository.findById(finalRefundUserId).orElse(null);
                    if (refundUser != null) {
                        // Đảm bảo user có ví
                        walletRepository.findById(finalRefundUserId).orElseGet(() ->
                                walletRepository.save(Wallet.builder().user(refundUser).userId(finalRefundUserId).balance(BigDecimal.ZERO).build())
                        );
                        // Hoàn tiền nguyên tử vào ví
                        walletRepository.addBalanceAtomic(finalRefundUserId, payment.getAmount());
                        totalRefunded = totalRefunded.add(payment.getAmount());
                        log.info(">>> Đã hoàn trả {} đ vào ví của user {} ({}) khi hủy đơn {}",
                                payment.getAmount(), refundUser.getUsername(), finalRefundUserId, booking.getBookingCode());
                    }
                }

                // Ghi nhận bảng refunds
                refundRepository.save(Refund.builder()
                        .payment(payment)
                        .amount(payment.getAmount())
                        .reason(booking.getCancelReason() != null ? booking.getCancelReason() : "Hoàn trả về ví khi hủy đơn " + booking.getBookingCode())
                        .status(RefundStatus.DONE)
                        .build());

                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);
            }
        }
        return totalRefunded;
    }

    /** Admin xác nhận đã nhận tiền cho đơn: đơn thành CONFIRMED và các giao dịch đang chờ thành PAID. */
    @Transactional
    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân ID: " + bookingId));
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
            throw new IllegalStateException("Đơn này đã bị hủy hoặc hết hạn giữ chỗ nên không thể xác nhận!");
        }
        boolean isDeposit = booking.isDeposit();
        booking.setStatus(isDeposit ? BookingStatus.DEPOSITED : BookingStatus.CONFIRMED);
        booking.setHoldExpiresAt(null);
        if (booking.getDetails() != null) {
            booking.getDetails().forEach(d -> d.setStatus(BookingDetailStatus.BOOKED));
        }
        for (Payment payment : paymentRepository.findByBookingId(bookingId)) {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }
        }
        Booking updated = bookingRepository.save(booking);

        try {
            emailService.sendBookingSuccessEmail(updated);
        } catch (Exception ex) {
            log.error("Không thể gửi email xác nhận đặt sân khi confirm: {}", ex.getMessage());
        }

        return updated;
    }

    /** Người dùng chỉ được hủy đơn của chính mình; nhân viên và admin hủy được mọi đơn. */
    @Transactional
    public BigDecimal cancelBooking(Long bookingId, CustomUserDetails requester) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân!"));
        Long ownerId = null;
        if (booking.getUser() != null) {
            try {
                ownerId = booking.getUser().getId();
            } catch (Exception ignored) {}
        }
        AccessChecks.requireSelfOrStaff(requester, ownerId);
        return cancelBookingInternal(booking);
    }

    /**
     * Tra cứu đơn của khách vãng lai: chỉ khớp chính xác mã đơn (WAY-...) hoặc số điện thoại đầy đủ,
     * không cho tìm theo tên hay một phần số để tránh dò thông tin khách.
     */
    public List<Booking> lookupBookings(String query) {
        String q = query == null ? "" : query.trim();
        if (q.toUpperCase().startsWith("WAY-")) {
            return bookingRepository.findByBookingCode(q.toUpperCase()).map(List::of).orElse(List.of());
        }
        String phone = q.replaceAll("\\s+", "");
        if (!phone.matches("^(0|\\+84)\\d{9,10}$")) {
            throw new IllegalArgumentException("Vui lòng nhập mã đơn (WAY-...) hoặc số điện thoại đầy đủ!");
        }
        return bookingRepository.findByCustomerPhone(phone);
    }

    /** Hủy đơn: đánh dấu hủy đơn và các slot, đồng thời hoàn lại tồn kho cho sản phẩm mua kèm và hoàn tiền vào ví. */
    @Transactional
    public BigDecimal cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân!"));
        return cancelBookingInternal(booking);
    }

    private BigDecimal cancelBookingInternal(Booking booking) {
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return BigDecimal.ZERO; // hủy lần hai không được hoàn kho hay hoàn tiền thêm lần nữa
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        for (BookingDetail d : booking.getDetails()) {
            d.setStatus(BookingDetailStatus.CANCELLED);
        }
        for (BookingItem item : booking.getItems()) {
            if (item.getStatus() != BookingItemStatus.CANCELLED) {
                item.setStatus(BookingItemStatus.CANCELLED);
                if (booking.getBranch() != null && item.getProduct() != null) {
                    productInventoryRepository.addStockAtomic(
                            booking.getBranch().getId(),
                            item.getProduct().getId(),
                            item.getQuantity()
                    );
                }
            }
        }
        bookingRepository.save(booking);
        // Xử lý giao dịch sau khi đã lưu đơn: hoàn tiền vào ví khách hàng và lưu bảng refunds
        return settlePaymentsOfCancelledBooking(booking);
    }

    /**
     * Thu phần tiền còn lại (cho đơn đặt cọc 50%) khi khách nhận sân hoặc thanh toán tiếp.
     */
    @Transactional
    public Payment payRemainingBooking(Long bookingId, PaymentMethod method) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân ID: " + bookingId));
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
            throw new IllegalStateException("Đơn đặt sân này đã bị hủy hoặc hết hạn!");
        }
        BigDecimal remaining = booking.getRemainingAmount();
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Đơn đặt sân này đã thanh toán đủ 100%!");
        }
        PaymentMethod payMethod = method != null ? method : PaymentMethod.CASH;
        if (payMethod == PaymentMethod.WALLET) {
            if (booking.getUser() == null) {
                throw new IllegalStateException("Đơn này không có tài khoản người dùng để trừ ví!");
            }
            if (walletRepository.deductBalanceAtomic(booking.getUser().getId(), remaining) == 0) {
                throw new IllegalStateException("Số dư ví không đủ để thanh toán phần còn lại " + remaining.toPlainString() + " đ!");
            }
        }
        LocalDate date = booking.getBookingDate() != null ? booking.getBookingDate() : LocalDate.now();
        Payment payment = Payment.builder()
                .paymentCode("PAY-REM-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (100000 + new Random().nextInt(900000)))
                .purpose(PaymentPurpose.BOOKING)
                .user(booking.getUser())
                .booking(booking)
                .amount(remaining)
                .method(payMethod)
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .build();
        Payment saved = paymentRepository.save(payment);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setHoldExpiresAt(null);
        String noteMsg = "[DA_THU_DU] Đã thanh toán nốt (" + payMethod.name() + "): " + remaining.toPlainString() + " đ";
        booking.setNotes(booking.getNotes() != null && !booking.getNotes().isBlank()
                ? booking.getNotes() + " | " + noteMsg
                : noteMsg);
        bookingRepository.save(booking);

        try {
            emailService.sendBookingSuccessEmail(booking);
        } catch (Exception ex) {
            log.error("Không thể gửi email xác nhận thu nốt: {}", ex.getMessage());
        }

        log.info("Đã thanh toán nốt phần còn lại {} đ cho đơn {}", remaining, booking.getBookingCode());
        return saved;
    }

    /**
     * Khách hàng thanh toán đơn PENDING bằng ví D2 BadmintonShop sau khi đã tạo đơn.
     */
    @Transactional
    public Payment payPendingBookingWithWallet(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân ID: " + bookingId));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Đơn đặt sân này không ở trạng thái chờ thanh toán!");
        }
        boolean isDeposit = booking.isDeposit();
        BigDecimal payAmount = isDeposit
                ? booking.getTotalPrice().multiply(BigDecimal.valueOf(0.5)).setScale(0, java.math.RoundingMode.HALF_UP)
                : booking.getTotalPrice();

        if (walletRepository.deductBalanceAtomic(user.getId(), payAmount) == 0) {
            throw new IllegalStateException("Số dư ví không đủ để thanh toán " + payAmount.toPlainString() + " đ!");
        }

        booking.setStatus(isDeposit ? BookingStatus.DEPOSITED : BookingStatus.CONFIRMED);
        booking.setHoldExpiresAt(null);
        if (booking.getUser() == null) {
            booking.setUser(user);
        }
        if (booking.getDetails() != null) {
            booking.getDetails().forEach(d -> d.setStatus(BookingDetailStatus.BOOKED));
        }

        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        Payment payment = null;
        for (Payment p : payments) {
            if (p.getStatus() == PaymentStatus.PENDING) {
                p.setStatus(PaymentStatus.PAID);
                p.setPaidAt(LocalDateTime.now());
                p.setMethod(PaymentMethod.WALLET);
                payment = paymentRepository.save(p);
                break;
            }
        }
        if (payment == null) {
            LocalDate date = booking.getBookingDate() != null ? booking.getBookingDate() : LocalDate.now();
            payment = paymentRepository.save(Payment.builder()
                    .paymentCode(generateBookingPaymentCode(date))
                    .purpose(PaymentPurpose.BOOKING)
                    .user(user)
                    .booking(booking)
                    .amount(payAmount)
                    .method(PaymentMethod.WALLET)
                    .status(PaymentStatus.PAID)
                    .paidAt(LocalDateTime.now())
                    .build());
        }

        bookingRepository.save(booking);

        try {
            emailService.sendBookingSuccessEmail(booking);
        } catch (Exception ex) {
            log.error("Không thể gửi email xác nhận đặt sân: {}", ex.getMessage());
        }

        return payment;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Booking> getBookingByCode(String code) {
        return bookingRepository.findByBookingCode(code);
    }
}
