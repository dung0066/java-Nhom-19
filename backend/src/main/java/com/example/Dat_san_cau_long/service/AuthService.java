package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.auth.*;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.Wallet;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import com.example.Dat_san_cau_long.util.PasswordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final UserMembershipRepository userMembershipRepository;

    public AuthService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       UserMembershipRepository userMembershipRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.userMembershipRepository = userMembershipRepository;
    }

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
                .role(UserRole.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Tạo ví ban đầu
        Wallet wallet = Wallet.builder()
                .userId(user.getId())
                .user(user)
                .balance(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);

        log.info("Đã tạo tài khoản thành công cho user: {}", user.getUsername());

        return toAuthResponse(user, "Đăng ký tài khoản thành công!");
    }

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

        if (user.getStatus() == UserStatus.LOCKED || user.getStatus() == UserStatus.DELETED) {
            throw new IllegalStateException("Tài khoản của bạn đã bị tạm khóa hoặc ngừng hoạt động!");
        }

        return toAuthResponse(user, "Đăng nhập thành công!");
    }

    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));
        return toAuthResponse(user, "Lấy thông tin người dùng thành công");
    }

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

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    private AuthResponse toAuthResponse(User user, String message) {
        String token = "WSB_" + Base64.getUrlEncoder().withoutPadding().encodeToString(
                (user.getId() + ":" + user.getUsername() + ":" + UUID.randomUUID()).getBytes()
        );

        BigDecimal balance = walletRepository.findById(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        Optional<UserMembership> activeMembership = userMembershipRepository.findActiveMembershipForUser(user.getId(), LocalDateTime.now());

        return AuthResponse.builder()
                .success(true)
                .message(message)
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .walletBalance(balance.doubleValue())
                .avatar(user.getAvatar())
                .isMember(activeMembership.isPresent())
                .membershipPackage(activeMembership.map(UserMembership::getMembershipPackage).orElse(null))
                .membershipExpiresAt(activeMembership.map(UserMembership::getEndDate).orElse(null))
                .discountPercent(activeMembership.map(um -> um.getMembershipPackage().getDiscountPercent().doubleValue()).orElse(0.0))
                .build();
    }
}
