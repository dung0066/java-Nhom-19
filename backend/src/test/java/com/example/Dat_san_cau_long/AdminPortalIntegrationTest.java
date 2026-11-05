package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminPortalIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private String generateTokenFor(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return jwtTokenProvider.generateToken(user);
    }

    @Test
    @DisplayName("Truy cập API admin không có token bị từ chối 401 Unauthorized")
    void testPublicCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("User thường không có quyền ROLE_ADMIN bị từ chối 403 Forbidden")
    void testNormalUserCannotAccessAdminBranches() throws Exception {
        String userToken = generateTokenFor("khachhang1");
        mockMvc.perform(get("/api/admin/branches")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin lấy danh sách chi nhánh và sân thành công")
    void testAdminCanManageBranchesAndCourts() throws Exception {
        String adminToken = generateTokenFor("admin");

        mockMvc.perform(get("/api/admin/branches")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/admin/courts?branchId=1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Admin xem danh sách đơn đặt sân (phân trang) và xác nhận đơn")
    void testAdminCanManageBookings() throws Exception {
        String adminToken = generateTokenFor("admin");
        Branch branch = branchRepository.findById(1L).orElseThrow();

        Booking booking = Booking.builder()
                .bookingCode("WAY-ADM-" + System.currentTimeMillis())
                .customerName("Admin Test Cust")
                .customerPhone("0987112233")
                .branch(branch)
                .status(BookingStatus.PENDING)
                .build();
        booking = bookingRepository.save(booking);

        // 1. Xem danh sách đơn
        mockMvc.perform(get("/api/admin/bookings?page=0&size=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // 2. Xác nhận đơn
        mockMvc.perform(post("/api/admin/bookings/" + booking.getId() + "/confirm")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("Admin quản lý gói hội viên và lịch sử hội viên")
    void testAdminCanManageMemberships() throws Exception {
        String adminToken = generateTokenFor("admin");

        mockMvc.perform(get("/api/admin/memberships/packages")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/admin/memberships/history")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Admin lấy danh sách quy tắc giá")
    void testAdminCanManagePriceRules() throws Exception {
        String adminToken = generateTokenFor("admin");

        mockMvc.perform(get("/api/admin/price-rules")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
