package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.ResolvedPriceInfo;
import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.PriceRule;
import com.example.Dat_san_cau_long.model.TimeSlot;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.enums.PriceDayType;
import com.example.Dat_san_cau_long.repository.PriceRuleRepository;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PricingService {

    private static final Logger log = LoggerFactory.getLogger(PricingService.class);

    private static final BigDecimal DEFAULT_STANDARD_PRICE = BigDecimal.valueOf(70000);
    private static final BigDecimal DEFAULT_PEAK_PRICE = BigDecimal.valueOf(120000);

    private final PriceRuleRepository priceRuleRepository;
    private final UserMembershipRepository userMembershipRepository;

    public PricingService(PriceRuleRepository priceRuleRepository,
                          UserMembershipRepository userMembershipRepository) {
        this.priceRuleRepository = priceRuleRepository;
        this.userMembershipRepository = userMembershipRepository;
    }

    public BigDecimal resolvePrice(Long branchId, Long timeSlotId, LocalDate date) {
        return resolvePriceInfo(branchId, timeSlotId, date).getPrice();
    }

    public ResolvedPriceInfo resolvePriceInfo(Long branchId, Long timeSlotId, LocalDate date) {
        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        PriceDayType dayType = determineDayType(effectiveDate);

        List<PriceRule> candidates = priceRuleRepository.findCandidateRules(branchId, timeSlotId, effectiveDate, dayType);

        if (!candidates.isEmpty()) {
            PriceRule winningRule = candidates.get(0);
            BigDecimal resolvedPrice = winningRule.getPrice();

            boolean isPeak = resolvedPrice.compareTo(BigDecimal.valueOf(100000)) >= 0
                    || (winningRule.getPriority() != null && winningRule.getPriority() > 0 && winningRule.getTimeSlot() != null);

            return ResolvedPriceInfo.builder()
                    .price(resolvedPrice)
                    .peak(isPeak)
                    .standardPrice(DEFAULT_STANDARD_PRICE)
                    .peakPrice(DEFAULT_PEAK_PRICE)
                    .ruleDescription("Rule ID: " + winningRule.getId() + ", Priority: " + winningRule.getPriority())
                    .build();
        }

        // Fallback default
        return ResolvedPriceInfo.builder()
                .price(DEFAULT_STANDARD_PRICE)
                .peak(false)
                .standardPrice(DEFAULT_STANDARD_PRICE)
                .peakPrice(DEFAULT_PEAK_PRICE)
                .ruleDescription("Default fallback rule")
                .build();
    }

    public BigDecimal calculateDiscount(BigDecimal originalPrice, User user, TimeSlot timeSlot, LocalDate bookingDate) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0 || user == null) {
            return BigDecimal.ZERO;
        }

        Optional<UserMembership> activeMembershipOpt = userMembershipRepository
                .findActiveMembershipForUser(user.getId(), LocalDateTime.now());

        if (activeMembershipOpt.isEmpty()) {
            return BigDecimal.ZERO;
        }

        UserMembership membership = activeMembershipOpt.get();
        MembershipPackage pkg = membership.getMembershipPackage();
        if (pkg == null || pkg.getDiscountPercent() == null || pkg.getDiscountPercent().compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // Kiểm tra điều kiện khung giờ giảm giá (áp dụng cho gói Sinh Viên trước 16:30)
        if (timeSlot != null && timeSlot.getStartTime() != null) {
            if (pkg.getDiscountFromTime() != null && timeSlot.getStartTime().isBefore(pkg.getDiscountFromTime())) {
                return BigDecimal.ZERO;
            }
            if (pkg.getDiscountToTime() != null && !timeSlot.getStartTime().isBefore(pkg.getDiscountToTime())) {
                return BigDecimal.ZERO;
            }
        }

        BigDecimal discountPercent = pkg.getDiscountPercent();
        return originalPrice.multiply(discountPercent)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
    }

    private PriceDayType determineDayType(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return PriceDayType.WEEKEND;
        }
        return PriceDayType.WEEKDAY;
    }
}
