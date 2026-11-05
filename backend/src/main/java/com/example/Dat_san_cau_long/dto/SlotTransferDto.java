package com.example.Dat_san_cau_long.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotTransferDto {
    private Long id;
    private Long bookingDetailId;
    private Long branchId;
    private String branchName;
    private String courtName;
    private LocalDate slotDate;
    private Long timeSlotId;
    private String timeSlotDisplay;
    private BigDecimal originalPrice;
    private BigDecimal passPrice;
    private String contact;
    private String sellerName;
    private String status;
    private LocalDateTime createdAt;
}
