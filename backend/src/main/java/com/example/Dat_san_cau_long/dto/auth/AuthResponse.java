package com.example.Dat_san_cau_long.dto.auth;

import com.example.Dat_san_cau_long.model.MembershipPackage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    private String avatar;
    
    // Membership Status
    private boolean isMember;
    private MembershipPackage membershipPackage;
    private LocalDateTime membershipExpiresAt;
    private Double discountPercent; // % giảm giá áp dụng khi đặt sân
}
