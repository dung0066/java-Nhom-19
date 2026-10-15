package com.example.Dat_san_cau_long.dto.auth;

import com.example.Dat_san_cau_long.model.MembershipPackage;
import java.time.LocalDateTime;

public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    
    // User Profile
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private Double walletBalance;
    private Integer loyaltyPoints;
    private Double totalSpending;
    private String avatar;
    
    // Membership Status
    private boolean isMember;
    private MembershipPackage membershipPackage;
    private LocalDateTime membershipExpiresAt;
    private Double discountPercent;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String message, String token, Long id, String username, String fullName, String email, String phone, String role, Double walletBalance, Integer loyaltyPoints, Double totalSpending, String avatar, boolean isMember, MembershipPackage membershipPackage, LocalDateTime membershipExpiresAt, Double discountPercent) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.walletBalance = walletBalance;
        this.loyaltyPoints = loyaltyPoints != null ? loyaltyPoints : 0;
        this.totalSpending = totalSpending != null ? totalSpending : 0.0;
        this.avatar = avatar;
        this.isMember = isMember;
        this.membershipPackage = membershipPackage;
        this.membershipExpiresAt = membershipExpiresAt;
        this.discountPercent = discountPercent;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private boolean success;
        private String message;
        private String token;
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private Double walletBalance;
        private Integer loyaltyPoints;
        private Double totalSpending;
        private String avatar;
        private boolean isMember;
        private MembershipPackage membershipPackage;
        private LocalDateTime membershipExpiresAt;
        private Double discountPercent;

        public AuthResponseBuilder success(boolean success) { this.success = success; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }
        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder id(Long id) { this.id = id; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder walletBalance(Double walletBalance) { this.walletBalance = walletBalance; return this; }
        public AuthResponseBuilder loyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; return this; }
        public AuthResponseBuilder totalSpending(Double totalSpending) { this.totalSpending = totalSpending; return this; }
        public AuthResponseBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public AuthResponseBuilder isMember(boolean isMember) { this.isMember = isMember; return this; }
        public AuthResponseBuilder membershipPackage(MembershipPackage membershipPackage) { this.membershipPackage = membershipPackage; return this; }
        public AuthResponseBuilder membershipExpiresAt(LocalDateTime membershipExpiresAt) { this.membershipExpiresAt = membershipExpiresAt; return this; }
        public AuthResponseBuilder discountPercent(Double discountPercent) { this.discountPercent = discountPercent; return this; }

        public AuthResponse build() {
            return new AuthResponse(success, message, token, id, username, fullName, email, phone, role, walletBalance, loyaltyPoints, totalSpending, avatar, isMember, membershipPackage, membershipExpiresAt, discountPercent);
        }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }

    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public Double getTotalSpending() { return totalSpending; }
    public void setTotalSpending(Double totalSpending) { this.totalSpending = totalSpending; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public boolean isMember() { return isMember; }
    public void setMember(boolean member) { isMember = member; }

    public MembershipPackage getMembershipPackage() { return membershipPackage; }
    public void setMembershipPackage(MembershipPackage membershipPackage) { this.membershipPackage = membershipPackage; }

    public LocalDateTime getMembershipExpiresAt() { return membershipExpiresAt; }
    public void setMembershipExpiresAt(LocalDateTime membershipExpiresAt) { this.membershipExpiresAt = membershipExpiresAt; }

    public Double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Double discountPercent) { this.discountPercent = discountPercent; }
}
