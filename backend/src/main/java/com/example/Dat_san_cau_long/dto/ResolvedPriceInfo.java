package com.example.Dat_san_cau_long.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolvedPriceInfo {
    private BigDecimal price;
    private boolean peak;
    private BigDecimal standardPrice;
    private BigDecimal peakPrice;
    private String ruleDescription;
}
