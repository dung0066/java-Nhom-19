package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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

    private final com.example.Dat_san_cau_long.service.CatalogTrashService trashService;

    public CourtApiController(CourtRepository courtRepository, BranchRepository branchRepository,
                              com.example.Dat_san_cau_long.service.CatalogTrashService trashService) {
        this.courtRepository = courtRepository;
        this.branchRepository = branchRepository;
        this.trashService = trashService;
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
        return ResponseEntity.ok(courtRepository.findByDeletedAtIsNull());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<Court> createCourt(@RequestBody CourtRequestDto dto) {
        Branch branch = branchRepository.findByIdAndDeletedAtIsNull(dto.getBranchId())
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

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Court> updateCourt(@PathVariable Long id, @RequestBody CourtRequestDto dto) {
        return courtRepository.findByIdAndDeletedAtIsNull(id).map(court -> {
            if (dto.getBranchId() != null) {
                branchRepository.findByIdAndDeletedAtIsNull(dto.getBranchId()).ifPresent(court::setBranch);
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

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Court> toggleActive(@PathVariable Long id) {
        return courtRepository.findByIdAndDeletedAtIsNull(id).map(court -> {
            court.setActive(!Boolean.TRUE.equals(court.getActive()));
            return ResponseEntity.ok(courtRepository.save(court));
        }).orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteCourt(@PathVariable Long id) {
        return courtRepository.findByIdAndDeletedAtIsNull(id).map(court -> {
            String message = trashService.softDeleteCourt(id);
            return ResponseEntity.ok(Map.of("message", message));
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class CourtRequestDto {
        @NotNull(groups = OnCreate.class, message = "Vui lòng chọn chi nhánh cho sân")
        private Long branchId;
        @Size(max = 50, message = "Tên sân tối đa 50 ký tự")
        private String name;
        @Min(value = 1, message = "Số sân phải từ 1 trở lên")
        @Max(value = 99, message = "Số sân tối đa 99")
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
