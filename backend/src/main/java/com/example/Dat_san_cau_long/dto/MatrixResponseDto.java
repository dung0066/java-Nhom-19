package com.example.Dat_san_cau_long.dto;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.model.TimeSlot;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class MatrixResponseDto {
    private Branch currentBranch;
    private List<Branch> allBranches;
    private LocalDate selectedDate;
    private List<Court> courts;
    private List<TimeSlot> timeSlots;
    // Key: "courtId_timeSlotId" -> StatusInfo (status, passContact, bookingCode, etc.)
    private Map<String, SlotStatusDto> slotStatusMap;

    @Data
    @Builder
    public static class SlotStatusDto {
        private String status; // BOOKED, PASS_WANTED
        private String customerName;
        private String passContact;
        private Double price;
        private Long bookingDetailId;
    }
}
