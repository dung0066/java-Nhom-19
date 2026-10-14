package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.auth.*;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.util.PasswordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Đăng ký tài khoản người dùng mới
     */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên đăng nhập không được để trống!");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự!");
        }
        if (req.getPhone() == null || req.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại không được để trống!");
        }

        String username = req.getUsername().trim().toLowerCase();
        String phone = req.getPhone().trim();
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : null;

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Tên đăng nhập '" + username + "' đã được sử dụng!");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Số điện thoại '" + phone + "' đã được đăng ký tài khoản khác!");
        }
        if (email != null && !email.isEmpty() && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' đã được đăng ký tài khoản khác!");
        }

        User user = User.builder()
                .username(username)
                .password(PasswordUtil.hashPassword(req.getPassword()))
                .fullName(req.getFullName() != null && !req.getFullName().trim().isEmpty() ? req.getFullName().trim() : username)
                .email(email)
                .phone(phone)
                .role("ROLE_USER")
                .status("ACTIVE")
                .walletBalance(0.0)
                .build();

        user = userRepository.save(user);
        log.info("Đã tạo tài khoản thành công cho user: {}", user.getUsername());

        return toAuthResponse(user, "Đăng ký tài khoản thành công!");
    }

    /**
     * Đăng nhập bằng username, số điện thoại hoặc email
     */
    public AuthResponse login(LoginRequest req) {
        if (req.getIdentifier() == null || req.getIdentifier().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập tên đăng nhập, số điện thoại hoặc email!");
        }
        if (req.getPassword() == null || req.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập mật khẩu!");
        }

        String identifier = req.getIdentifier().trim().toLowerCase();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác!"));

        if (!PasswordUtil.verifyPassword(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác!");
        }

        if ("BLOCKED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Tài khoản của bạn đã bị tạm khóa, vui lòng liên hệ ban quản lý!");
        }

        return toAuthResponse(user, "Đăng nhập thành công!");
    }

    /**
     * Lấy thông tin cá nhân của User
     */
    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));
        return toAuthResponse(user, "Lấy thông tin người dùng thành công");
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    @Transactional
    public AuthResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        if (req.getFullName() != null && !req.getFullName().trim().isEmpty()) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
            String newEmail = req.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email đã được sử dụng bởi người dùng khác!");
            }
            user.setEmail(newEmail);
        }
        if (req.getPhone() != null && !req.getPhone().trim().isEmpty()) {
            String newPhone = req.getPhone().trim();
            if (!newPhone.equalsIgnoreCase(user.getPhone()) && userRepository.existsByPhone(newPhone)) {
                throw new IllegalArgumentException("Số điện thoại đã được sử dụng bởi người dùng khác!");
            }
            user.setPhone(newPhone);
        }
        if (req.getAvatar() != null) {
            user.setAvatar(req.getAvatar());
        }

        user = userRepository.save(user);
        return toAuthResponse(user, "Cập nhật hồ sơ thành công!");
    }

    /**
     * Đổi mật khẩu
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        if (!PasswordUtil.verifyPassword(req.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác!");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        user.setPassword(PasswordUtil.hashPassword(req.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Quản trị viên lấy danh sách toàn bộ người dùng
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Map Entity User sang AuthResponse DTO
     */
    private AuthResponse toAuthResponse(User user, String message) {
        // Tạo token phiên đăng nhập định danh
        String token = "WSB_" + Base64.getUrlEncoder().withoutPadding().encodeToString(
                (user.getId() + ":" + user.getUsername() + ":" + UUID.randomUUID()).getBytes()
        );

        return AuthResponse.builder()
                .success(true)
                .message(message)
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .walletBalance(user.getWalletBalance())
                .avatar(user.getAvatar())
                .isMember(user.isMembershipValid())
                .membershipPackage(user.isMembershipValid() ? user.getMembershipPackage() : null)
                .membershipExpiresAt(user.getMembershipExpiresAt())
                .discountPercent(user.getActiveDiscountPercent())
                .build();
    }
}
