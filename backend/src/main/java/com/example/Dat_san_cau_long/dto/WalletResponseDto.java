package com.example.Dat_san_cau_long.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletResponseDto {
    private Long userId;
    private String username;
    private BigDecimal balance;
    private LocalDateTime updatedAt;
}
