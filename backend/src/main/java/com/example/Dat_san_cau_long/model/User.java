package com.example.Dat_san_cau_long.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(length = 20)
    private String role = "ROLE_USER"; // ROLE_USER, ROLE_ADMIN, ROLE_STAFF

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membership_package_id")
    private MembershipPackage membershipPackage;

    private LocalDateTime membershipExpiresAt;

    private Double walletBalance = 0.0;

    @Column(length = 255)
    private String avatar;

    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, BLOCKED

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
    }

    public User(Long id, String username, String password, String fullName, String email, String phone, String role, MembershipPackage membershipPackage, LocalDateTime membershipExpiresAt, Double walletBalance, String avatar, String status, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role != null ? role : "ROLE_USER";
        this.membershipPackage = membershipPackage;
        this.membershipExpiresAt = membershipExpiresAt;
        this.walletBalance = walletBalance != null ? walletBalance : 0.0;
        this.avatar = avatar;
        this.status = status != null ? status : "ACTIVE";
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String password;
        private String fullName;
        private String email;
        private String phone;
        private String role = "ROLE_USER";
        private MembershipPackage membershipPackage;
        private LocalDateTime membershipExpiresAt;
        private Double walletBalance = 0.0;
        private String avatar;
        private String status = "ACTIVE";
        private LocalDateTime createdAt = LocalDateTime.now();

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder membershipPackage(MembershipPackage membershipPackage) { this.membershipPackage = membershipPackage; return this; }
        public UserBuilder membershipExpiresAt(LocalDateTime membershipExpiresAt) { this.membershipExpiresAt = membershipExpiresAt; return this; }
        public UserBuilder walletBalance(Double walletBalance) { this.walletBalance = walletBalance; return this; }
        public UserBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public UserBuilder status(String status) { this.status = status; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, username, password, fullName, email, phone, role, membershipPackage, membershipExpiresAt, walletBalance, avatar, status, createdAt);
        }
    }

    public boolean isMembershipValid() {
        if (membershipPackage == null || membershipExpiresAt == null) {
            return false;
        }
        return membershipExpiresAt.isAfter(LocalDateTime.now());
    }

    public Double getActiveDiscountPercent() {
        if (isMembershipValid() && membershipPackage != null && membershipPackage.getDiscountPercent() != null) {
            return membershipPackage.getDiscountPercent();
        }
        return 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public MembershipPackage getMembershipPackage() { return membershipPackage; }
    public void setMembershipPackage(MembershipPackage membershipPackage) { this.membershipPackage = membershipPackage; }

    public LocalDateTime getMembershipExpiresAt() { return membershipExpiresAt; }
    public void setMembershipExpiresAt(LocalDateTime membershipExpiresAt) { this.membershipExpiresAt = membershipExpiresAt; }

    public Double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
