package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branches")
public class BranchApiController {

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;

    public BranchApiController(BranchRepository branchRepository, CourtRepository courtRepository) {
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

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<Branch> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long id, @RequestBody Branch branch) {
        return branchRepository.findById(id).map(existing -> {
            existing.setCode(branch.getCode());
            existing.setName(branch.getName());
            existing.setAddress(branch.getAddress());
            existing.setPhone(branch.getPhone());
            if (branch.getActive() != null) {
                existing.setActive(branch.getActive());
            }
            return ResponseEntity.ok(branchRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBranch(@PathVariable Long id) {
        courtRepository.deleteByBranchId(id);
        branchRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa chi nhánh và các sân liên quan thành công!"));
    }
}
