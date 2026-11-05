package com.example.Dat_san_cau_long.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

/** Kết quả báo giá đơn đặt sân: giá từng slot, giảm giá hội viên và tổng tiền, tính bằng đúng quy tắc lúc tạo đơn. */
@Getter
@Builder
public class BookingQuoteDto {

    private final List<SlotQuote> slots;
    private final BigDecimal courtAmount;
    private final BigDecimal itemsAmount;
    private final BigDecimal originalPrice;
    private final BigDecimal discountAmount;
    private final BigDecimal totalPrice;
    private final BigDecimal depositAmount;
    private final BigDecimal remainingAmount;

    /** Tên và % giảm của gói hội viên đang dùng; null nếu khách chưa đăng nhập hoặc chưa là hội viên. */
    private final String membershipName;
    private final BigDecimal membershipDiscountPercent;

    @Getter
    @Builder
    public static class SlotQuote {
        private final Long courtId;
        private final Long timeSlotId;
        private final String courtName;
        private final String timeSlotLabel;
        private final BigDecimal price;
        private final BigDecimal discount;
        /** false nếu slot đã có người đặt. */
        private final boolean available;
    }
}
