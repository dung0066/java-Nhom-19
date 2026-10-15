package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_memberships")
public class UserMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String subscriptionCode; // VD: SUB-202610-GOLD-8921

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "package_id", nullable = false)
    private MembershipPackage membershipPackage;

    @Column(nullable = false)
    private Double pricePaid;

    private Double discountApplied = 0.0;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(length = 50)
    private String paymentMethod = "VIETQR"; // VIETQR, MOMO, CASH, WALLET

    @Column(length = 30)
    private String paymentStatus = "PAID"; // PENDING, PAID, CANCELLED

    @Column(length = 100)
    private String transactionCode;

    @Column(length = 500)
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    public UserMembership() {
    }

    public UserMembership(Long id, String subscriptionCode, User user, MembershipPackage membershipPackage, Double pricePaid, Double discountApplied, LocalDateTime startDate, LocalDateTime endDate, String paymentMethod, String paymentStatus, String transactionCode, String notes, LocalDateTime createdAt) {
        this.id = id;
        this.subscriptionCode = subscriptionCode;
        this.user = user;
        this.membershipPackage = membershipPackage;
        this.pricePaid = pricePaid;
        this.discountApplied = discountApplied != null ? discountApplied : 0.0;
        this.startDate = startDate;
        this.endDate = endDate;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "VIETQR";
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PAID";
        this.transactionCode = transactionCode;
        this.notes = notes;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public static UserMembershipBuilder builder() {
        return new UserMembershipBuilder();
    }

    public static class UserMembershipBuilder {
        private Long id;
        private String subscriptionCode;
        private User user;
        private MembershipPackage membershipPackage;
        private Double pricePaid;
        private Double discountApplied = 0.0;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String paymentMethod = "VIETQR";
        private String paymentStatus = "PAID";
        private String transactionCode;
        private String notes;
        private LocalDateTime createdAt = LocalDateTime.now();

        public UserMembershipBuilder id(Long id) { this.id = id; return this; }
        public UserMembershipBuilder subscriptionCode(String subscriptionCode) { this.subscriptionCode = subscriptionCode; return this; }
        public UserMembershipBuilder user(User user) { this.user = user; return this; }
        public UserMembershipBuilder membershipPackage(MembershipPackage membershipPackage) { this.membershipPackage = membershipPackage; return this; }
        public UserMembershipBuilder pricePaid(Double pricePaid) { this.pricePaid = pricePaid; return this; }
        public UserMembershipBuilder discountApplied(Double discountApplied) { this.discountApplied = discountApplied; return this; }
        public UserMembershipBuilder startDate(LocalDateTime startDate) { this.startDate = startDate; return this; }
        public UserMembershipBuilder endDate(LocalDateTime endDate) { this.endDate = endDate; return this; }
        public UserMembershipBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public UserMembershipBuilder paymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public UserMembershipBuilder transactionCode(String transactionCode) { this.transactionCode = transactionCode; return this; }
        public UserMembershipBuilder notes(String notes) { this.notes = notes; return this; }
        public UserMembershipBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public UserMembership build() {
            return new UserMembership(id, subscriptionCode, user, membershipPackage, pricePaid, discountApplied, startDate, endDate, paymentMethod, paymentStatus, transactionCode, notes, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubscriptionCode() { return subscriptionCode; }
    public void setSubscriptionCode(String subscriptionCode) { this.subscriptionCode = subscriptionCode; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public MembershipPackage getMembershipPackage() { return membershipPackage; }
    public void setMembershipPackage(MembershipPackage membershipPackage) { this.membershipPackage = membershipPackage; }

    public Double getPricePaid() { return pricePaid; }
    public void setPricePaid(Double pricePaid) { this.pricePaid = pricePaid; }

    public Double getDiscountApplied() { return discountApplied; }
    public void setDiscountApplied(Double discountApplied) { this.discountApplied = discountApplied; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionCode() { return transactionCode; }
    public void setTransactionCode(String transactionCode) { this.transactionCode = transactionCode; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
