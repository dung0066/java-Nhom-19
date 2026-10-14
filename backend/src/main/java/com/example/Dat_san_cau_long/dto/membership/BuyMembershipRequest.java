package com.example.Dat_san_cau_long.dto.membership;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyMembershipRequest {
    private Long userId;
    private Long packageId;
    private String paymentMethod; // VIETQR, MOMO, CASH, WALLET
    private String notes;
}
