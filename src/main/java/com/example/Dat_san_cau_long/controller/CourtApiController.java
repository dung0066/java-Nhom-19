package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourtApiController {

    private final CourtRepository courtRepository;
    private final BranchRepository branchRepository;

    @GetMapping
    public ResponseEntity<List<Court>> getCourts(@RequestParam(required = false) Long branchId,
                                                 @RequestParam(required = false) String branchCode) {
        if (branchId != null) {
            return ResponseEntity.ok(courtRepository.findByBranchIdOrderByCourtNumberAsc(branchId));
        }
        if (branchCode != null && !branchCode.isBlank()) {
            return ResponseEntity.ok(courtRepository.findByBranchCodeOrderByCourtNumberAsc(branchCode));
        }
        return ResponseEntity.ok(courtRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Court> createCourt(@RequestBody CourtRequestDto dto) {
        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new RuntimeException("Chi nhánh không tồn tại"));

        Court court = Court.builder()
                .branch(branch)
                .name(dto.getName())
                .courtNumber(dto.getCourtNumber() != null ? dto.getCourtNumber() : 1)
                .courtGroup(dto.getCourtGroup())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        Court saved = courtRepository.save(court);

        // Update branch court count
        List<Court> allCourts = courtRepository.findByBranchIdOrderByCourtNumberAsc(branch.getId());
        branch.setTotalCourts(allCourts.size());
        branchRepository.save(branch);

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Court> updateCourt(@PathVariable Long id, @RequestBody CourtRequestDto dto) {
        return courtRepository.findById(id).map(court -> {
            if (dto.getBranchId() != null) {
                branchRepository.findById(dto.getBranchId()).ifPresent(court::setBranch);
            }
            if (dto.getName() != null) court.setName(dto.getName());
            if (dto.getCourtNumber() != null) court.setCourtNumber(dto.getCourtNumber());
            if (dto.getCourtGroup() != null) court.setCourtGroup(dto.getCourtGroup());
            if (dto.getActive() != null) court.setActive(dto.getActive());
            return ResponseEntity.ok(courtRepository.save(court));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Court> toggleActive(@PathVariable Long id) {
        return courtRepository.findById(id).map(court -> {
            court.setActive(!Boolean.TRUE.equals(court.getActive()));
            return ResponseEntity.ok(courtRepository.save(court));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCourt(@PathVariable Long id) {
        return courtRepository.findById(id).map(court -> {
            Branch b = court.getBranch();
            courtRepository.deleteById(id);
            if (b != null) {
                List<Court> allCourts = courtRepository.findByBranchIdOrderByCourtNumberAsc(b.getId());
                b.setTotalCourts(allCourts.size());
                branchRepository.save(b);
            }
            return ResponseEntity.ok(Map.of("message", "Đã xóa sân thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class CourtRequestDto {
        private Long branchId;
        private String name;
        private Integer courtNumber;
        private String courtGroup;
        private Boolean active;
    }
}
