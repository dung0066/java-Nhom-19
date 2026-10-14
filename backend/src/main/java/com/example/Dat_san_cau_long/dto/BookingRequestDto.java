package com.example.Dat_san_cau_long.dto;

import java.util.List;

public class BookingRequestDto {
    private Long userId; // Tùy chọn: ID user đã đăng nhập
    private String branchCode;
    private String bookingDate; // YYYY-MM-DD
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String paymentMethod;
    private String notes;
    private List<SlotItemDto> selectedSlots;

    public BookingRequestDto() {
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<SlotItemDto> getSelectedSlots() { return selectedSlots; }
    public void setSelectedSlots(List<SlotItemDto> selectedSlots) { this.selectedSlots = selectedSlots; }

    public static class SlotItemDto {
        private Long courtId;
        private Long timeSlotId;

        public SlotItemDto() {
        }

        public Long getCourtId() { return courtId; }
        public void setCourtId(Long courtId) { this.courtId = courtId; }

        public Long getTimeSlotId() { return timeSlotId; }
        public void setTimeSlotId(Long timeSlotId) { this.timeSlotId = timeSlotId; }
    }
}
