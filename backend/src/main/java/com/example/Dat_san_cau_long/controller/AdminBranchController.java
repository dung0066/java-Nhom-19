package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.service.CatalogTrashService;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CRUD chi nhánh (chỉ ADMIN). Ràng buộc nghiệp vụ: mã chi nhánh duy nhất.
 * Xóa là xóa tạm (vào thùng rác); khôi phục hoặc xóa vĩnh viễn qua các endpoint /trash.
 */
@RestController
@RequestMapping("/api/admin/branches")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminBranchController {

    private final BranchRepository branchRepository;
    private final CatalogTrashService trashService;
    private final com.example.Dat_san_cau_long.repository.UserRepository userRepository;
    private final com.example.Dat_san_cau_long.repository.StaffBranchRepository staffBranchRepository;

    public AdminBranchController(BranchRepository branchRepository,
                                  CatalogTrashService trashService,
                                  com.example.Dat_san_cau_long.repository.UserRepository userRepository,
                                  com.example.Dat_san_cau_long.repository.StaffBranchRepository staffBranchRepository) {
        this.branchRepository = branchRepository;
        this.trashService = trashService;
        this.userRepository = userRepository;
        this.staffBranchRepository = staffBranchRepository;
    }

    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findByDeletedAtIsNull());
    }

    /** Danh sách chi nhánh trong thùng rác. */
    @GetMapping("/trash")
    public ResponseEntity<List<Branch>> getTrashedBranches() {
        return ResponseEntity.ok(trashService.listTrashedBranches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Branch> getBranchById(@PathVariable Long id) {
        return branchRepository.findByIdAndDeletedAtIsNull(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Branch> createBranch(@Validated(OnCreate.class) @RequestBody Branch branch) {
        String code = branch.getCode().trim().toUpperCase();
        branchRepository.findByCode(code).ifPresent(found -> {
            throw new IllegalStateException(found.getDeletedAt() != null
                    ? "Mã chi nhánh '" + code + "' đang nằm trong thùng rác. Hãy khôi phục hoặc xóa vĩnh viễn nó trước!"
                    : "Mã chi nhánh '" + code + "' đã tồn tại!");
        });
        branch.setId(null);
        branch.setCode(code);
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @Valid @RequestBody Branch branch) {
        Branch existing = branchRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + id));

        if (branch.getCode() != null) {
            String code = branch.getCode().trim().toUpperCase();
            if (branchRepository.existsByCodeAndIdNot(code, id)) {
                throw new IllegalStateException("Mã chi nhánh '" + code + "' đã tồn tại!");
            }
            existing.setCode(code);
        }
        if (branch.getName() != null) existing.setName(branch.getName());
        if (branch.getAddress() != null) existing.setAddress(branch.getAddress());
        if (branch.getPhone() != null) existing.setPhone(branch.getPhone());
        if (branch.getActive() != null) existing.setActive(branch.getActive());
        return ResponseEntity.ok(branchRepository.save(existing));
    }

    /** Xóa tạm: chuyển chi nhánh và các sân của nó vào thùng rác (chặn nếu còn lượt đặt chưa diễn ra). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBranch(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", trashService.softDeleteBranch(id)));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restoreBranch(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", trashService.restoreBranch(id)));
    }

    /** Xóa vĩnh viễn một chi nhánh đang trong thùng rác (chỉ khi chưa từng có đơn đặt sân). */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Map<String, Object>> permanentlyDeleteBranch(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", trashService.permanentlyDeleteBranch(id)));
    }

    /**
     * Lấy danh sách 4 chi nhánh và Quản lý cửa hàng (Store Manager) được ủy quyền tương ứng
     */
    @GetMapping("/delegations")
    public ResponseEntity<List<Map<String, Object>>> getBranchDelegations() {
        List<Branch> branches = branchRepository.findByDeletedAtIsNull();
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        for (Branch branch : branches) {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("branchId", branch.getId());
            map.put("branchCode", branch.getCode());
            map.put("branchName", branch.getName());
            map.put("branchAddress", branch.getAddress());
            map.put("branchPhone", branch.getPhone());
            map.put("active", branch.getActive());

            // Tìm nhân sự được ủy quyền quản lý chi nhánh này
            List<com.example.Dat_san_cau_long.model.StaffBranch> staffList =
                    staffBranchRepository.findByIdBranchId(branch.getId());

            // Tìm manager (ưu tiên ROLE_STAFF hoặc user khác admin ID 1 nếu có)
            com.example.Dat_san_cau_long.model.User manager = null;
            for (com.example.Dat_san_cau_long.model.StaffBranch sb : staffList) {
                com.example.Dat_san_cau_long.model.User u = sb.getUser();
                if (u != null && u.getRole() == com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_STAFF) {
                    manager = u;
                    break;
                }
            }
            if (manager == null && !staffList.isEmpty()) {
                // Nếu chưa có ROLE_STAFF riêng mà có gán, lấy người đầu tiên
                manager = staffList.get(0).getUser();
            }

            if (manager != null) {
                Map<String, Object> mgrMap = new java.util.LinkedHashMap<>();
                mgrMap.put("id", manager.getId());
                mgrMap.put("username", manager.getUsername());
                mgrMap.put("fullName", manager.getFullName());
                mgrMap.put("email", manager.getEmail());
                mgrMap.put("phone", manager.getPhone());
                mgrMap.put("role", manager.getRole().name());
                map.put("manager", mgrMap);
            } else {
                map.put("manager", null);
            }

            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Admin ủy quyền 1 tài khoản làm Quản lý cửa hàng (Store Manager) cho chi nhánh
     */
    @PostMapping("/{branchId}/assign-manager")
    public ResponseEntity<Map<String, Object>> assignBranchManager(@PathVariable Long branchId,
                                                                   @RequestBody Map<String, Object> body) {
        if (!(body.get("userId") instanceof Number)) {
            throw new IllegalArgumentException("Vui lòng chọn tài khoản hợp lệ để ủy quyền!");
        }
        Long userId = ((Number) body.get("userId")).longValue();

        Branch branch = branchRepository.findByIdAndDeletedAtIsNull(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + branchId));

        com.example.Dat_san_cau_long.model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản người dùng ID: " + userId));

        // Nâng quyền tài khoản thành ROLE_STAFF (Quản lý cửa hàng) nếu chưa phải admin
        if (user.getRole() != com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_ADMIN) {
            user.setRole(com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_STAFF);
            userRepository.save(user);
        }

        // Xóa các chi nhánh cũ của user này để đảm bảo 1 tài khoản quản lý đúng 1 chi nhánh
        staffBranchRepository.deleteByUserId(userId);

        // Lưu ủy quyền vào staff_branches
        com.example.Dat_san_cau_long.model.StaffBranchId id =
                new com.example.Dat_san_cau_long.model.StaffBranchId(userId, branchId);
        com.example.Dat_san_cau_long.model.StaffBranch sb = com.example.Dat_san_cau_long.model.StaffBranch.builder()
                .id(id)
                .user(user)
                .branch(branch)
                .build();
        staffBranchRepository.save(sb);

        Map<String, Object> res = new java.util.HashMap<>();
        res.put("success", true);
        res.put("message", "Đã ủy quyền thành công tài khoản '" + user.getFullName() + "' làm Quản lý chi nhánh " + branch.getName() + "!");
        res.put("branchId", branch.getId());
        res.put("userId", user.getId());
        res.put("managerName", user.getFullName());
        return ResponseEntity.ok(res);
    }

    /**
     * Thu hồi ủy quyền quản lý chi nhánh của tài khoản
     */
    @DeleteMapping("/{branchId}/revoke-manager/{userId}")
    public ResponseEntity<Map<String, Object>> revokeBranchManager(@PathVariable Long branchId,
                                                                   @PathVariable Long userId) {
        staffBranchRepository.deleteByUserIdAndBranchId(userId, branchId);

        // Nếu user này không còn quản lý chi nhánh nào khác và không phải admin, chuyển về ROLE_USER
        com.example.Dat_san_cau_long.model.User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getRole() == com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_STAFF) {
            List<com.example.Dat_san_cau_long.model.StaffBranch> remaining = staffBranchRepository.findByIdUserId(userId);
            if (remaining.isEmpty()) {
                user.setRole(com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_USER);
                userRepository.save(user);
            }
        }

        Map<String, Object> res = new java.util.HashMap<>();
        res.put("success", true);
        res.put("message", "Đã thu hồi quyền Quản lý chi nhánh của tài khoản thành công!");
        return ResponseEntity.ok(res);
    }
}
