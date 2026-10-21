package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.membership.BuyMembershipRequest;
import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import com.example.Dat_san_cau_long.repository.MembershipPackageRepository;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class MembershipService {

    private static final Logger log = LoggerFactory.getLogger(MembershipService.class);

    private final MembershipPackageRepository packageRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final UserRepository userRepository;

    public MembershipService(MembershipPackageRepository packageRepository,
                             UserMembershipRepository userMembershipRepository,
                             UserRepository userRepository) {
        this.packageRepository = packageRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.userRepository = userRepository;
    }

    public List<MembershipPackage> getActivePackages() {
        return packageRepository.findByActiveTrueOrderByPriceAsc();
    }

    public List<MembershipPackage> getAllPackagesAdmin() {
        return packageRepository.findAll();
    }

    public MembershipPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói hội viên ID: " + id));
    }

    @Transactional
    public Map<String, Object> buyMembership(BuyMembershipRequest req) {
        if (req.getUserId() == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp ID người dùng!");
        }
        if (req.getPackageId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn gói hội viên muốn đăng ký!");
        }

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại!"));

        MembershipPackage pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new IllegalArgumentException("Gói hội viên không tồn tại!"));

        if (!Boolean.TRUE.equals(pkg.getActive())) {
            throw new IllegalStateException("Gói hội viên này hiện đang tạm ngưng phát hành!");
        }

        LocalDateTime now = LocalDateTime.now();
        // Nối tiếp: max(now, end_date lớn nhất của các gói ACTIVE hiện có)
        Optional<LocalDateTime> latestEnd = userMembershipRepository.findLatestActiveEndDate(user.getId(), now);
        LocalDateTime startDate = latestEnd.map(date -> date.isAfter(now) ? date : now).orElse(now);

        int durationDays = (pkg.getDurationDays() != null && pkg.getDurationDays() > 0) ? pkg.getDurationDays() : 30;
        LocalDateTime endDate = startDate.plusDays(durationDays);

        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomCode = 1000 + new Random().nextInt(9000);
        String subCode = "SUB-" + dateStr + "-" + pkg.getCode() + "-" + randomCode;

        UserMembership subscription = UserMembership.builder()
                .subscriptionCode(subCode)
                .user(user)
                .membershipPackage(pkg)
                .pricePaid(pkg.getPrice())
                .startDate(startDate)
                .endDate(endDate)
                .status(MembershipStatus.ACTIVE)
                .notes(req.getNotes() != null ? req.getNotes() : "Đăng ký gói hội viên " + pkg.getName())
                .build();

        subscription = userMembershipRepository.save(subscription);

        log.info("User {} đã kích hoạt gói hội viên {} đến ngày {}", user.getUsername(), pkg.getName(), endDate);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng ký gói hội viên " + pkg.getName() + " thành công!");
        response.put("subscriptionCode", subCode);
        response.put("packageName", pkg.getName());
        response.put("discountPercent", pkg.getDiscountPercent());
        response.put("pricePaid", pkg.getPrice());
        response.put("startDate", startDate.toString());
        response.put("endDate", endDate.toString());
        response.put("durationDays", durationDays);

        return response;
    }

    public Map<String, Object> getUserActiveMembership(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        Optional<UserMembership> activeOpt = userMembershipRepository.findActiveMembershipForUser(userId, now);

        Map<String, Object> res = new HashMap<>();
        if (activeOpt.isPresent()) {
            UserMembership um = activeOpt.get();
            res.put("isMember", true);
            res.put("package", um.getMembershipPackage());
            res.put("membershipPackage", um.getMembershipPackage());
            res.put("expiresAt", um.getEndDate());
            res.put("membershipExpiresAt", um.getEndDate());
            res.put("discountPercent", um.getMembershipPackage().getDiscountPercent());
        } else {
            res.put("isMember", false);
            res.put("package", null);
            res.put("membershipPackage", null);
            res.put("expiresAt", null);
            res.put("membershipExpiresAt", null);
            res.put("discountPercent", 0.0);
        }
        return res;
    }

    public List<UserMembership> getUserMembershipHistory(Long userId) {
        return userMembershipRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<UserMembership> getAllMembershipsAdmin() {
        return userMembershipRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public MembershipPackage createPackage(MembershipPackage pkg) {
        if (pkg.getCode() == null || pkg.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã gói hội viên không được để trống!");
        }
        if (packageRepository.existsByCode(pkg.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Mã gói hội viên '" + pkg.getCode() + "' đã tồn tại!");
        }
        pkg.setCode(pkg.getCode().trim().toUpperCase());
        return packageRepository.save(pkg);
    }

    @Transactional
    public MembershipPackage updatePackage(Long id, MembershipPackage updateData) {
        MembershipPackage existing = packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói hội viên ID: " + id));

        if (updateData.getName() != null) existing.setName(updateData.getName());
        if (updateData.getPrice() != null) existing.setPrice(updateData.getPrice());
        if (updateData.getDurationDays() != null) existing.setDurationDays(updateData.getDurationDays());
        if (updateData.getDiscountPercent() != null) existing.setDiscountPercent(updateData.getDiscountPercent());
        if (updateData.getDescription() != null) existing.setDescription(updateData.getDescription());
        if (updateData.getBadgeColor() != null) existing.setBadgeColor(updateData.getBadgeColor());
        if (updateData.getIcon() != null) existing.setIcon(updateData.getIcon());
        if (updateData.getActive() != null) existing.setActive(updateData.getActive());

        return packageRepository.save(existing);
    }

    @Transactional
    public void deletePackage(Long id) {
        MembershipPackage existing = packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói hội viên ID: " + id));
        existing.setActive(false);
        packageRepository.save(existing);
    }
}
