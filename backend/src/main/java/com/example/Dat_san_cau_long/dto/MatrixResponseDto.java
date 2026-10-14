package com.example.Dat_san_cau_long.dto;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.model.TimeSlot;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class MatrixResponseDto {
    private Branch currentBranch;
    private List<Branch> allBranches;
    private LocalDate selectedDate;
    private List<Court> courts;
    private List<TimeSlot> timeSlots;
    private Map<String, SlotStatusDto> slotStatusMap;

    public MatrixResponseDto() {
    }

    public MatrixResponseDto(Branch currentBranch, List<Branch> allBranches, LocalDate selectedDate, List<Court> courts, List<TimeSlot> timeSlots, Map<String, SlotStatusDto> slotStatusMap) {
        this.currentBranch = currentBranch;
        this.allBranches = allBranches;
        this.selectedDate = selectedDate;
        this.courts = courts;
        this.timeSlots = timeSlots;
        this.slotStatusMap = slotStatusMap;
    }

    public static MatrixResponseDtoBuilder builder() {
        return new MatrixResponseDtoBuilder();
    }

    public static class MatrixResponseDtoBuilder {
        private Branch currentBranch;
        private List<Branch> allBranches;
        private LocalDate selectedDate;
        private List<Court> courts;
        private List<TimeSlot> timeSlots;
        private Map<String, SlotStatusDto> slotStatusMap;

        public MatrixResponseDtoBuilder currentBranch(Branch currentBranch) { this.currentBranch = currentBranch; return this; }
        public MatrixResponseDtoBuilder allBranches(List<Branch> allBranches) { this.allBranches = allBranches; return this; }
        public MatrixResponseDtoBuilder selectedDate(LocalDate selectedDate) { this.selectedDate = selectedDate; return this; }
        public MatrixResponseDtoBuilder courts(List<Court> courts) { this.courts = courts; return this; }
        public MatrixResponseDtoBuilder timeSlots(List<TimeSlot> timeSlots) { this.timeSlots = timeSlots; return this; }
        public MatrixResponseDtoBuilder slotStatusMap(Map<String, SlotStatusDto> slotStatusMap) { this.slotStatusMap = slotStatusMap; return this; }

        public MatrixResponseDto build() {
            return new MatrixResponseDto(currentBranch, allBranches, selectedDate, courts, timeSlots, slotStatusMap);
        }
    }

    public Branch getCurrentBranch() { return currentBranch; }
    public void setCurrentBranch(Branch currentBranch) { this.currentBranch = currentBranch; }

    public List<Branch> getAllBranches() { return allBranches; }
    public void setAllBranches(List<Branch> allBranches) { this.allBranches = allBranches; }

    public LocalDate getSelectedDate() { return selectedDate; }
    public void setSelectedDate(LocalDate selectedDate) { this.selectedDate = selectedDate; }

    public List<Court> getCourts() { return courts; }
    public void setCourts(List<Court> courts) { this.courts = courts; }

    public List<TimeSlot> getTimeSlots() { return timeSlots; }
    public void setTimeSlots(List<TimeSlot> timeSlots) { this.timeSlots = timeSlots; }

    public Map<String, SlotStatusDto> getSlotStatusMap() { return slotStatusMap; }
    public void setSlotStatusMap(Map<String, SlotStatusDto> slotStatusMap) { this.slotStatusMap = slotStatusMap; }

    public static class SlotStatusDto {
        private String status;
        private String customerName;
        private String passContact;
        private Double price;
        private Long bookingDetailId;

        public SlotStatusDto() {
        }

        public SlotStatusDto(String status, String customerName, String passContact, Double price, Long bookingDetailId) {
            this.status = status;
            this.customerName = customerName;
            this.passContact = passContact;
            this.price = price;
            this.bookingDetailId = bookingDetailId;
        }

        public static SlotStatusDtoBuilder builder() {
            return new SlotStatusDtoBuilder();
        }

        public static class SlotStatusDtoBuilder {
            private String status;
            private String customerName;
            private String passContact;
            private Double price;
            private Long bookingDetailId;

            public SlotStatusDtoBuilder status(String status) { this.status = status; return this; }
            public SlotStatusDtoBuilder customerName(String customerName) { this.customerName = customerName; return this; }
            public SlotStatusDtoBuilder passContact(String passContact) { this.passContact = passContact; return this; }
            public SlotStatusDtoBuilder price(Double price) { this.price = price; return this; }
            public SlotStatusDtoBuilder bookingDetailId(Long bookingDetailId) { this.bookingDetailId = bookingDetailId; return this; }

            public SlotStatusDto build() {
                return new SlotStatusDto(status, customerName, passContact, price, bookingDetailId);
            }
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getPassContact() { return passContact; }
        public void setPassContact(String passContact) { this.passContact = passContact; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Long getBookingDetailId() { return bookingDetailId; }
        public void setBookingDetailId(Long bookingDetailId) { this.bookingDetailId = bookingDetailId; }
    }
}
