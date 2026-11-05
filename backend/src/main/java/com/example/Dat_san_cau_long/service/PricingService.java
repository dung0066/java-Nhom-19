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
    /** Rule có giá từ mức này trở lên được xem là giờ cao điểm. */
    private static final BigDecimal PEAK_PRICE_THRESHOLD = BigDecimal.valueOf(100000);

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

    /**
     * Tìm giá cho một slot. Repository trả các rule phù hợp (chi nhánh, khung giờ, loại ngày)
     * đã sắp theo độ ưu tiên giảm dần, nên rule đầu tiên là rule thắng.
     * Không có rule nào thì dùng giá mặc định 70.000đ.
     */
    public ResolvedPriceInfo resolvePriceInfo(Long branchId, Long timeSlotId, LocalDate date) {
        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        PriceDayType dayType = determineDayType(effectiveDate);

        List<PriceRule> candidates = priceRuleRepository.findCandidateRules(branchId, timeSlotId, effectiveDate, dayType);

        if (!candidates.isEmpty()) {
            PriceRule winningRule = candidates.get(0);

            return ResolvedPriceInfo.builder()
                    .price(winningRule.getPrice())
                    .peak(isPeakRule(winningRule))
                    .standardPrice(DEFAULT_STANDARD_PRICE)
                    .peakPrice(DEFAULT_PEAK_PRICE)
                    .ruleDescription("Rule ID: " + winningRule.getId() + ", Priority: " + winningRule.getPriority())
                    .build();
        }

        // Không có rule nào khớp: dùng giá mặc định
        return ResolvedPriceInfo.builder()
                .price(DEFAULT_STANDARD_PRICE)
                .peak(false)
                .standardPrice(DEFAULT_STANDARD_PRICE)
                .peakPrice(DEFAULT_PEAK_PRICE)
                .ruleDescription("Default fallback rule")
                .build();
    }

    /** Giờ cao điểm: giá từ 100.000đ trở lên, hoặc rule riêng cho một khung giờ có độ ưu tiên lớn hơn 0. */
    private boolean isPeakRule(PriceRule rule) {
        boolean highPrice = rule.getPrice().compareTo(PEAK_PRICE_THRESHOLD) >= 0;
        boolean prioritizedSlotRule = rule.getPriority() != null && rule.getPriority() > 0 && rule.getTimeSlot() != null;
        return highPrice || prioritizedSlotRule;
    }

    /**
     * Số tiền giảm của hội viên cho một slot = giá gốc x % giảm của gói (làm tròn đến đồng).
     * Trả 0 nếu không phải hội viên, gói không có giảm giá, hoặc slot nằm ngoài khung giờ áp dụng
     * (ví dụ gói Sinh Viên chỉ giảm trước 16:30).
     */
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
