package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.payment.SepayWebhookRequest;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentPurpose;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import com.example.Dat_san_cau_long.service.EmailService;
import com.example.Dat_san_cau_long.service.WalletService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Controller tiếp nhận Webhook thanh toán tự động từ SePay.
 * Endpoint: POST /api/payment/sepay-webhook
 * Hỗ trợ tự động:
 * 1. Nạp tiền vào ví điện tử (khớp mã PAY-TOPUP-yyyyMMdd-XXXX)
 * 2. Xác nhận đơn đặt sân cầu lông (khớp mã bookingCode)
 */
@RestController
@RequestMapping("/api/payment")
public class SepayWebhookController {

    private static final Logger log = LoggerFactory.getLogger(SepayWebhookController.class);

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final WalletService walletService;

    @Value("${app.sepay.api-key:}")
    private String sepayApiKey;

    public SepayWebhookController(BookingRepository bookingRepository,
                                  PaymentRepository paymentRepository,
                                  EmailService emailService,
                                  WalletService walletService) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.emailService = emailService;
        this.walletService = walletService;
    }

    @PostMapping("/sepay-webhook")
    @Transactional
    public ResponseEntity<?> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SepayWebhookRequest payload) {

        log.info("[SePay Webhook] Nhận dữ liệu giao dịch: id={}, gateway={}, amount={}, content={}",
                payload.getId(), payload.getGateway(), payload.getTransferAmount(), payload.getContent());

        // 1. Chỉ xử lý tiền vào (transferType = "in")
        if (payload.getTransferType() != null && !"in".equalsIgnoreCase(payload.getTransferType())) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua giao dịch tiền ra"));
        }

        String rawContent = payload.getContent() != null ? payload.getContent() : "";
        String normalizedContent = rawContent.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
        BigDecimal transferAmount = payload.getTransferAmount() != null ? payload.getTransferAmount() : BigDecimal.ZERO;

        // 2. Kiểm tra bảo mật API Key
        String expectedAuth = (sepayApiKey != null && !sepayApiKey.isBlank()) ? "Apikey " + sepayApiKey.trim() : null;

        Pattern walletPattern = Pattern.compile("PAYTOPUP(\\d{8})(\\d{4})");
        Matcher walletMatcher = walletPattern.matcher(normalizedContent);
        boolean isWalletTopup = walletMatcher.find();

        if (isWalletTopup) {
            // Luồng nạp ví: Bắt buộc cấu hình API key và khớp chính xác tuyệt đối
            if (expectedAuth == null) {
                log.warn("[SePay Webhook] Từ chối nạp ví: app.sepay.api-key chưa được cấu hình");
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Sepay API Key chưa được cấu hình"));
            }
            if (authHeader == null || !expectedAuth.equals(authHeader.trim())) {
                log.warn("[SePay Webhook] Từ chối nạp ví: Sai hoặc thiếu Authorization token");
                return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
            }
        } else {
            // Luồng đặt sân: Nếu có API key cấu hình thì phải khớp chính xác (loại bỏ contains)
            if (expectedAuth != null) {
                if (authHeader == null || !expectedAuth.equals(authHeader.trim())) {
                    log.warn("[SePay Webhook] Từ chối đặt sân: Sai Authorization token");
                    return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
                }
            }
        }

        // 3. XỬ LÝ NẠP VÍ TỰ ĐỘNG
        if (isWalletTopup) {
            String extractedDate = walletMatcher.group(1);
            String extractedSeq = walletMatcher.group(2);
            String paymentCode = "PAY-TOPUP-" + extractedDate + "-" + extractedSeq;
            log.info("[SePay Webhook] Nhận diện mã nạp ví: {}", paymentCode);

            Optional<Payment> optPayment = paymentRepository.findByPaymentCode(paymentCode);
            if (optPayment.isPresent()) {
                Payment payment = optPayment.get();
                if (payment.getPurpose() == PaymentPurpose.WALLET_TOPUP) {
                    String providerTxnCode = payload.getReferenceCode() != null && !payload.getReferenceCode().isBlank()
                            ? payload.getReferenceCode().trim()
                            : String.valueOf(payload.getId());

                    // Chống lặp giao dịch (Idempotency)
                    if (payment.getStatus() == PaymentStatus.PAID) {
                        log.info("[SePay Webhook] Giao dịch nạp ví {} đã ở trạng thái PAID trước đó", paymentCode);
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "Giao dịch nạp ví đã được xử lý thành công trước đó",
                                "paymentCode", paymentCode
                        ));
                    }

                    if (paymentRepository.existsByProviderTxnCode(providerTxnCode)) {
                        log.info("[SePay Webhook] Giao dịch với providerTxnCode={} đã tồn tại", providerTxnCode);
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "Giao dịch đã được ghi nhận trước đó",
                                "paymentCode", paymentCode
                        ));
                    }

                    // Kiểm tra số tiền chuyển khoản
                    if (transferAmount.compareTo(payment.getAmount()) != 0) {
                        log.warn("[SePay Webhook] Sai lệch số tiền nạp ví {}: Cần={}, Thực nhận={}",
                                paymentCode, payment.getAmount(), transferAmount);
                        return ResponseEntity.ok(Map.of(
                                "success", false,
                                "message", "Số tiền chuyển khoản không khớp với số tiền của lệnh nạp ví (Cần: " + payment.getAmount() + ", Nhận: " + transferAmount + ")"
                        ));
                    }

                    // Tự động cộng tiền vào ví người dùng
                    try {
                        Payment updated = walletService.creditTopup(payment, providerTxnCode);
                        log.info("[SePay Webhook] Tự động cộng {} VNĐ vào ví user {} thành công!",
                                updated.getAmount(), updated.getUser().getId());
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "Nạp tiền vào ví thành công!",
                                "paymentCode", updated.getPaymentCode(),
                                "amount", updated.getAmount()
                        ));
                    } catch (IllegalStateException ex) {
                        log.warn("[SePay Webhook] Lệnh nạp ví {} đã được xác nhận trước đó: {}", paymentCode, ex.getMessage());
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "Giao dịch đã được xác nhận trước đó",
                                "paymentCode", paymentCode
                        ));
                    }
                }
            } else {
                log.warn("[SePay Webhook] Không tìm thấy Payment với mã: {}", paymentCode);
            }
        }

        // 4. XỬ LÝ ĐẶT SÂN TỰ ĐỘNG
        List<Booking> pendingBookings = bookingRepository.findByStatusOrderByCreatedAtDesc(BookingStatus.PENDING);
        Booking matchedBooking = null;

        for (Booking booking : pendingBookings) {
            String code = booking.getBookingCode();
            if (code != null) {
                String normalizedCode = code.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
                if (!normalizedCode.isEmpty() && normalizedContent.contains(normalizedCode)) {
                    matchedBooking = booking;
                    break;
                }
            }
        }

        // Nếu tìm thấy đơn đặt sân
        if (matchedBooking != null) {
            log.info("[SePay Webhook] Tìm thấy đơn đặt sân phù hợp: ID={}, Code={}, Cần thanh toán={}",
                    matchedBooking.getId(), matchedBooking.getBookingCode(), matchedBooking.getTotalPrice());

            // Cập nhật trạng thái đơn thành ĐÃ XÁC NHẬN (CONFIRMED)
            matchedBooking.setStatus(BookingStatus.CONFIRMED);
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

            // Gửi email xác nhận chi tiết đặt sân kèm giờ chơi, sân số mấy tới khách hàng
            try {
                emailService.sendBookingSuccessEmail(matchedBooking);
            } catch (Exception ex) {
                log.error("[SePay Webhook] Lỗi khi gửi email xác nhận đặt sân: {}", ex.getMessage());
            }

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Xác nhận thanh toán tự động thành công cho đơn " + matchedBooking.getBookingCode());
            res.put("bookingCode", matchedBooking.getBookingCode());
            return ResponseEntity.ok(res);
        }

        // 5. Nếu không khớp bất kỳ đơn nào
        log.warn("[SePay Webhook] Không tìm thấy đơn PENDING nào khớp với nội dung: {}", rawContent);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã nhận webhook nhưng không tìm thấy đơn PENDING khớp mã"
        ));
    }
}

