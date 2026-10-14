package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.membership.BuyMembershipRequest;
import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MembershipApiController {

    private final MembershipService membershipService;

    /**
     * Lấy danh sách các gói hội viên đang mở bán
     */
    @GetMapping("/packages")
    public ResponseEntity<List<MembershipPackage>> getActivePackages() {
        return ResponseEntity.ok(membershipService.getActivePackages());
    }

    /**
     * Chi tiết gói hội viên theo ID
     */
    @GetMapping("/packages/{id}")
    public ResponseEntity<?> getPackageById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(membershipService.getPackageById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Đăng ký mua gói hội viên VIP
     */
    @PostMapping("/buy")
    public ResponseEntity<?> buyMembership(@RequestBody BuyMembershipRequest req) {
        try {
            Map<String, Object> result = membershipService.buyMembership(req);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Lấy trạng thái gói hội viên hiện tại đang kích hoạt của User
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getUserActiveMembership(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(membershipService.getUserActiveMembership(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Lịch sử mua gói hội viên của User
     */
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<UserMembership>> getUserMembershipHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(membershipService.getUserMembershipHistory(userId));
    }

    // ==========================================
    // API QUẢN TRỊ DÀNH CHO ADMIN
    // ==========================================

    /**
     * Admin: Lấy tất cả lịch sử mua gói hội viên trong hệ thống
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<UserMembership>> getAllMembershipsAdmin() {
        return ResponseEntity.ok(membershipService.getAllMembershipsAdmin());
    }

    /**
     * Admin: Lấy tất cả gói hội viên (kể cả đã ẩn)
     */
    @GetMapping("/admin/packages")
    public ResponseEntity<List<MembershipPackage>> getAllPackagesAdmin() {
        return ResponseEntity.ok(membershipService.getAllPackagesAdmin());
    }

    /**
     * Admin: Tạo gói hội viên mới
     */
    @PostMapping("/admin/packages")
    public ResponseEntity<?> createPackage(@RequestBody MembershipPackage pkg) {
        try {
            return ResponseEntity.ok(membershipService.createPackage(pkg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Admin: Cập nhật thông tin gói hội viên
     */
    @PutMapping("/admin/packages/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody MembershipPackage pkg) {
        try {
            return ResponseEntity.ok(membershipService.updatePackage(id, pkg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Admin: Xóa / Ẩn gói hội viên
     */
    @DeleteMapping("/admin/packages/{id}")
    public ResponseEntity<?> deletePackage(@PathVariable Long id) {
        try {
            membershipService.deletePackage(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa / ẩn gói hội viên thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
