package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.controller.CourtApiController.CourtRequestDto;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.service.CatalogTrashService;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * CRUD sân (chỉ ADMIN). Ràng buộc nghiệp vụ: số sân không trùng trong cùng chi nhánh.
 * Xóa là xóa tạm (vào thùng rác); khôi phục hoặc xóa vĩnh viễn qua các endpoint /trash.
 */
@RestController
@RequestMapping("/api/admin/courts")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminCourtController {

    private final CourtRepository courtRepository;
    private final BranchRepository branchRepository;
    private final CatalogTrashService trashService;

    public AdminCourtController(CourtRepository courtRepository,
                                BranchRepository branchRepository,
                                CatalogTrashService trashService) {
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

    /** Danh sách sân trong thùng rác (kèm chi nhánh của sân). */
    @GetMapping("/trash")
    public ResponseEntity<List<Map<String, Object>>> getTrashedCourts() {
        List<Map<String, Object>> result = trashService.listTrashedCourts().stream().map(c -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            m.put("courtNumber", c.getCourtNumber());
            m.put("branchId", c.getBranch().getId());
            m.put("branchCode", c.getBranch().getCode());
            m.put("branchName", c.getBranch().getName());
            m.put("branchDeleted", c.getBranch().getDeletedAt() != null);
            m.put("deletedAt", c.getDeletedAt());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Court> createCourt(@Validated(OnCreate.class) @RequestBody CourtRequestDto dto) {
        Branch branch = branchRepository.findByIdAndDeletedAtIsNull(dto.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Chi nhánh không tồn tại"));

        int courtNumber = resolveCourtNumber(dto, 1);
        if (courtRepository.existsByBranchIdAndCourtNumber(branch.getId(), courtNumber)) {
            throw new IllegalStateException("Chi nhánh " + branch.getName() + " đã có Sân " + courtNumber + " (kể cả trong thùng rác)!");
        }

        Court court = Court.builder()
                .branch(branch)
                .courtNumber(courtNumber)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return ResponseEntity.ok(courtRepository.save(court));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Court> updateCourt(@PathVariable Long id, @Valid @RequestBody CourtRequestDto dto) {
        Court court = courtRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân ID: " + id));

        if (dto.getBranchId() != null) {
            branchRepository.findByIdAndDeletedAtIsNull(dto.getBranchId()).ifPresent(court::setBranch);
        }
        Integer newNumber = (dto.getCourtNumber() != null || dto.getName() != null)
                ? resolveCourtNumber(dto, court.getCourtNumber())
                : null;
        if (newNumber != null) {
            if (courtRepository.existsByBranchIdAndCourtNumberAndIdNot(court.getBranch().getId(), newNumber, id)) {
                throw new IllegalStateException("Chi nhánh " + court.getBranch().getName() + " đã có Sân " + newNumber + "!");
            }
            court.setCourtNumber(newNumber);
        }
        if (dto.getActive() != null) court.setActive(dto.getActive());
        return ResponseEntity.ok(courtRepository.save(court));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Court> toggleActive(@PathVariable Long id) {
        return courtRepository.findByIdAndDeletedAtIsNull(id).map(court -> {
            court.setActive(!Boolean.TRUE.equals(court.getActive()));
            return ResponseEntity.ok(courtRepository.save(court));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Xóa tạm: chuyển sân vào thùng rác (chặn nếu sân còn lượt đặt chưa diễn ra). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCourt(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", trashService.softDeleteCourt(id)));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restoreCourt(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", trashService.restoreCourt(id)));
    }

    /** Xóa vĩnh viễn một sân đang trong thùng rác (chỉ khi chưa từng có lượt đặt). */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Map<String, Object>> permanentlyDeleteCourt(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "message", trashService.permanentlyDeleteCourt(id)));
    }

    /** Số sân lấy từ courtNumber; nếu không có thì rút số từ tên (VD "Sân 3" -> 3), không được thì dùng giá trị mặc định. */
    private int resolveCourtNumber(CourtRequestDto dto, int fallback) {
        if (dto.getCourtNumber() != null) {
            return dto.getCourtNumber();
        }
        if (dto.getName() != null) {
            String digits = dto.getName().replaceAll("\\D+", "");
            if (!digits.isEmpty() && digits.length() <= 2) {
                int n = Integer.parseInt(digits);
                if (n >= 1) return n;
            }
        }
        return fallback;
    }
}
