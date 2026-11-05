package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.dto.WalletTopupRequestDto;
import com.example.Dat_san_cau_long.dto.membership.BuyMembershipRequest;
import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.Wallet;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.*;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.example.Dat_san_cau_long.service.BookingExpirationScheduler;
import com.example.Dat_san_cau_long.service.MembershipService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class MembershipWalletIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private MembershipPackageRepository packageRepository;

    @Autowired
    private UserMembershipRepository userMembershipRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private MembershipService membershipService;

    @Autowired
    private BookingExpirationScheduler expirationScheduler;

    private String generateTokenFor(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return jwtTokenProvider.generateToken(user);
    }

    @Test
    @DisplayName("Lấy danh sách gói hội viên: Có kèm benefits, không đệ quy JSON")
    void testGetActivePackagesWithBenefits() throws Exception {
        mockMvc.perform(get("/api/memberships/packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].benefits").isArray());
    }

    @Test
    @DisplayName("Mua gói Học sinh/Sinh viên thất bại nếu tài khoản chưa được xác thực sinh viên")
    void testBuyStudentPackageFailsWithoutStudentVerification() throws Exception {
        // khachhang1 chưa được xác thực sinh viên
        String token = generateTokenFor("khachhang1");
        User user = userRepository.findByUsername("khachhang1").orElseThrow();
        MembershipPackage studentPkg = packageRepository.findByCode("STUDENT").orElseThrow();

        BuyMembershipRequest req = new BuyMembershipRequest(user.getId(), studentPkg.getId(), "WALLET", "Mua gói SV");

        mockMvc.perform(post("/api/memberships/buy")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Gói hội viên này chỉ dành cho học sinh/sinh viên đã được xác thực!"));
    }

    @Test
    @DisplayName("Mua gói Học sinh/Sinh viên thành công khi tài khoản đã xác thực sinh viên")
    void testBuyStudentPackageSuccessWithVerification() throws Exception {
        User user = userRepository.findByUsername("hoivien_gold").orElseThrow();
        user.setStudentVerifiedAt(LocalDateTime.now());
        user = userRepository.save(user);

        String token = generateTokenFor("hoivien_gold");
        MembershipPackage studentPkg = packageRepository.findByCode("STUDENT").orElseThrow();

        // Nạp thêm ví nếu cần
        walletRepository.addBalanceAtomic(user.getId(), studentPkg.getPrice());

        BigDecimal balanceBefore = walletRepository.findById(user.getId()).orElseThrow().getBalance();

        BuyMembershipRequest req = new BuyMembershipRequest(user.getId(), studentPkg.getId(), "WALLET", "Mua gói SV thành công");

        mockMvc.perform(post("/api/memberships/buy")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.membershipStatus").value("ACTIVE"))
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        BigDecimal balanceAfter = walletRepository.findById(user.getId()).orElseThrow().getBalance();
        assertThat(balanceAfter).isEqualByComparingTo(balanceBefore.subtract(studentPkg.getPrice()));
    }

    @Test
    @DisplayName("Nạp tiền vào ví qua VIETQR và Admin duyệt: Số dư ví tăng đúng số tiền")
    void testWalletTopupAndAdminConfirmFlow() throws Exception {
        User user = userRepository.findByUsername("khachhang1").orElseThrow();
        String userToken = generateTokenFor("khachhang1");
        String adminToken = generateTokenFor("admin");

        BigDecimal topupAmount = BigDecimal.valueOf(300000);
        BigDecimal balanceBefore = walletRepository.findById(user.getId()).map(Wallet::getBalance).orElse(BigDecimal.ZERO);

        // 1. User tạo lệnh nạp ví
        WalletTopupRequestDto topupReq = WalletTopupRequestDto.builder()
                .amount(topupAmount)
                .paymentMethod("VIETQR")
                .notes("Nạp 300k vào ví")
                .build();

        String resStr = mockMvc.perform(post("/api/wallet/topup")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(topupReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();

        Long paymentId = objectMapper.readTree(resStr).get("paymentId").asLong();

        // 2. Admin xác nhận thanh toán
        mockMvc.perform(post("/api/admin/payments/" + paymentId + "/confirm")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("PAID"));

        // 3. User kiểm tra lại số dư
        mockMvc.perform(get("/api/wallet/balance")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(balanceBefore.add(topupAmount)));
    }

    @Test
    @Transactional
    @DisplayName("Scheduler tự động quét và chuyển trạng thái gói hội viên quá hạn sang EXPIRED")
    void testMembershipExpirationScheduler() {
        User user = userRepository.findByUsername("khachhang1").orElseThrow();
        MembershipPackage pkg = packageRepository.findByCode("SILVER").orElseThrow();

        UserMembership expiredMembership = UserMembership.builder()
                .subscriptionCode("SUB-TEST-EXP-" + System.currentTimeMillis())
                .user(user)
                .membershipPackage(pkg)
                .pricePaid(pkg.getPrice())
                .startDate(LocalDateTime.now().minusDays(40))
                .endDate(LocalDateTime.now().minusDays(10)) // Quá hạn 10 ngày
                .status(MembershipStatus.ACTIVE)
                .build();
        expiredMembership = userMembershipRepository.saveAndFlush(expiredMembership);

        // Kích hoạt job quét
        expirationScheduler.expireOldMemberships();

        UserMembership checked = userMembershipRepository.findById(expiredMembership.getId()).orElseThrow();
        assertThat(checked.getStatus()).isEqualTo(MembershipStatus.EXPIRED);
    }
}
