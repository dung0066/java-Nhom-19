package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.BookingItem;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingItemStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.ProductInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingExpirationScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingExpirationScheduler.class);

    private final BookingRepository bookingRepository;
    private final ProductInventoryRepository productInventoryRepository;

    public BookingExpirationScheduler(BookingRepository bookingRepository,
                                      ProductInventoryRepository productInventoryRepository) {
        this.bookingRepository = bookingRepository;
        this.productInventoryRepository = productInventoryRepository;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredPendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findByStatusAndHoldExpiresAtBefore(BookingStatus.PENDING, now);

        if (!expiredBookings.isEmpty()) {
            log.info("Phát hiện {} đơn đặt sân PENDING hết hạn giữ chỗ, tiến hành giải phóng...", expiredBookings.size());

            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setCancelledAt(now);
                booking.setCancelReason("Hết thời gian giữ chỗ thanh toán");

                for (BookingDetail detail : booking.getDetails()) {
                    detail.setStatus(BookingDetailStatus.CANCELLED);
                }

                for (BookingItem item : booking.getItems()) {
                    item.setStatus(BookingItemStatus.CANCELLED);
                    // Hoàn trả tồn kho
                    if (booking.getBranch() != null && item.getProduct() != null) {
                        productInventoryRepository.addStockAtomic(
                                booking.getBranch().getId(),
                                item.getProduct().getId(),
                                item.getQuantity()
                        );
                    }
                }

                bookingRepository.save(booking);
                log.info("Đã hủy đơn hết hạn: {}", booking.getBookingCode());
            }
        }
    }
}
