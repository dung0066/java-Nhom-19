package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.PriceRule;
import com.example.Dat_san_cau_long.model.TimeSlot;
import com.example.Dat_san_cau_long.model.enums.PriceDayType;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.PriceRuleRepository;
import com.example.Dat_san_cau_long.repository.TimeSlotRepository;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
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
    public ResponseEntity<PriceRule> createPriceRule(@Validated(OnCreate.class) @RequestBody PriceRuleDto dto) {
        checkDateRange(dto.getValidFrom(), dto.getValidTo());
        Branch branch = dto.getBranchId() != null ? findBranch(dto.getBranchId()) : null;
        TimeSlot slot = dto.getTimeSlotId() != null ? findTimeSlot(dto.getTimeSlotId()) : null;

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
    public ResponseEntity<PriceRule> updatePriceRule(@PathVariable Long id, @Valid @RequestBody PriceRuleDto dto) {
        PriceRule rule = priceRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quy tắc giá ID: " + id));

        if (dto.getBranchId() != null) {
            rule.setBranch(findBranch(dto.getBranchId()));
        }
        if (dto.getTimeSlotId() != null) {
            rule.setTimeSlot(findTimeSlot(dto.getTimeSlotId()));
        }
        if (dto.getDayType() != null) rule.setDayType(dto.getDayType());
        if (dto.getPrice() != null) rule.setPrice(dto.getPrice());
        if (dto.getPriority() != null) rule.setPriority(dto.getPriority());
        if (dto.getValidFrom() != null) rule.setValidFrom(dto.getValidFrom());
        if (dto.getValidTo() != null) rule.setValidTo(dto.getValidTo());
        if (dto.getActive() != null) rule.setActive(dto.getActive());
        checkDateRange(rule.getValidFrom(), rule.getValidTo());

        return ResponseEntity.ok(priceRuleRepository.save(rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePriceRule(@PathVariable Long id) {
        priceRuleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa quy tắc giá thành công!"));
    }

    private Branch findBranch(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID: " + id));
    }

    private TimeSlot findTimeSlot(Long id) {
        return timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ ID: " + id));
    }

    /** Ngày kết thúc không được trước ngày bắt đầu. */
    private void checkDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && to.isBefore(from)) {
            throw new IllegalArgumentException("Ngày kết thúc áp dụng không được trước ngày bắt đầu!");
        }
    }

    @Getter
    @Setter
    public static class PriceRuleDto {
        private Long branchId;
        private Long timeSlotId;
        private PriceDayType dayType;
        @NotNull(groups = OnCreate.class, message = "Giá không được để trống")
        @DecimalMin(value = "1000", message = "Giá tối thiểu 1.000đ")
        @DecimalMax(value = "100000000", message = "Giá tối đa 100.000.000đ")
        private BigDecimal price;
        @Min(value = 0, message = "Độ ưu tiên từ 0 trở lên")
        @Max(value = 100, message = "Độ ưu tiên tối đa 100")
        private Integer priority;
        private LocalDate validFrom;
        private LocalDate validTo;
        private Boolean active;
    }
}
