package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.validation.OnCreate;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.service.MembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/memberships")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminMembershipController {

    private final MembershipService membershipService;

    public AdminMembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping("/packages")
    public ResponseEntity<List<MembershipPackage>> getAllPackages() {
        return ResponseEntity.ok(membershipService.getAllPackagesAdmin());
    }

    @PostMapping("/packages")
    public ResponseEntity<MembershipPackage> createPackage(@Validated(OnCreate.class) @RequestBody MembershipPackage pkg) {
        return ResponseEntity.ok(membershipService.createPackage(pkg));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<MembershipPackage> updatePackage(@PathVariable Long id, @Valid @RequestBody MembershipPackage pkg) {
        return ResponseEntity.ok(membershipService.updatePackage(id, pkg));
    }

    @DeleteMapping("/packages/{id}")
    public ResponseEntity<Map<String, Object>> deletePackage(@PathVariable Long id) {
        membershipService.deletePackage(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa / ẩn gói hội viên thành công!"));
    }

    @GetMapping("/history")
    public ResponseEntity<List<UserMembership>> getAllMembershipsHistory() {
        return ResponseEntity.ok(membershipService.getAllMembershipsAdmin());
    }
}
