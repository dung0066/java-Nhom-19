package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.Wallet;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Controller Quản Lý Tài Khoản Người Dùng Dành Cho Quản Trị Viên (Admin)
 * Chức năng: Xem danh sách tài khoản, Khóa/Mở tài khoản, Đổi quyền, Thêm/Sửa/Xóa người dùng.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository,
                               WalletRepository walletRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Lấy danh sách tất cả tài khoản
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 2. Đổi trạng thái tài khoản (Khóa hoặc Kích hoạt)
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            if (user.getStatus() == UserStatus.ACTIVE) {
                user.setStatus(UserStatus.LOCKED);
            } else {
                user.setStatus(UserStatus.ACTIVE);
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Đổi vai trò (ROLE_USER, ROLE_STAFF, ROLE_ADMIN)
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null) return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tham số role"));
        try {
            UserRole newRole = UserRole.valueOf(roleStr);
            return userRepository.findById(id).map(user -> {
                user.setRole(newRole);
                return ResponseEntity.ok(userRepository.save(user));
            }).orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role không hợp lệ: " + roleStr));
        }
    }

    // 4. Thêm tài khoản mới (Admin / Staff / Khách hàng)
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String fullName = body.get("fullName");
        String email = body.get("email");
        String phone = body.get("phone");
        String roleStr = body.get("role");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username và Mật khẩu không được để trống!"));
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập đã tồn tại trong hệ thống!"));
        }

        UserRole role = UserRole.ROLE_USER;
        if (roleStr != null && !roleStr.isBlank()) {
            try {
                role = UserRole.valueOf(roleStr);
            } catch (Exception ignored) {}
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .fullName(fullName != null ? fullName : username)
                .email(email)
                .phone(phone)
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // Tạo ví ban đầu cho user
        Wallet wallet = Wallet.builder()
                .user(savedUser)
                .balance(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);

        return ResponseEntity.ok(savedUser);
    }

    // 5. Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            if (body.get("fullName") != null) user.setFullName(body.get("fullName"));
            if (body.get("email") != null) user.setEmail(body.get("email"));
            if (body.get("phone") != null) user.setPhone(body.get("phone"));
            if (body.get("role") != null) {
                try {
                    user.setRole(UserRole.valueOf(body.get("role")));
                } catch (Exception ignored) {}
            }
            if (body.get("password") != null && !body.get("password").isBlank()) {
                user.setPassword(passwordEncoder.encode(body.get("password")));
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 6. Xóa tài khoản người dùng
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "success", true,
                    "message", "Đã xóa tài khoản thành công!"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
