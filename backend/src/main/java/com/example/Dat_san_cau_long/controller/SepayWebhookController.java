package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.payment.SepayWebhookRequest;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentMethod;
import com.example.Dat_san_cau_long.model.enums.PaymentPurpose;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Controller tiếp nhận Webhook thanh toán tự động từ SePay.
 * Endpoint: POST /api/payment/sepay-webhook
 */
@RestController
@RequestMapping("/api/payment")
public class SepayWebhookController {

    private static final Logger log = LoggerFactory.getLogger(SepayWebhookController.class);

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final com.example.Dat_san_cau_long.service.EmailService emailService;

    @Value("${app.sepay.api-key:}")
    private String sepayApiKey;

    public SepayWebhookController(BookingRepository bookingRepository,
                                  PaymentRepository paymentRepository,
                                  com.example.Dat_san_cau_long.service.EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.emailService = emailService;
    }

    @PostMapping("/sepay-webhook")
    @Transactional
    public ResponseEntity<?> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SepayWebhookRequest payload) {

        log.info("[SePay Webhook] Nhận dữ liệu giao dịch: id={}, gateway={}, amount={}, content={}",
                payload.getId(), payload.getGateway(), payload.getTransferAmount(), payload.getContent());

        // 1. Kiểm tra API Key nếu có cấu hình bảo mật trong app
        if (sepayApiKey != null && !sepayApiKey.isBlank()) {
            String expected = "Apikey " + sepayApiKey.trim();
            if (authHeader == null || (!authHeader.equals(expected) && !authHeader.contains(sepayApiKey.trim()))) {
                log.warn("[SePay Webhook] Từ chối: Sai Authorization token");
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
            }
        }

        // 2. Chỉ xử lý tiền vào (transferType = "in")
        if (payload.getTransferType() != null && !"in".equalsIgnoreCase(payload.getTransferType())) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua giao dịch tiền ra"));
        }

        String rawContent = payload.getContent() != null ? payload.getContent() : "";
        String normalizedContent = rawContent.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        BigDecimal transferAmount = payload.getTransferAmount() != null ? payload.getTransferAmount() : BigDecimal.ZERO;

        // 3. Tìm đơn đặt sân đang chờ thanh toán hoặc đã cọc chờ thanh toán nốt
        List<Booking> pendingBookings = bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.PENDING);
        List<Booking> depositedBookings = bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.DEPOSITED);

        Booking matchedBooking = null;
        boolean isRemainingPayment = false;

        for (Booking booking : pendingBookings) {
            String code = booking.getBookingCode();
            if (code != null) {
                String normalizedCode = code.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
                if (!normalizedCode.isEmpty() && normalizedContent.contains(normalizedCode)) {
                    matchedBooking = booking;
                    isRemainingPayment = false;
                    break;
                }
            }
        }

        if (matchedBooking == null) {
            for (Booking booking : depositedBookings) {
                String code = booking.getBookingCode();
                if (code != null) {
                    String normalizedCode = code.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
                    if (!normalizedCode.isEmpty() && normalizedContent.contains(normalizedCode)) {
                        matchedBooking = booking;
                        isRemainingPayment = true;
                        break;
                    }
                }
            }
        }

        // 4. Nếu tìm thấy đơn đặt sân
        if (matchedBooking != null) {
            if (!isRemainingPayment) {
                // Xử lý đơn PENDING (thanh toán cọc 50% hoặc thanh toán đủ 100%)
                boolean isDeposit = matchedBooking.isDeposit();
                BookingStatus targetStatus = isDeposit ? BookingStatus.DEPOSITED : BookingStatus.CONFIRMED;
                log.info("[SePay Webhook] Tìm thấy đơn PENDING phù hợp: ID={}, Code={}, IsDeposit={}, TargetStatus={}",
                        matchedBooking.getId(), matchedBooking.getBookingCode(), isDeposit, targetStatus);

                matchedBooking.setStatus(targetStatus);
                matchedBooking.setHoldExpiresAt(null);

                if (matchedBooking.getDetails() != null) {
                    for (BookingDetail detail : matchedBooking.getDetails()) {
                        detail.setStatus(BookingDetailStatus.BOOKED);
                    }
                }

                // Cập nhật Payment thành PAID
                List<Payment> payments = paymentRepository.findByBookingId(matchedBooking.getId());
                for (Payment p : payments) {
                    if (p.getStatus() == PaymentStatus.PENDING) {
                        p.setStatus(PaymentStatus.PAID);
                        p.setPaidAt(LocalDateTime.now());
                        p.setProviderTxnCode(payload.getReferenceCode() != null ? payload.getReferenceCode() : String.valueOf(payload.getId()));
                        paymentRepository.save(p);
                    }
                }

                bookingRepository.save(matchedBooking);

                try {
                    emailService.sendBookingSuccessEmail(matchedBooking);
                } catch (Exception ex) {
                    log.error("[SePay Webhook] Lỗi khi gửi email xác nhận đặt sân: {}", ex.getMessage());
                }

                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("message", "Xác nhận thanh toán tự động thành công (" + (isDeposit ? "Cọc 50%" : "Đủ 100%") + ") cho đơn " + matchedBooking.getBookingCode());
                res.put("bookingCode", matchedBooking.getBookingCode());
                res.put("status", matchedBooking.getStatus().name());
                return ResponseEntity.ok(res);
            } else {
                // Xử lý đơn DEPOSITED (khách thanh toán nốt 50% còn lại qua VietQR)
                log.info("[SePay Webhook] Thu nốt phần còn lại qua VietQR cho đơn DEPOSITED: ID={}, Code={}, Nhận={}",
                        matchedBooking.getId(), matchedBooking.getBookingCode(), transferAmount);

                BigDecimal remaining = matchedBooking.getRemainingAmount();
                BigDecimal payAmount = (transferAmount != null && transferAmount.compareTo(BigDecimal.ZERO) > 0)
                        ? transferAmount
                        : remaining;

                LocalDate date = matchedBooking.getBookingDate() != null ? matchedBooking.getBookingDate() : LocalDate.now();
                Payment remPayment = Payment.builder()
                        .paymentCode("PAY-REM-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (100000 + new Random().nextInt(900000)))
                        .purpose(PaymentPurpose.BOOKING)
                        .user(matchedBooking.getUser())
                        .booking(matchedBooking)
                        .amount(payAmount)
                        .method(PaymentMethod.VIETQR)
                        .status(PaymentStatus.PAID)
                        .paidAt(LocalDateTime.now())
                        .providerTxnCode(payload.getReferenceCode() != null ? payload.getReferenceCode() : String.valueOf(payload.getId()))
                        .build();
                paymentRepository.save(remPayment);

                matchedBooking.setStatus(BookingStatus.CONFIRMED);
                matchedBooking.setHoldExpiresAt(null);
                String noteMsg = "[DA_THU_DU] Đã thanh toán nốt qua VietQR: " + payAmount.toPlainString() + " đ";
                matchedBooking.setNotes(matchedBooking.getNotes() != null && !matchedBooking.getNotes().isBlank()
                        ? matchedBooking.getNotes() + " | " + noteMsg
                        : noteMsg);

                bookingRepository.save(matchedBooking);

                try {
                    emailService.sendBookingSuccessEmail(matchedBooking);
                } catch (Exception ex) {
                    log.error("[SePay Webhook] Lỗi khi gửi email xác nhận thanh toán đủ: {}", ex.getMessage());
                }

                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("message", "Xác nhận thu nốt số tiền còn lại thành công cho đơn " + matchedBooking.getBookingCode());
                res.put("bookingCode", matchedBooking.getBookingCode());
                res.put("status", matchedBooking.getStatus().name());
                return ResponseEntity.ok(res);
            }
        }

        // 5. Nếu không khớp đơn đặt sân nào
        log.warn("[SePay Webhook] Không tìm thấy đơn PENDING hoặc DEPOSITED nào khớp với nội dung: {}", rawContent);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã nhận webhook nhưng không tìm thấy đơn PENDING hoặc DEPOSITED khớp mã"
        ));
    }
}

