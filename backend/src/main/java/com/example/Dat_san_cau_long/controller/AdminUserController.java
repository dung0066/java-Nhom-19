package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.AdminUserRequest;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.Wallet;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * CRUD tài khoản (chỉ ADMIN).
 * Ràng buộc nghiệp vụ: tên đăng nhập, email, số điện thoại không trùng;
 * không tự khóa, tự đổi quyền hay tự xóa chính mình; không xóa tài khoản quản trị viên hoặc nhân viên;
 * không xóa tài khoản đã có đơn đặt sân.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BookingRepository bookingRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository,
                               WalletRepository walletRepository,
                               BookingRepository bookingRepository,
                               UserMembershipRepository userMembershipRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.bookingRepository = bookingRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Lấy danh sách tất cả tài khoản
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 1b. Thông tin đầy đủ của một tài khoản: hồ sơ, ví, hội viên và thống kê đơn đặt sân
    @GetMapping("/{id}/detail")
    public ResponseEntity<Map<String, Object>> getUserDetail(@PathVariable Long id) {
        User user = findUser(id);
        LocalDateTime now = LocalDateTime.now();

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole().name());
        profile.put("status", user.getStatus().name());
        profile.put("studentVerifiedAt", user.getStudentVerifiedAt());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("updatedAt", user.getUpdatedAt());

        Map<String, Object> membership = null;
        var active = userMembershipRepository.findActiveMembershipForUser(id, now);
        if (active.isPresent()) {
            UserMembership um = active.get();
            membership = new LinkedHashMap<>();
            membership.put("packageName", um.getMembershipPackage().getName());
            membership.put("discountPercent", um.getMembershipPackage().getDiscountPercent());
            membership.put("startDate", um.getStartDate());
            membership.put("endDate", um.getEndDate());
            membership.put("subscriptionCode", um.getSubscriptionCode());
        }
        Map<String, Object> pending = null;
        var pendingOpt = userMembershipRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(id, MembershipStatus.PENDING);
        if (pendingOpt.isPresent()) {
            pending = new LinkedHashMap<>();
            pending.put("packageName", pendingOpt.get().getMembershipPackage().getName());
            pending.put("subscriptionCode", pendingOpt.get().getSubscriptionCode());
            pending.put("pricePaid", pendingOpt.get().getPricePaid());
        }

        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(id);
        BigDecimal totalSpent = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", bookings.size());
        stats.put("pendingBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count());
        stats.put("confirmedBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count());
        stats.put("completedBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count());
        stats.put("cancelledBookings", bookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count());
        stats.put("totalSpent", totalSpent);
        stats.put("lastBookingAt", bookings.isEmpty() ? null : bookings.get(0).getCreatedAt());

        Map<String, Object> res = new HashMap<>();
        res.put("user", profile);
        res.put("walletBalance", walletRepository.findById(id).map(Wallet::getBalance).orElse(BigDecimal.ZERO));
        res.put("membership", membership);
        res.put("pendingMembership", pending);
        res.put("stats", stats);
        return ResponseEntity.ok(res);
    }

    // 2. Đổi trạng thái tài khoản (Khóa hoặc Kích hoạt)
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id,
                                                 @AuthenticationPrincipal CustomUserDetails currentUser) {
        User user = findUser(id);
        rejectSelfAction(user, currentUser, "khóa");
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.LOCKED : UserStatus.ACTIVE);
        return ResponseEntity.ok(userRepository.save(user));
    }

    // 3. Đổi vai trò (ROLE_USER, ROLE_STAFF, ROLE_ADMIN)
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id,
                                            @RequestBody Map<String, String> body,
                                            @AuthenticationPrincipal CustomUserDetails currentUser) {
        String roleStr = body.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu tham số role"));
        }
        UserRole newRole = parseRole(roleStr);
        User user = findUser(id);
        rejectSelfAction(user, currentUser, "đổi quyền của");
        user.setRole(newRole);
        return ResponseEntity.ok(userRepository.save(user));
    }

    // 4. Thêm tài khoản mới (Admin / Staff / Khách hàng)
    @PostMapping
    public ResponseEntity<?> createUser(@Validated(OnCreate.class) @RequestBody AdminUserRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalStateException("Tên đăng nhập đã tồn tại trong hệ thống!");
        }
        if (req.getEmail() != null && !req.getEmail().isBlank() && userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email này đã được dùng cho tài khoản khác!");
        }
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new IllegalStateException("Số điện thoại này đã được dùng cho tài khoản khác!");
        }

        UserRole role = (req.getRole() != null && !req.getRole().isBlank()) ? parseRole(req.getRole()) : UserRole.ROLE_USER;

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName() != null && !req.getFullName().isBlank() ? req.getFullName() : req.getUsername())
                .email(req.getEmail() != null && !req.getEmail().isBlank() ? req.getEmail() : null)
                .phone(req.getPhone())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // Tạo ví ban đầu cho user
        walletRepository.save(Wallet.builder().user(savedUser).balance(BigDecimal.ZERO).build());

        return ResponseEntity.ok(savedUser);
    }

    // 5. Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @Valid @RequestBody AdminUserRequest req,
                                        @AuthenticationPrincipal CustomUserDetails currentUser) {
        User user = findUser(id);

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getEmail() != null) {
            if (!req.getEmail().isBlank() && userRepository.existsByEmailAndIdNot(req.getEmail(), id)) {
                throw new IllegalStateException("Email này đã được dùng cho tài khoản khác!");
            }
            user.setEmail(req.getEmail().isBlank() ? null : req.getEmail());
        }
        if (req.getPhone() != null) {
            if (userRepository.existsByPhoneAndIdNot(req.getPhone(), id)) {
                throw new IllegalStateException("Số điện thoại này đã được dùng cho tài khoản khác!");
            }
            user.setPhone(req.getPhone());
        }
        if (req.getRole() != null) {
            UserRole newRole = parseRole(req.getRole());
            if (newRole != user.getRole()) {
                rejectSelfAction(user, currentUser, "đổi quyền của");
            }
            user.setRole(newRole);
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    // 6. Xóa tài khoản người dùng
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id,
                                                          @AuthenticationPrincipal CustomUserDetails currentUser) {
        User user = findUser(id);
        rejectSelfAction(user, currentUser, "xóa");
        if (user.getRole() == UserRole.ROLE_ADMIN || user.getRole() == UserRole.ROLE_STAFF) {
            throw new IllegalStateException("Không thể xóa tài khoản quản trị viên hoặc nhân viên. "
                    + "Hãy khóa tài khoản này, hoặc hạ quyền xuống khách hàng trước nếu thật sự cần xóa!");
        }
        long bookingCount = bookingRepository.countByUserId(id);
        if (bookingCount > 0) {
            throw new IllegalStateException("Tài khoản này đã có " + bookingCount
                    + " đơn đặt sân nên không thể xóa. Hãy khóa tài khoản thay vì xóa!");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa tài khoản thành công!"));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản ID: " + id));
    }

    private UserRole parseRole(String roleStr) {
        try {
            return UserRole.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Role không hợp lệ: " + roleStr);
        }
    }

    /** Admin không được tự khóa, tự đổi quyền hoặc tự xóa chính mình (tránh mất quyền quản trị). */
    private void rejectSelfAction(User target, CustomUserDetails currentUser, String action) {
        if (currentUser != null && target.getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Bạn không thể " + action + " chính tài khoản đang đăng nhập!");
        }
    }
}
