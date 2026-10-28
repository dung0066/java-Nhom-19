package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller Quản Lý Tài Khoản Người Dùng Dành Cho Quản Trị Viên (Admin)
 * Chức năng: Xem danh sách tài khoản, Khóa/Mở tài khoản, Xóa người dùng.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    // 3. Xóa tài khoản người dùng
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

