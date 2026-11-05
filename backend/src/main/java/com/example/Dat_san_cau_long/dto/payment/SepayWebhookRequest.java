package com.example.Dat_san_cau_long.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Cấu trúc dữ liệu Webhook từ hệ thống thanh toán tự động SePay.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SepayWebhookRequest {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    private String code;
    private String content;
    private String transferType;
    private String description;
    private BigDecimal transferAmount;
    private String referenceCode;
    private BigDecimal accumulated;
}

