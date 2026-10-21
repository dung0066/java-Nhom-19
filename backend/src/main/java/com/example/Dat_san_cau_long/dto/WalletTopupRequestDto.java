package com.example.Dat_san_cau_long.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTopupRequestDto {

    @NotNull(message = "Số tiền nạp không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền nạp tối thiểu là 1.000 VNĐ")
    private BigDecimal amount;

    private String paymentMethod; // VIETQR, BANK_TRANSFER, etc.

    private String notes;
}
