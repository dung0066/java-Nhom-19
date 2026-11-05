package com.example.Dat_san_cau_long.model.enums;

public enum PaymentMethod {
    VIETQR,
    BANK_TRANSFER,
    CASH,
    WALLET,
    SYSTEM;

    /** Đổi chuỗi client gửi lên thành enum. Chuỗi rỗng hoặc không hợp lệ thì mặc định là VIETQR. */
    public static PaymentMethod fromStringOrDefault(String value) {
        if (value == null) {
            return VIETQR;
        }
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return VIETQR;
        }
    }
}
