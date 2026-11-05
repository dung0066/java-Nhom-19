package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.auth.*;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import com.example.Dat_san_cau_long.service.AuthService;
import com.example.Dat_san_cau_long.service.PasswordResetService;
import com.example.Dat_san_cau_long.service.EmailService;
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
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    public AuthApiController(AuthService authService, PasswordResetService passwordResetService, EmailService emailService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
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
     * BƯỚC 1: Quên mật khẩu - Gửi mã OTP 6 số qua email
     */
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        if (identifier == null) identifier = body.get("email");
        Map<String, Object> res = passwordResetService.sendOtp(identifier);
        return ResponseEntity.ok(res);
    }

    /**
     * BƯỚC 2: Xác thực mã OTP 6 số từ email - Trả về resetToken để chuyển tiếp page
     */
    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        if (identifier == null) identifier = body.get("email");
        String otp = body.get("otp");
        Map<String, Object> res = passwordResetService.verifyOtp(identifier, otp);
        return ResponseEntity.ok(res);
    }

    /**
     * BƯỚC 3: Đặt lại mật khẩu mới sử dụng resetToken đã được cấp
     */
    @PostMapping("/forgot-password/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> body) {
        String resetToken = body.get("resetToken");
        String newPassword = body.get("newPassword");
        Map<String, Object> res = passwordResetService.resetPassword(resetToken, newPassword);
        return ResponseEntity.ok(res);
    }

    /**
     * Admin/User đã đăng nhập: Yêu cầu gửi OTP về email để xác thực đổi mật khẩu
     */
    @PostMapping("/otp/send-change-password-otp")
    public ResponseEntity<Map<String, Object>> sendChangePasswordOtp(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new BadCredentialsException("Vui lòng đăng nhập trước khi thực hiện thao tác này!");
        }
        Map<String, Object> res = passwordResetService.sendOtp(userDetails.getUsername());
        return ResponseEntity.ok(res);
    }

    /**
     * Admin/User đã đăng nhập: Xác thực OTP và đổi mật khẩu mới
     */
    @PostMapping("/otp/verify-and-change-password")
    public ResponseEntity<Map<String, Object>> verifyAndChangePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        if (userDetails == null) {
            throw new BadCredentialsException("Vui lòng đăng nhập trước khi thực hiện thao tác này!");
        }
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        Map<String, Object> verifyRes = passwordResetService.verifyOtp(userDetails.getUsername(), otp);
        String resetToken = (String) verifyRes.get("resetToken");

        Map<String, Object> resetRes = passwordResetService.resetPassword(resetToken, newPassword);
        return ResponseEntity.ok(resetRes);
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
     * Đổi mật khẩu tài khoản trực tiếp (yêu cầu mật khẩu cũ)
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

    
    /**
     * Kiểm tra trực tiếp kết nối và gửi mail thử nghiệm qua Google SMTP Server
     */
    @PostMapping("/test-mail")
    public ResponseEntity<Map<String, Object>> testMail(@RequestBody(required = false) Map<String, String> body) {
        String email = (body != null) ? body.get("email") : null;
        Map<String, Object> result = emailService.testSmtpConnection(email);
        return ResponseEntity.ok(result);
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
