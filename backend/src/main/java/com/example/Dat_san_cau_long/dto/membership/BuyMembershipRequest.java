package com.example.Dat_san_cau_long.dto.membership;

public class BuyMembershipRequest {
    private Long userId;
    private Long packageId;
    private String paymentMethod; // VIETQR, MOMO, CASH, WALLET
    private String notes;

    public BuyMembershipRequest() {
    }

    public BuyMembershipRequest(Long userId, Long packageId, String paymentMethod, String notes) {
        this.userId = userId;
        this.packageId = packageId;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getPackageId() { return packageId; }
    public void setPackageId(Long packageId) { this.packageId = packageId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
