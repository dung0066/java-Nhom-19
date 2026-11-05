package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử quản lý tài khoản của admin: không xóa được tài khoản quản trị viên hoặc nhân viên,
 * vẫn xóa được khách hàng chưa có đơn, và xem được thông tin đầy đủ của một tài khoản.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class AdminUserManagementIntegrationTest extends AbstractIntegrationTest {

    private static final AtomicInteger SEQ = new AtomicInteger(0);

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;

    private User admin;
    private String adminToken;

    @BeforeEach
    void setUp() {
        admin = userRepository.findByUsername("admin").orElseThrow();
        adminToken = "Bearer " + jwtTokenProvider.generateToken(admin);
    }

    private User newUser(UserRole role) {
        int n = SEQ.incrementAndGet();
        return userRepository.save(User.builder()
                .username("mgmt_user_" + n).password("x").fullName("Nguoi Dung Quan Ly " + n)
                .phone("09440000" + String.format("%02d", n)).email("mgmt_user_" + n + "@test.vn")
                .role(role).status(UserStatus.ACTIVE).build());
    }

    @Test
    @DisplayName("Không xóa được tài khoản quản trị viên khác")
    void testCannotDeleteAnotherAdmin() throws Exception {
        User otherAdmin = newUser(UserRole.ROLE_ADMIN);

        mockMvc.perform(delete("/api/admin/users/" + otherAdmin.getId()).header("Authorization", adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("quản trị viên hoặc nhân viên")));

        assertThat(userRepository.existsById(otherAdmin.getId())).isTrue();
    }

    @Test
    @DisplayName("Không xóa được tài khoản nhân viên")
    void testCannotDeleteStaff() throws Exception {
        User staff = newUser(UserRole.ROLE_STAFF);

        mockMvc.perform(delete("/api/admin/users/" + staff.getId()).header("Authorization", adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("quản trị viên hoặc nhân viên")));

        assertThat(userRepository.existsById(staff.getId())).isTrue();
    }

    @Test
    @DisplayName("Nhân viên không có quyền gọi API quản lý tài khoản (kể cả xóa và xem chi tiết)")
    void testStaffCannotManageUsers() throws Exception {
        User staff = newUser(UserRole.ROLE_STAFF);
        User victim = newUser(UserRole.ROLE_USER);
        String staffToken = "Bearer " + jwtTokenProvider.generateToken(staff);

        mockMvc.perform(delete("/api/admin/users/" + victim.getId()).header("Authorization", staffToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/users/" + victim.getId() + "/detail").header("Authorization", staffToken))
                .andExpect(status().isForbidden());
        assertThat(userRepository.existsById(victim.getId())).isTrue();
    }

    @Test
    @DisplayName("Khách hàng chưa có đơn vẫn xóa được, tài khoản admin và nhân viên thì không")
    void testCustomerWithoutBookingsCanBeDeleted() throws Exception {
        User customer = newUser(UserRole.ROLE_USER);

        mockMvc.perform(delete("/api/admin/users/" + customer.getId()).header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertThat(userRepository.existsById(customer.getId())).isFalse();
    }

    @Test
    @DisplayName("Chi tiết tài khoản hội viên: hồ sơ, ví, gói đang dùng và thống kê đơn; không lộ mật khẩu")
    void testUserDetailOfMember() throws Exception {
        User gold = userRepository.findByUsername("hoivien_gold").orElseThrow();

        mockMvc.perform(get("/api/admin/users/" + gold.getId() + "/detail").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("hoivien_gold"))
                .andExpect(jsonPath("$.user.role").value("ROLE_USER"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.walletBalance").isNumber())
                .andExpect(jsonPath("$.membership.packageName", containsString("Vàng")))
                .andExpect(jsonPath("$.membership.discountPercent").value(12.0))
                .andExpect(jsonPath("$.stats.totalBookings").isNumber())
                .andExpect(jsonPath("$.stats.totalSpent").isNumber());
    }

    @Test
    @DisplayName("Chi tiết tài khoản chưa là hội viên: không có gói, ví 0; tài khoản không tồn tại trả 404")
    void testUserDetailOfNonMemberAndUnknown() throws Exception {
        User plain = newUser(UserRole.ROLE_USER);

        mockMvc.perform(get("/api/admin/users/" + plain.getId() + "/detail").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.membership").value(nullValue()))
                .andExpect(jsonPath("$.pendingMembership").value(nullValue()))
                .andExpect(jsonPath("$.walletBalance").value(0))
                .andExpect(jsonPath("$.stats.totalBookings").value(0));

        mockMvc.perform(get("/api/admin/users/999999999/detail").header("Authorization", adminToken))
                .andExpect(status().isNotFound());
    }
}
