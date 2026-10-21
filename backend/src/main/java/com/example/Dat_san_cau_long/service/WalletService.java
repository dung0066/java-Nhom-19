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

        PaymentMethod method = PaymentMethod.VIETQR;
        if (req.getPaymentMethod() != null) {
            try {
                method = PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                method = PaymentMethod.VIETQR;
            }
        }

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

    @Transactional
    public Payment confirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giao dịch thanh toán ID: " + paymentId));

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Giao dịch thanh toán này đã được xác nhận trước đó!");
        }

        LocalDateTime now = LocalDateTime.now();
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(now);

        if (payment.getPurpose() == PaymentPurpose.WALLET_TOPUP) {
            walletRepository.addBalanceAtomic(payment.getUser().getId(), payment.getAmount());
            log.info("Admin đã xác nhận nạp tiền: cộng {} vào ví user {}", payment.getAmount(), payment.getUser().getId());
        } else if (payment.getPurpose() == PaymentPurpose.MEMBERSHIP) {
            if (payment.getUserMembership() != null) {
                payment.getUserMembership().setStatus(MembershipStatus.ACTIVE);
                userMembershipRepository.save(payment.getUserMembership());
                log.info("Admin đã xác nhận thanh toán gói hội viên: kích hoạt membership {}", payment.getUserMembership().getSubscriptionCode());
            }
        } else if (payment.getPurpose() == PaymentPurpose.BOOKING) {
            if (payment.getBooking() != null) {
                payment.getBooking().setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(payment.getBooking());
                log.info("Admin đã xác nhận thanh toán đơn đặt sân: chuyển đơn {} sang CONFIRMED", payment.getBooking().getBookingCode());
            }
        }

        return paymentRepository.save(payment);
    }
}
