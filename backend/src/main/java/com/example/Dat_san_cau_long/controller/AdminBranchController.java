package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/branches")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminBranchController {

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;

    public AdminBranchController(BranchRepository branchRepository, CourtRepository courtRepository) {
        this.branchRepository = branchRepository;
        this.courtRepository = courtRepository;
    }

    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Branch> getBranchById(@PathVariable Long id) {
        return branchRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Branch> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @RequestBody Branch branch) {
        return branchRepository.findById(id).map(existing -> {
            if (branch.getCode() != null) existing.setCode(branch.getCode());
            if (branch.getName() != null) existing.setName(branch.getName());
            if (branch.getAddress() != null) existing.setAddress(branch.getAddress());
            if (branch.getPhone() != null) existing.setPhone(branch.getPhone());
            if (branch.getActive() != null) existing.setActive(branch.getActive());
            return ResponseEntity.ok(branchRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBranch(@PathVariable Long id) {
        courtRepository.deleteByBranchId(id);
        branchRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa chi nhánh và các sân liên quan thành công!"));
    }
}
