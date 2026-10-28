package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.PasswordResetToken;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.repository.PasswordResetTokenRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * BƯỚC 1: Tìm người dùng theo email/username/phone, sinh OTP 6 số và gửi qua Email
     */
    @Transactional
    public Map<String, Object> sendOtp(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập Email hoặc Tên đăng nhập tài khoản!");
        }

        String safeId = identifier.trim().toLowerCase();
        User user = userRepository.findByEmail(safeId)
                .or(() -> userRepository.findByUsername(safeId))
                .or(() -> userRepository.findByPhone(safeId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản nào khớp với: " + identifier));

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalStateException("Tài khoản này chưa được cấu hình địa chỉ Email để nhận mã OTP!");
        }

        // Sinh mã OTP 6 số ngẫu nhiên
        int otpNumber = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(otpNumber);
        String otpHash = sha256Hex("OTP:" + user.getId() + ":" + otpCode);

        // Vô hiệu hóa các mã OTP cũ chưa dùng của user này
        List<PasswordResetToken> oldTokens = tokenRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (PasswordResetToken t : oldTokens) {
            if (t.getUsedAt() == null) {
                t.setUsedAt(LocalDateTime.now());
                tokenRepository.save(t);
            }
        }

        // Lưu OTP mới với thời hạn 10 phút
        PasswordResetToken resetTokenObj = PasswordResetToken.builder()
                .user(user)
                .tokenHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        tokenRepository.save(resetTokenObj);

        // Gửi email qua dịch vụ EmailService
        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otpCode);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Mã xác thực OTP 6 số đã được gửi tới email " + maskEmail(user.getEmail()));
        result.put("email", maskEmail(user.getEmail()));
        result.put("username", user.getUsername());
        result.put("debugOtp", otpCode); // Hỗ trợ test nhanh tại localhost

        return result;
    }

    /**
     * BƯỚC 2: Kiểm tra mã OTP do người dùng nhập từ Email.
     * Nếu đúng, server tạo 1 resetToken (token 64 ký tự an toàn) để chuyển tiếp qua trang đặt mật khẩu mới.
     */
    @Transactional
    public Map<String, Object> verifyOtp(String identifier, String otp) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập Email hoặc Username!");
        }
        if (otp == null || otp.trim().length() != 6) {
            throw new IllegalArgumentException("Mã OTP phải bao gồm đúng 6 chữ số!");
        }

        String safeId = identifier.trim().toLowerCase();
        User user = userRepository.findByEmail(safeId)
                .or(() -> userRepository.findByUsername(safeId))
                .or(() -> userRepository.findByPhone(safeId))
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại!"));

        String cleanOtp = otp.trim();
        String expectedHash = sha256Hex("OTP:" + user.getId() + ":" + cleanOtp);

        Optional<PasswordResetToken> matchedToken = tokenRepository.findByTokenHash(expectedHash);

        if (matchedToken.isEmpty()) {
            throw new BadCredentialsException("Mã OTP không chính xác. Vui lòng kiểm tra lại hòm thư email!");
        }

        PasswordResetToken token = matchedToken.get();
        if (token.getUsedAt() != null) {
            throw new BadCredentialsException("Mã OTP này đã được sử dụng trước đó. Vui lòng yêu cầu mã mới!");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("Mã OTP đã hết thời hạn hiệu lực (quá 10 phút). Vui lòng yêu cầu mã mới!");
        }

        // Đánh dấu mã OTP đã được xác thực thành công
        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);

        // Sinh resetToken duy nhất 64 ký tự hex an toàn để client chuyển tiếp sang trang đổi mật khẩu
        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        String tokenHash = sha256Hex("RESET_AUTH:" + rawToken);

        PasswordResetToken pageAuthToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(15)) // 15 phút để điền mật khẩu mới
                .build();
        tokenRepository.save(pageAuthToken);

        log.info("Xác thực OTP thành công cho user: {}. Đã cấp resetToken.", user.getUsername());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("resetToken", rawToken);
        result.put("username", user.getUsername());
        result.put("message", "Xác thực mã OTP thành công! Chuyển tiếp tới trang đặt lại mật khẩu...");

        return result;
    }

    /**
     * BƯỚC 3: Dùng resetToken nhận được từ server để cập nhật mật khẩu mới
     */
    @Transactional
    public Map<String, Object> resetPassword(String resetToken, String newPassword) {
        if (resetToken == null || resetToken.isBlank()) {
            throw new IllegalArgumentException("Thiếu mã token xác thực phiên đặt lại mật khẩu!");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        String tokenHash = sha256Hex("RESET_AUTH:" + resetToken.trim());
        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!"));

        if (token.getUsedAt() != null) {
            throw new BadCredentialsException("Phiên đặt lại mật khẩu này đã được sử dụng!");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadCredentialsException("Phiên đặt lại mật khẩu đã hết hạn (quá 15 phút). Vui lòng thực hiện lại từ đầu!");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Đánh dấu token đã sử dụng
        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);

        log.info("Đặt lại mật khẩu thành công cho tài khoản: {}", user.getUsername());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.");
        result.put("username", user.getUsername());

        return result;
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) return email;
        String prefix = email.substring(0, 2);
        String domain = email.substring(atIndex);
        return prefix + "***" + domain;
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Lỗi thuật toán SHA-256", e);
        }
    }
}

