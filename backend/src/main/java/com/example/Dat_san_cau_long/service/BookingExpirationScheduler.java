package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.BookingItem;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingItemStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import com.example.Dat_san_cau_long.repository.ProductInventoryRepository;
import com.example.Dat_san_cau_long.repository.SlotTransferRepository;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/** Các tác vụ chạy nền mỗi 60 giây: hủy đơn hết hạn giữ chỗ, đóng gói hội viên và tin pass sân quá hạn. */
@Service
public class BookingExpirationScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingExpirationScheduler.class);

    private final BookingRepository bookingRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final SlotTransferRepository slotTransferRepository;
    private final PaymentRepository paymentRepository;

    public BookingExpirationScheduler(BookingRepository bookingRepository,
                                      ProductInventoryRepository productInventoryRepository,
                                      UserMembershipRepository userMembershipRepository,
                                      SlotTransferRepository slotTransferRepository,
                                      PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.slotTransferRepository = slotTransferRepository;
        this.paymentRepository = paymentRepository;
    }

    /** Đơn PENDING quá hạn giữ chỗ thì hủy, nhả sân và hoàn lại tồn kho. */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredPendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findByStatusAndHoldExpiresAtBefore(BookingStatus.PENDING, now);

        if (!expiredBookings.isEmpty()) {
            log.info("Phát hiện {} đơn đặt sân PENDING hết hạn giữ chỗ, tiến hành giải phóng...", expiredBookings.size());

            for (Booking booking : expiredBookings) {
                cancelExpiredBooking(booking, now);
                log.info("Đã hủy đơn hết hạn: {}", booking.getBookingCode());
            }
        }
    }

    private void cancelExpiredBooking(Booking booking, LocalDateTime now) {
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(now);
        booking.setCancelReason("Hết thời gian giữ chỗ thanh toán");

        for (BookingDetail detail : booking.getDetails()) {
            detail.setStatus(BookingDetailStatus.CANCELLED);
        }

        for (BookingItem item : booking.getItems()) {
            item.setStatus(BookingItemStatus.CANCELLED);
            if (booking.getBranch() != null && item.getProduct() != null) {
                productInventoryRepository.addStockAtomic(
                        booking.getBranch().getId(),
                        item.getProduct().getId(),
                        item.getQuantity()
                );
            }
        }

        paymentRepository.findByBookingId(booking.getId()).stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .forEach(p -> {
                    p.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(p);
                });

        bookingRepository.save(booking);
    }

    /** Gói hội viên quá ngày kết thúc thì chuyển sang EXPIRED. */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireOldMemberships() {
        LocalDateTime now = LocalDateTime.now();
        int expiredCount = userMembershipRepository.expireOldMembershipsAtomic(now);
        if (expiredCount > 0) {
            log.info("Đã chuyển {} gói hội viên quá hạn sang trạng thái EXPIRED", expiredCount);
        }
    }

    /** Tin pass sân của slot đã qua giờ thì chuyển sang EXPIRED. */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireOldSlotTransfers() {
        LocalDateTime now = LocalDateTime.now();
        int expiredCount = slotTransferRepository.expirePastSlotTransfersAtomic(now.toLocalDate(), now.toLocalTime());
        if (expiredCount > 0) {
            log.info("Đã chuyển {} slot transfer quá hạn sang trạng thái EXPIRED", expiredCount);
        }
    }

    /** Lệnh nạp tiền vào ví PENDING quá 15 phút chưa thanh toán thì tự động chuyển sang FAILED. */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredWalletTopups() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Payment> expired = paymentRepository.findByPurposeAndStatusAndCreatedAtBefore(
                com.example.Dat_san_cau_long.model.enums.PaymentPurpose.WALLET_TOPUP,
                PaymentStatus.PENDING,
                threshold
        );
        for (Payment p : expired) {
            p.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(p);
            log.info("Lệnh nạp ví {} quá 15 phút chưa thanh toán, tự động chuyển sang FAILED", p.getPaymentCode());
        }
    }
}
