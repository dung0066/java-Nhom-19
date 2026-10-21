package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.auth.*;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import com.example.Dat_san_cau_long.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final AuthService authService;

    public AuthApiController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Đăng ký tài khoản người dùng mới
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = authService.register(req);
        return ResponseEntity.ok(response);
    }

    /**
     * Đăng nhập hệ thống (hỗ trợ username / sđt / email)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin cá nhân của User hiện tại (từ JWT token trong SecurityContext)
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long userId) {
        Long targetId = resolveUserId(userDetails, userId);
        AuthResponse response = authService.getProfile(targetId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật thông tin tài khoản cá nhân
     */
    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long userId,
            @RequestBody UpdateProfileRequest req) {
        Long targetId = resolveUserId(userDetails, userId);
        AuthResponse response = authService.updateProfile(targetId, req);
        return ResponseEntity.ok(response);
    }

    /**
     * Đổi mật khẩu tài khoản
     */
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long userId,
            @RequestBody ChangePasswordRequest req) {
        Long targetId = resolveUserId(userDetails, userId);
        authService.changePassword(targetId, req);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đổi mật khẩu thành công!"
        ));
    }

    /**
     * Quản trị viên: Lấy danh sách toàn bộ người dùng
     */
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    private Long resolveUserId(CustomUserDetails userDetails, Long fallbackId) {
        if (userDetails != null && userDetails.getId() != null) {
            return userDetails.getId();
        }
        if (fallbackId != null) {
            return fallbackId;
        }
        throw new BadCredentialsException("Vui lòng đăng nhập để thực hiện thao tác này!");
    }
}
