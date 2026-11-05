package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.membership.BuyMembershipRequest;
import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentMethod;
import com.example.Dat_san_cau_long.model.enums.PaymentPurpose;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.repository.MembershipPackageRepository;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/** Gói hội viên: danh mục gói (admin quản lý) và luồng khách mua gói. */
@Service
public class MembershipService {

    private static final Logger log = LoggerFactory.getLogger(MembershipService.class);

    private static final int DEFAULT_DURATION_DAYS = 30;

    private final MembershipPackageRepository packageRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;

    public MembershipService(MembershipPackageRepository packageRepository,
                             UserMembershipRepository userMembershipRepository,
                             UserRepository userRepository,
                             PaymentRepository paymentRepository,
                             WalletRepository walletRepository) {
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

    /**
     * Khách mua gói hội viên.
     * Luồng: kiểm tra user và gói -> tính ngày bắt đầu/kết thúc -> tạo UserMembership (PENDING)
     * -> tạo Payment. Nếu trả bằng ví thì trừ ví ngay và kích hoạt gói luôn,
     * còn lại chờ admin xác nhận thanh toán (xem WalletService.confirmPayment).
     */
    @Transactional
    public Map<String, Object> buyMembership(BuyMembershipRequest req, User currentUser) {
        User user = resolveBuyer(req, currentUser);
        MembershipPackage pkg = resolvePurchasablePackage(req, user);
        rejectIfPaymentPending(user);

        // Cắt phần lẻ giây vì MySQL làm tròn DATETIME; nếu không, gói vừa mua có thể bị coi là chưa bắt đầu trong khoảnh khắc đầu
        LocalDateTime now = LocalDateTime.now().withNano(0);
        // Gói mới nối tiếp sau gói đang ACTIVE: bắt đầu từ max(bây giờ, ngày hết hạn xa nhất)
        Optional<LocalDateTime> latestEnd = userMembershipRepository.findLatestActiveEndDate(user.getId(), now);
        LocalDateTime startDate = latestEnd.filter(d -> d.isAfter(now)).orElse(now);

        int durationDays = (pkg.getDurationDays() != null && pkg.getDurationDays() > 0)
                ? pkg.getDurationDays()
                : DEFAULT_DURATION_DAYS;
        LocalDateTime endDate = startDate.plusDays(durationDays);

        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String subCode = "SUB-" + dateStr + "-" + pkg.getCode() + "-" + (1000 + new Random().nextInt(9000));
        PaymentMethod method = PaymentMethod.fromStringOrDefault(req.getPaymentMethod());

        // Gói luôn được tạo ở trạng thái PENDING
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

        Payment payment = Payment.builder()
                .paymentCode("PAY-MEM-" + dateStr + "-" + (1000 + new Random().nextInt(9000)))
                .purpose(PaymentPurpose.MEMBERSHIP)
                .user(user)
                .userMembership(subscription)
                .amount(pkg.getPrice())
                .method(method)
                .status(PaymentStatus.PENDING)
                .build();

        if (method == PaymentMethod.WALLET) {
            // Trừ ví bằng một câu UPDATE atomic; không đủ số dư thì cả transaction bị hoàn tác
            int updated = walletRepository.deductBalanceAtomic(user.getId(), pkg.getPrice());
            if (updated == 0) {
                throw new IllegalStateException("Số dư ví không đủ để thanh toán gói hội viên!");
            }
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(now);
            subscription.setStatus(MembershipStatus.ACTIVE);
            subscription = userMembershipRepository.save(subscription);
            log.info("User {} thanh toán gói hội viên {} thành công qua Ví", user.getUsername(), pkg.getName());
        }

        payment = paymentRepository.save(payment);

        return buildPurchaseResponse(subscription, payment, pkg, durationDays);
    }

    /** Đã có gói đang chờ thanh toán thì không cho đăng ký thêm, tránh tạo nhiều yêu cầu chờ trùng nhau. */
    private void rejectIfPaymentPending(User user) {
        userMembershipRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), MembershipStatus.PENDING)
                .ifPresent(pending -> {
                    throw new IllegalStateException("Bạn đang có gói " + pending.getMembershipPackage().getName()
                            + " chờ xác nhận thanh toán (mã " + pending.getSubscriptionCode()
                            + "). Hãy hoàn tất thanh toán hoặc hủy yêu cầu đó trước khi đăng ký gói mới!");
                });
    }

    /**
     * Hủy yêu cầu đăng ký gói đang chờ thanh toán: gói chuyển sang CANCELLED và giao dịch liên quan sang FAILED.
     * Chỉ chủ gói (hoặc admin) hủy được, và chỉ khi gói còn PENDING.
     */
    @Transactional
    public Map<String, Object> cancelPendingMembership(Long membershipId, User requester) {
        UserMembership membership = userMembershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đăng ký gói hội viên ID: " + membershipId));

        boolean isOwner = requester != null && membership.getUser().getId().equals(requester.getId());
        boolean isAdmin = requester != null && requester.getRole() == UserRole.ROLE_ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền hủy đăng ký của người khác!");
        }
        if (membership.getStatus() != MembershipStatus.PENDING) {
            throw new IllegalStateException("Chỉ hủy được đăng ký đang chờ thanh toán!");
        }

        membership.setStatus(MembershipStatus.CANCELLED);
        userMembershipRepository.save(membership);
        for (Payment payment : paymentRepository.findByUserMembershipId(membershipId)) {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
        }
        return Map.of("success", true, "message", "Đã hủy yêu cầu đăng ký gói " + membership.getMembershipPackage().getName() + "!");
    }

    /** Người mua: ưu tiên user đang đăng nhập, nếu không có thì tìm theo userId trong request. */
    private User resolveBuyer(BuyMembershipRequest req, User currentUser) {
        if (currentUser != null) {
            return currentUser;
        }
        if (req.getUserId() == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp ID người dùng hoặc đăng nhập!");
        }
        return userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại!"));
    }

    /** Tìm gói và kiểm tra điều kiện mua: gói còn phát hành, gói sinh viên phải đã xác thực. */
    private MembershipPackage resolvePurchasablePackage(BuyMembershipRequest req, User user) {
        if (req.getPackageId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn gói hội viên muốn đăng ký!");
        }

        MembershipPackage pkg = packageRepository.findById(req.getPackageId())
                .orElseThrow(() -> new IllegalArgumentException("Gói hội viên không tồn tại!"));

        if (!Boolean.TRUE.equals(pkg.getActive())) {
            throw new IllegalStateException("Gói hội viên này hiện đang tạm ngưng phát hành!");
        }
        if (Boolean.TRUE.equals(pkg.getStudentOnly()) && user.getStudentVerifiedAt() == null) {
            throw new IllegalStateException("Gói hội viên này chỉ dành cho học sinh/sinh viên đã được xác thực!");
        }
        return pkg;
    }

    /** Dữ liệu trả về cho frontend sau khi mua gói. */
    private Map<String, Object> buildPurchaseResponse(UserMembership subscription, Payment payment,
                                                      MembershipPackage pkg, int durationDays) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", subscription.getStatus() == MembershipStatus.ACTIVE
                ? "Đăng ký và kích hoạt gói hội viên " + pkg.getName() + " thành công qua Ví!"
                : "Đăng ký gói hội viên " + pkg.getName() + " thành công! Vui lòng hoàn tất thanh toán để kích hoạt.");
        response.put("subscriptionCode", subscription.getSubscriptionCode());
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
        response.put("startDate", subscription.getStartDate().toString());
        response.put("endDate", subscription.getEndDate().toString());
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
