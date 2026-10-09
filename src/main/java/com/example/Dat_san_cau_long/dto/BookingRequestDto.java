package com.example.Dat_san_cau_long.dto;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequestDto {
    private String branchCode;
    private String bookingDate; // YYYY-MM-DD
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String paymentMethod;
    private String notes;
    private List<SlotItemDto> selectedSlots;

    @Data
    public static class SlotItemDto {
        private Long courtId;
        private Long timeSlotId;
    }
}
