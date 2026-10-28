package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.PriceRule;
import com.example.Dat_san_cau_long.model.TimeSlot;
import com.example.Dat_san_cau_long.model.enums.PriceDayType;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.PriceRuleRepository;
import com.example.Dat_san_cau_long.repository.TimeSlotRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/price-rules")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminPriceRuleController {

    private final PriceRuleRepository priceRuleRepository;
    private final BranchRepository branchRepository;
    private final TimeSlotRepository timeSlotRepository;

    public AdminPriceRuleController(PriceRuleRepository priceRuleRepository,
                                    BranchRepository branchRepository,
                                    TimeSlotRepository timeSlotRepository) {
        this.priceRuleRepository = priceRuleRepository;
        this.branchRepository = branchRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    @GetMapping
    public ResponseEntity<List<PriceRule>> getAllPriceRules() {
        return ResponseEntity.ok(priceRuleRepository.findAll());
    }

    @GetMapping("/time-slots")
    public ResponseEntity<List<TimeSlot>> getAllTimeSlots() {
        return ResponseEntity.ok(timeSlotRepository.findAll(Sort.by("sortOrder")));
    }

    @PostMapping
    public ResponseEntity<PriceRule> createPriceRule(@RequestBody PriceRuleDto dto) {
        Branch branch = dto.getBranchId() != null ? branchRepository.findById(dto.getBranchId()).orElse(null) : null;
        TimeSlot slot = dto.getTimeSlotId() != null ? timeSlotRepository.findById(dto.getTimeSlotId()).orElse(null) : null;

        PriceRule rule = PriceRule.builder()
                .branch(branch)
                .timeSlot(slot)
                .dayType(dto.getDayType() != null ? dto.getDayType() : PriceDayType.ALL)
                .price(dto.getPrice())
                .priority(dto.getPriority() != null ? dto.getPriority() : 0)
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return ResponseEntity.ok(priceRuleRepository.save(rule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PriceRule> updatePriceRule(@PathVariable Long id, @RequestBody PriceRuleDto dto) {
        PriceRule rule = priceRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quy tắc giá ID: " + id));

        if (dto.getBranchId() != null) {
            rule.setBranch(branchRepository.findById(dto.getBranchId()).orElse(null));
        }
        if (dto.getTimeSlotId() != null) {
            rule.setTimeSlot(timeSlotRepository.findById(dto.getTimeSlotId()).orElse(null));
        }
        if (dto.getDayType() != null) rule.setDayType(dto.getDayType());
        if (dto.getPrice() != null) rule.setPrice(dto.getPrice());
        if (dto.getPriority() != null) rule.setPriority(dto.getPriority());
        if (dto.getValidFrom() != null) rule.setValidFrom(dto.getValidFrom());
        if (dto.getValidTo() != null) rule.setValidTo(dto.getValidTo());
        if (dto.getActive() != null) rule.setActive(dto.getActive());

        return ResponseEntity.ok(priceRuleRepository.save(rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePriceRule(@PathVariable Long id) {
        priceRuleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa quy tắc giá thành công!"));
    }

    @Getter
    @Setter
    public static class PriceRuleDto {
        private Long branchId;
        private Long timeSlotId;
        private PriceDayType dayType;
        private BigDecimal price;
        private Integer priority;
        private LocalDate validFrom;
        private LocalDate validTo;
        private Boolean active;
    }
}
