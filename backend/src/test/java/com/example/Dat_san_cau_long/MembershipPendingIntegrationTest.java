package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.MembershipPackage;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.MembershipPackageRepository;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import com.example.Dat_san_cau_long.repository.UserMembershipRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử gói hội viên đang chờ thanh toán: không đăng ký chồng, chủ gói hủy được yêu cầu chờ,
 * người khác không hủy được, và giao dịch đã hủy không thể được admin xác nhận nữa.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class MembershipPendingIntegrationTest extends AbstractIntegrationTest {

    private static final AtomicInteger USER_SEQ = new AtomicInteger(0);

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private MembershipPackageRepository packageRepository;
    @Autowired private UserMembershipRepository userMembershipRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    /** Mỗi test dùng một người dùng mới để không dính gói chờ của test khác. */
    private User newUser() {
        int n = USER_SEQ.incrementAndGet();
        return userRepository.save(User.builder()
                .username("pending_user_" + n).password("x").fullName("Nguoi Dung " + n)
                .phone("09220000" + String.format("%02d", n)).email("pending_user_" + n + "@test.vn")
                .role(UserRole.ROLE_USER).status(UserStatus.ACTIVE).build());
    }

    private String bearer(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    private Long packageId(String code) {
        return packageRepository.findByCode(code).map(MembershipPackage::getId).orElseThrow();
    }

    private String buyBody(String code, String method) {
        return "{\"packageId\":" + packageId(code) + ",\"paymentMethod\":\"" + method + "\"}";
    }

    private UserMembership pendingOf(User user) {
        return userMembershipRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), MembershipStatus.PENDING)
                .orElseThrow();
    }

    @Test
    @DisplayName("Đang có gói chờ thanh toán thì không đăng ký thêm gói khác")
    void testCannotBuyWhilePending() throws Exception {
        User user = newUser();

        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("SILVER", "VIETQR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.membershipStatus").value("PENDING"));

        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("GOLD", "VIETQR")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("chờ xác nhận thanh toán")));

        assertThat(userMembershipRepository.findByUserIdOrderByCreatedAtDesc(user.getId())).hasSize(1);
    }

    @Test
    @DisplayName("Chủ gói hủy yêu cầu chờ: gói thành CANCELLED, giao dịch thành FAILED và đăng ký lại được")
    void testOwnerCancelsPendingThenCanBuyAgain() throws Exception {
        User user = newUser();
        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("SILVER", "VIETQR")))
                .andExpect(status().isOk());
        UserMembership pending = pendingOf(user);

        mockMvc.perform(post("/api/memberships/" + pending.getId() + "/cancel").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(userMembershipRepository.findById(pending.getId()).orElseThrow().getStatus())
                .isEqualTo(MembershipStatus.CANCELLED);
        List<Payment> payments = paymentRepository.findByUserMembershipId(pending.getId());
        assertThat(payments).hasSize(1);
        assertThat(payments.get(0).getStatus()).isEqualTo(PaymentStatus.FAILED);

        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("GOLD", "VIETQR")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Người khác không hủy được gói chờ của bạn, khách chưa đăng nhập bị 401")
    void testStrangerCannotCancel() throws Exception {
        User owner = newUser();
        User stranger = newUser();
        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("SILVER", "VIETQR")))
                .andExpect(status().isOk());
        UserMembership pending = pendingOf(owner);

        mockMvc.perform(post("/api/memberships/" + pending.getId() + "/cancel").header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/memberships/" + pending.getId() + "/cancel"))
                .andExpect(status().isUnauthorized());

        assertThat(userMembershipRepository.findById(pending.getId()).orElseThrow().getStatus())
                .isEqualTo(MembershipStatus.PENDING);
    }

    @Test
    @DisplayName("Gói đã kích hoạt (mua bằng ví) không thể hủy bằng chức năng hủy yêu cầu chờ")
    void testCannotCancelActiveMembership() throws Exception {
        User user = newUser();
        jdbcTemplate.update("INSERT INTO wallets (user_id, balance) VALUES (?, 1000000)", user.getId());
        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("SILVER", "WALLET")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.membershipStatus").value("ACTIVE"));
        UserMembership active = userMembershipRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).get(0);

        mockMvc.perform(post("/api/memberships/" + active.getId() + "/cancel").header("Authorization", bearer(user)))
                .andExpect(status().isConflict());
        assertThat(userMembershipRepository.findById(active.getId()).orElseThrow().getStatus())
                .isEqualTo(MembershipStatus.ACTIVE);
    }

    @Test
    @DisplayName("Giao dịch của gói đã hủy không thể được admin xác nhận để kích hoạt lại")
    void testAdminCannotConfirmCancelledPayment() throws Exception {
        User user = newUser();
        User admin = userRepository.findByUsername("admin").orElseThrow();
        mockMvc.perform(post("/api/memberships/buy").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(buyBody("SILVER", "VIETQR")))
                .andExpect(status().isOk());
        UserMembership pending = pendingOf(user);
        Long paymentId = paymentRepository.findByUserMembershipId(pending.getId()).get(0).getId();
        mockMvc.perform(post("/api/memberships/" + pending.getId() + "/cancel").header("Authorization", bearer(user)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/payments/" + paymentId + "/confirm").header("Authorization", bearer(admin)))
                .andExpect(status().isConflict());
        assertThat(userMembershipRepository.findById(pending.getId()).orElseThrow().getStatus())
                .isEqualTo(MembershipStatus.CANCELLED);
    }
}
