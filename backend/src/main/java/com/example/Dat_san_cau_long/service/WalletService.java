package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.WalletResponseDto;
import com.example.Dat_san_cau_long.dto.WalletTopupRequestDto;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.Wallet;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentMethod;
import com.example.Dat_san_cau_long.model.enums.PaymentPurpose;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

/**
 * Ví điện tử nội bộ và xác nhận thanh toán.
 * Khách tạo yêu cầu nạp tiền (trạng thái PENDING), admin xác nhận thì mới cộng tiền vào ví.
 */
@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final BookingRepository bookingRepository;

    public WalletService(WalletRepository walletRepository,
                         PaymentRepository paymentRepository,
                         UserRepository userRepository,
                         UserMembershipRepository userMembershipRepository,
                         BookingRepository bookingRepository) {
        this.walletRepository = walletRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.bookingRepository = bookingRepository;
    }

    public WalletResponseDto getWalletBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng!"));

        Wallet wallet = walletRepository.findById(userId)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .userId(user.getId())
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });

        return WalletResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .balance(wallet.getBalance())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    @Transactional
    public Payment createTopupPayment(Long userId, WalletTopupRequestDto req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng!"));

        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.valueOf(1000)) < 0) {
            throw new IllegalArgumentException("Số tiền nạp tối thiểu là 1.000 VNĐ!");
        }

        PaymentMethod method = PaymentMethod.fromStringOrDefault(req.getPaymentMethod());

        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String payCode = "PAY-TOPUP-" + dateStr + "-" + (1000 + new Random().nextInt(9000));

        Payment payment = Payment.builder()
                .paymentCode(payCode)
                .purpose(PaymentPurpose.WALLET_TOPUP)
                .user(user)
                .amount(req.getAmount())
                .method(method)
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);
        log.info("Đã tạo yêu cầu nạp ví {} cho user {} với số tiền {}", payCode, user.getUsername(), req.getAmount());

        return payment;
    }

    public List<Payment> getWalletPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Payment getPaymentByCodeForUser(Long userId, String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch: " + paymentCode));
        if (payment.getUser() == null || !payment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền truy cập giao dịch này!");
        }
        return payment;
    }

    /**
     * Tự động cộng tiền vào ví khi nạp tiền thành công (qua SePay Webhook hoặc Admin xác nhận).
     * Đảm bảo tính Idempotent và chống cộng tiền 2 lần (kể cả khi chạy đồng thời nhiều luồng).
     */
    @Transactional
    public Payment creditTopup(Payment payment, String providerTxnCode) {
        if (payment.getPurpose() != PaymentPurpose.WALLET_TOPUP) {
            throw new IllegalArgumentException("Giao dịch không phải là nạp tiền vào ví!");
        }

        // [DŨNG NOTE] Kiểm tra nếu đã PAID thì chặn ngay, không bao giờ cộng tiền 2 lần
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Giao dịch thanh toán này đã được xác nhận trước đó!");
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Giao dịch này không ở trạng thái PENDING!");
        }

        LocalDateTime now = LocalDateTime.now();
        // [DŨNG NOTE] Chạy câu lệnh UPDATE có điều kiện ở DB: chỉ update khi status='PENDING' (Atomic chống race condition)
        int rowsUpdated = paymentRepository.markPaidIfPending(payment.getId(), now, providerTxnCode);
        if (rowsUpdated == 1) {
            // [DŨNG NOTE] Cộng tiền ví trực tiếp trong DB bằng câu lệnh Atomic UPDATE wallets SET balance = balance + :amount
            walletRepository.addBalanceAtomic(payment.getUser().getId(), payment.getAmount());
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(now);
            payment.setProviderTxnCode(providerTxnCode);
            log.info("Xác nhận nạp ví thành công: Cộng {} vào ví user {} (Payment ID: {}, Txn: {})",
                    payment.getAmount(), payment.getUser().getId(), payment.getId(), providerTxnCode);
            return payment;
        } else {
            // [DŨNG NOTE] Nếu luồng khác vừa chạy trước và rowsUpdated=0 -> Chặn đứng ngay
            log.warn("Bỏ qua nạp ví: Payment ID {} đã được luồng khác xử lý trước đó", payment.getId());
            throw new IllegalStateException("Giao dịch thanh toán này đã được xác nhận trước đó!");
        }
    }

    /**
     * Admin xác nhận đã nhận tiền. Tùy mục đích của giao dịch:
     * nạp ví thì cộng tiền, mua hội viên thì kích hoạt gói, đặt sân thì chuyển đơn sang CONFIRMED.
     */
    @Transactional
    public Payment confirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán ID: " + paymentId));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Giao dịch thanh toán này đã được xác nhận trước đó!");
        }
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Giao dịch này đã bị hủy hoặc hoàn tiền nên không thể xác nhận!");
        }

        if (payment.getPurpose() == PaymentPurpose.WALLET_TOPUP) {
            return creditTopup(payment, "MANUAL_ADMIN_" + System.currentTimeMillis());
        }

        LocalDateTime now = LocalDateTime.now();
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(now);

        if (payment.getPurpose() == PaymentPurpose.MEMBERSHIP) {
            if (payment.getUserMembership() != null) {
                payment.getUserMembership().setStatus(MembershipStatus.ACTIVE);
                userMembershipRepository.save(payment.getUserMembership());
                log.info("Admin đã xác nhận thanh toán gói hội viên: kích hoạt membership {}", payment.getUserMembership().getSubscriptionCode());
            }
        } else if (payment.getPurpose() == PaymentPurpose.BOOKING) {
            if (payment.getBooking() != null) {
                if (payment.getBooking().getStatus() == BookingStatus.CANCELLED
                        || payment.getBooking().getStatus() == BookingStatus.EXPIRED) {
                    throw new IllegalStateException("Đơn đặt sân này đã bị hủy hoặc hết hạn giữ chỗ nên không thể xác nhận thanh toán!");
                }
                payment.getBooking().setStatus(BookingStatus.CONFIRMED);
                payment.getBooking().setHoldExpiresAt(null);
                bookingRepository.save(payment.getBooking());
                log.info("Admin đã xác nhận thanh toán đơn đặt sân: chuyển đơn {} sang CONFIRMED", payment.getBooking().getBookingCode());
            }
        }

        return paymentRepository.save(payment);
    }
}
