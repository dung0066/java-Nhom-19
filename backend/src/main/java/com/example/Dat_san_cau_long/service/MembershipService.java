package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.membership.BuyMembershipRequest;
import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class MembershipService {

    private static final Logger log = LoggerFactory.getLogger(MembershipService.class);

    private final MembershipPackageRepository packageRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final UserRepository userRepository;

    public MembershipService(MembershipPackageRepository packageRepository, UserMembershipRepository userMembershipRepository, UserRepository userRepository) {
        this.packageRepository = packageRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lấy danh sách các gói hội viên đang mở bán
     */
    public List<MembershipPackage> getActivePackages() {
        return packageRepository.findByActiveTrueOrderByPriceAsc();
    }

    /**
     * Lấy tất cả các gói (dành cho Admin quản lý)
     */
    public List<MembershipPackage> getAllPackagesAdmin() {
        return packageRepository.findAll();
    }

    /**
     * Lấy chi tiết gói hội viên theo ID
     */
    public MembershipPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói hội viên ID: " + id));
    }

    /**
     * Mua / Kích hoạt gói hội viên cho User
     */
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
        LocalDateTime startDate = now;
        
        // Nếu user đang có gói hội viên còn hiệu lực thì gia hạn nối tiếp
        if (user.isMembershipValid() && user.getMembershipExpiresAt().isAfter(now)) {
            startDate = user.getMembershipExpiresAt();
        }

        int durationDays = (pkg.getDurationDays() != null && pkg.getDurationDays() > 0) ? pkg.getDurationDays() : 30;
        LocalDateTime endDate = startDate.plusDays(durationDays);

        // Tạo mã giao dịch đăng ký gói
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomCode = 1000 + new Random().nextInt(9000);
        String subCode = "SUB-" + dateStr + "-" + pkg.getCode() + "-" + randomCode;

        String paymentMethod = (req.getPaymentMethod() != null && !req.getPaymentMethod().isEmpty())
                ? req.getPaymentMethod()
                : "VIETQR";

        UserMembership subscription = UserMembership.builder()
                .subscriptionCode(subCode)
                .user(user)
                .membershipPackage(pkg)
                .pricePaid(pkg.getPrice())
                .discountApplied(0.0)
                .startDate(startDate)
                .endDate(endDate)
                .paymentMethod(paymentMethod)
                .paymentStatus("PAID")
                .transactionCode("TXN-" + System.currentTimeMillis())
                .notes(req.getNotes() != null ? req.getNotes() : "Đăng ký gói hội viên " + pkg.getName())
                .build();

        subscription = userMembershipRepository.save(subscription);

        // Cập nhật thông tin hội viên của User
        user.setMembershipPackage(pkg);
        user.setMembershipExpiresAt(endDate);
        userRepository.save(user);

        log.info("User {} đã mua thành công gói hội viên {} đến ngày {}", user.getUsername(), pkg.getName(), endDate);

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

    /**
     * Lấy thông tin gói hội viên hiện tại đang kích hoạt của User
     */
    public Map<String, Object> getUserActiveMembership(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng!"));

        Map<String, Object> res = new HashMap<>();
        boolean isActive = user.isMembershipValid();
        res.put("isMember", isActive);

        if (isActive && user.getMembershipPackage() != null) {
            res.put("package", user.getMembershipPackage());
            res.put("expiresAt", user.getMembershipExpiresAt());
            res.put("discountPercent", user.getActiveDiscountPercent());
        } else {
            res.put("package", null);
            res.put("expiresAt", null);
            res.put("discountPercent", 0.0);
        }

        return res;
    }

    /**
     * Lấy lịch sử mua gói hội viên của người dùng
     */
    public List<UserMembership> getUserMembershipHistory(Long userId) {
        return userMembershipRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Lấy tất cả lịch sử mua gói trong hệ thống (dành cho Admin)
     */
    public List<UserMembership> getAllMembershipsAdmin() {
        return userMembershipRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Admin: Thêm mới gói hội viên
     */
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

    /**
     * Admin: Cập nhật gói hội viên
     */
    @Transactional
    public MembershipPackage updatePackage(Long id, MembershipPackage updateData) {
        MembershipPackage existing = packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói hội viên ID: " + id));

        if (updateData.getName() != null) existing.setName(updateData.getName());
        if (updateData.getPrice() != null) existing.setPrice(updateData.getPrice());
        if (updateData.getDurationDays() != null) existing.setDurationDays(updateData.getDurationDays());
        if (updateData.getDiscountPercent() != null) existing.setDiscountPercent(updateData.getDiscountPercent());
        if (updateData.getPerks() != null) existing.setPerks(updateData.getPerks());
        if (updateData.getDescription() != null) existing.setDescription(updateData.getDescription());
        if (updateData.getBadgeColor() != null) existing.setBadgeColor(updateData.getBadgeColor());
        if (updateData.getIcon() != null) existing.setIcon(updateData.getIcon());
        if (updateData.getActive() != null) existing.setActive(updateData.getActive());

        return packageRepository.save(existing);
    }

    /**
     * Admin: Xóa hoặc tắt hoạt động gói hội viên
     */
    @Transactional
    public void deletePackage(Long id) {
        MembershipPackage existing = packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy gói hội viên ID: " + id));
        // Đặt active = false để không ảnh hưởng dữ liệu lịch sử
        existing.setActive(false);
        packageRepository.save(existing);
    }
}
