package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courts")
public class CourtApiController {

    private final CourtRepository courtRepository;
    private final BranchRepository branchRepository;

    public CourtApiController(CourtRepository courtRepository, BranchRepository branchRepository) {
        this.courtRepository = courtRepository;
        this.branchRepository = branchRepository;
    }

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

        Integer courtNumber = dto.getCourtNumber();
        if (courtNumber == null && dto.getName() != null) {
            try {
                courtNumber = Integer.parseInt(dto.getName().replaceAll("\\D+", ""));
            } catch (Exception ignored) {
                courtNumber = 1;
            }
        }
        if (courtNumber == null) courtNumber = 1;

        Court court = Court.builder()
                .branch(branch)
                .courtNumber(courtNumber)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        Court saved = courtRepository.save(court);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Court> updateCourt(@PathVariable Long id, @RequestBody CourtRequestDto dto) {
        return courtRepository.findById(id).map(court -> {
            if (dto.getBranchId() != null) {
                branchRepository.findById(dto.getBranchId()).ifPresent(court::setBranch);
            }
            if (dto.getCourtNumber() != null) {
                court.setCourtNumber(dto.getCourtNumber());
            } else if (dto.getName() != null) {
                try {
                    court.setCourtNumber(Integer.parseInt(dto.getName().replaceAll("\\D+", "")));
                } catch (Exception ignored) {}
            }
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
            courtRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sân thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class CourtRequestDto {
        private Long branchId;
        private String name;
        private Integer courtNumber;
        private String courtGroup;
        private Boolean active;

        public CourtRequestDto() {
        }

        public Long getBranchId() { return branchId; }
        public void setBranchId(Long branchId) { this.branchId = branchId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Integer getCourtNumber() { return courtNumber; }
        public void setCourtNumber(Integer courtNumber) { this.courtNumber = courtNumber; }

        public String getCourtGroup() { return courtGroup; }
        public void setCourtGroup(String courtGroup) { this.courtGroup = courtGroup; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}
