package com.example.Dat_san_cau_long.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    // Cho phép đăng nhập bằng username, số điện thoại hoặc email
    private String identifier; // username / phone / email
    private String password;
}
