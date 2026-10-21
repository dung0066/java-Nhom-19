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
    private final com.example.Dat_san_cau_long.repository.PaymentRepository paymentRepository;
    private final com.example.Dat_san_cau_long.repository.WalletRepository walletRepository;

    public MembershipService(MembershipPackageRepository packageRepository,
                             UserMembershipRepository userMembershipRepository,
                             UserRepository userRepository,
                             com.example.Dat_san_cau_long.repository.PaymentRepository paymentRepository,
                             com.example.Dat_san_cau_long.repository.WalletRepository walletRepository) {
        this.packageRepository = packageRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
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
        return buyMembership(req, null);
    }

    @Transactional
    public Map<String, Object> buyMembership(BuyMembershipRequest req, User currentUser) {
        User user = currentUser;
        if (user == null) {
            if (req.getUserId() == null) {
                throw new IllegalArgumentException("Vui lòng cung cấp ID người dùng hoặc đăng nhập!");
            }
            user = userRepository.findById(req.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại!"));
        }

        if (req.getPackageId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn gói hội viên muốn đăng ký!");
        }

        MembershipPackage pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new IllegalArgumentException("Gói hội viên không tồn tại!"));

        if (!Boolean.TRUE.equals(pkg.getActive())) {
            throw new IllegalStateException("Gói hội viên này hiện đang tạm ngưng phát hành!");
        }

        // Kiểm tra điều kiện gói học sinh/sinh viên
        if (Boolean.TRUE.equals(pkg.getStudentOnly()) && user.getStudentVerifiedAt() == null) {
            throw new IllegalStateException("Gói hội viên này chỉ dành cho học sinh/sinh viên đã được xác thực!");
        }

        LocalDateTime now = LocalDateTime.now();
        // Nối tiếp: max(now, end_date lớn nhất của các gói ACTIVE hiện có)
        Optional<LocalDateTime> latestEnd = userMembershipRepository.findLatestActiveEndDate(user.getId(), now);
        LocalDateTime startDate = latestEnd.filter(d -> d.isAfter(now)).orElse(now);

        int durationDays = (pkg.getDurationDays() != null && pkg.getDurationDays() > 0) ? pkg.getDurationDays() : 30;
        LocalDateTime endDate = startDate.plusDays(durationDays);

        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomCode = 1000 + new Random().nextInt(9000);
        String subCode = "SUB-" + dateStr + "-" + pkg.getCode() + "-" + randomCode;

        // Xác định phương thức thanh toán
        com.example.Dat_san_cau_long.model.enums.PaymentMethod method = com.example.Dat_san_cau_long.model.enums.PaymentMethod.VIETQR;
        if (req.getPaymentMethod() != null) {
            try {
                method = com.example.Dat_san_cau_long.model.enums.PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                method = com.example.Dat_san_cau_long.model.enums.PaymentMethod.VIETQR;
            }
        }

        // Tạo UserMembership trạng thái ban đầu luôn là PENDING
        UserMembership subscription = UserMembership.builder()
                .subscriptionCode(subCode)
                .user(user)
                .membershipPackage(pkg)
                .pricePaid(pkg.getPrice())
                .startDate(startDate)
                .endDate(endDate)
                .status(MembershipStatus.PENDING)
                .notes(req.getNotes() != null ? req.getNotes() : "Đăng ký gói hội viên " + pkg.getName())
                .build();
        subscription = userMembershipRepository.save(subscription);

        // Tạo bản ghi Payment
        String payCode = "PAY-MEM-" + dateStr + "-" + (1000 + new Random().nextInt(9000));
        com.example.Dat_san_cau_long.model.Payment payment = com.example.Dat_san_cau_long.model.Payment.builder()
                .paymentCode(payCode)
                .purpose(com.example.Dat_san_cau_long.model.enums.PaymentPurpose.MEMBERSHIP)
                .user(user)
                .userMembership(subscription)
                .amount(pkg.getPrice())
                .method(method)
                .status(com.example.Dat_san_cau_long.model.enums.PaymentStatus.PENDING)
                .build();

        if (method == com.example.Dat_san_cau_long.model.enums.PaymentMethod.WALLET) {
            int updated = walletRepository.deductBalanceAtomic(user.getId(), pkg.getPrice());
            if (updated == 0) {
                throw new IllegalStateException("Số dư ví không đủ để thanh toán gói hội viên!");
            }
            payment.setStatus(com.example.Dat_san_cau_long.model.enums.PaymentStatus.PAID);
            payment.setPaidAt(now);
            subscription.setStatus(MembershipStatus.ACTIVE);
            subscription = userMembershipRepository.save(subscription);
            log.info("User {} thanh toán gói hội viên {} thành công qua Ví", user.getUsername(), pkg.getName());
        }

        payment = paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", subscription.getStatus() == MembershipStatus.ACTIVE
                ? "Đăng ký và kích hoạt gói hội viên " + pkg.getName() + " thành công qua Ví!"
                : "Đăng ký gói hội viên " + pkg.getName() + " thành công! Vui lòng hoàn tất thanh toán để kích hoạt.");
        response.put("subscriptionCode", subCode);
        response.put("userMembershipId", subscription.getId());
        response.put("membershipStatus", subscription.getStatus().name());
        response.put("paymentId", payment.getId());
        response.put("paymentCode", payment.getPaymentCode());
        response.put("paymentStatus", payment.getStatus().name());
        response.put("paymentMethod", payment.getMethod().name());
        response.put("pricePaid", pkg.getPrice());
        response.put("amount", payment.getAmount());
        response.put("packageName", pkg.getName());
        response.put("discountPercent", pkg.getDiscountPercent());
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
