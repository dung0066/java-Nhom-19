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

    public AdminBranchController(BranchRepository branchRepository, CatalogTrashService trashService) {
        this.branchRepository = branchRepository;
        this.trashService = trashService;
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
}
