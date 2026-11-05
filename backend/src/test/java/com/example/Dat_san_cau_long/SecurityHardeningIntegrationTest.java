package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử các biện pháp chặn tấn công: truy cập trái phép (IDOR), giả mạo người đặt,
 * brute force đăng nhập, dò OTP, SQL injection, token giả và security headers.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class SecurityHardeningIntegrationTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private BookingRepository bookingRepository;

    private User admin;
    private User owner;
    private User stranger;

    @BeforeEach
    void setUp() {
        admin = userRepository.findByUsername("admin").orElseThrow();
        owner = userRepository.findByUsername("hoivien_gold").orElseThrow();
        stranger = userRepository.findByUsername("khachhang1").orElseThrow();
    }

    private String bearer(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    /** Mỗi test dùng địa chỉ IP riêng để bộ đếm chống brute force không ảnh hưởng các test khác. */
    private RequestPostProcessor fromIp(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    private Booking saveBookingOf(User user, String phone) {
        Branch branch = branchRepository.findById(1L).orElseThrow();
        return bookingRepository.save(Booking.builder()
                .bookingCode("WAY-SEC-" + System.nanoTime())
                .customerName("Khach Test").customerPhone(phone)
                .branch(branch).user(user).status(BookingStatus.PENDING).build());
    }

    // ---------- Truy cập trái phép ----------

    @Test
    @DisplayName("Đường dẫn chưa khai báo mặc định bắt buộc đăng nhập (401)")
    void testUnknownEndpointRequiresLogin() throws Exception {
        mockMvc.perform(get("/api/something-not-declared")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Ghi dữ liệu sân và chi nhánh khi chưa đăng nhập bị từ chối, người dùng thường bị 403")
    void testCatalogWritesAreProtected() throws Exception {
        mockMvc.perform(delete("/api/courts/1")).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/branches/1")).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/courts/1").header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Danh sách toàn bộ đơn đặt chỉ dành cho nhân viên và admin")
    void testAllBookingsListIsRestricted() throws Exception {
        mockMvc.perform(get("/api/booking/all")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/booking/all").header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/booking/all").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Chỉ chủ đơn hoặc admin mới hủy được đơn; người lạ và khách chưa đăng nhập bị chặn")
    void testCancelBookingOwnership() throws Exception {
        Booking booking = saveBookingOf(owner, "0900000101");

        mockMvc.perform(delete("/api/booking/cancel/" + booking.getId()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/booking/cancel/" + booking.getId()).header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        assertThat(bookingRepository.findById(booking.getId()).orElseThrow().getStatus()).isNotEqualTo(BookingStatus.CANCELLED);

        mockMvc.perform(delete("/api/booking/cancel/" + booking.getId()).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());
        assertThat(bookingRepository.findById(booking.getId()).orElseThrow().getStatus()).isEqualTo(BookingStatus.CANCELLED);

        Booking other = saveBookingOf(owner, "0900000102");
        mockMvc.perform(delete("/api/booking/cancel/" + other.getId()).header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Chỉ xem được đơn và hội viên của chính mình (chống IDOR)")
    void testUserScopedDataIsPrivate() throws Exception {
        mockMvc.perform(get("/api/booking/user/" + owner.getId()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/booking/user/" + owner.getId()).header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/booking/user/" + owner.getId()).header("Authorization", bearer(owner)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/memberships/user/" + owner.getId() + "/active").header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/memberships/user/" + owner.getId() + "/active").header("Authorization", bearer(owner)))
                .andExpect(status().isOk());
    }

    // ---------- Giả mạo người đặt ----------

    @Test
    @DisplayName("Khách gửi userId của người khác khi đặt sân không được gắn vào tài khoản đó")
    void testBookingIgnoresSpoofedUserId() throws Exception {
        BookingRequestDto req = new BookingRequestDto();
        req.setBranchCode("NVL");
        req.setBookingDate(LocalDate.now().plusDays(45).toString());
        req.setCustomerName("Ke Gia Mao");
        req.setCustomerPhone("0900000103");
        req.setUserId(owner.getId()); // cố tình giả userId của hội viên để hưởng giảm giá

        BookingRequestDto.SlotItemDto slot = new BookingRequestDto.SlotItemDto();
        slot.setCourtId(2L);
        slot.setTimeSlotId(17L);
        req.setSelectedSlots(List.of(slot));

        mockMvc.perform(post("/api/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.discountAmount").value(0));

        List<Booking> bookings = bookingRepository.findByCustomerPhone("0900000103");
        assertThat(bookings).hasSize(1);
        assertThat(bookings.get(0).getUser()).isNull();
    }

    // ---------- Tra cứu đơn ----------

    @Test
    @DisplayName("Tra cứu chỉ khớp chính xác mã đơn hoặc số điện thoại đầy đủ")
    void testLookupIsExactMatchOnly() throws Exception {
        Booking booking = saveBookingOf(null, "0900000104");

        mockMvc.perform(get("/api/booking/lookup").param("query", "Khach"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/booking/lookup").param("query", "09000001"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/booking/lookup").param("query", "0900000104"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookingCode").value(booking.getBookingCode()));
        mockMvc.perform(get("/api/booking/lookup").param("query", booking.getBookingCode().toLowerCase()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(booking.getId()));
    }

    // ---------- Brute force, OTP, SQL injection ----------

    @Test
    @DisplayName("Đăng nhập sai 5 lần thì IP bị khóa (429), IP khác không bị ảnh hưởng")
    void testLoginBruteForceLockout() throws Exception {
        String body = "{\"username\":\"admin\",\"identifier\":\"admin\",\"password\":\"sai-mat-khau\"}";
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login").with(fromIp("10.9.0.1"))
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/auth/login").with(fromIp("10.9.0.1"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message", containsString("đăng nhập sai quá nhiều lần")));

        // Bị khóa thì ngay cả mật khẩu đúng cũng không vào được từ IP đó
        mockMvc.perform(post("/api/auth/login").with(fromIp("10.9.0.1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"identifier\":\"admin\",\"password\":\"123456\"}"))
                .andExpect(status().isTooManyRequests());

        // IP khác vẫn đăng nhập bình thường
        mockMvc.perform(post("/api/auth/login").with(fromIp("10.9.0.2"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"identifier\":\"admin\",\"password\":\"123456\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Gọi API quên mật khẩu và OTP quá 5 lần trong 10 phút bị chặn (429)")
    void testOtpEndpointsAreRateLimited() throws Exception {
        // Gửi JSON hỏng để bị từ chối ngay ở tầng đọc dữ liệu, tuyệt đối không kích hoạt gửi mail
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/forgot-password/send-otp").with(fromIp("10.9.0.3"))
                            .contentType(MediaType.APPLICATION_JSON).content("khong-phai-json"))
                    .andExpect(status().isBadRequest());
        }
        mockMvc.perform(post("/api/auth/forgot-password/send-otp").with(fromIp("10.9.0.3"))
                        .contentType(MediaType.APPLICATION_JSON).content("khong-phai-json"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    @DisplayName("Chuỗi SQL injection ở ô đăng nhập không vượt qua được xác thực")
    void testSqlInjectionOnLoginIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login").with(fromIp("10.9.0.4"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"' OR '1'='1\",\"identifier\":\"' OR '1'='1\",\"password\":\"' OR '1'='1\"}"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- Token và headers ----------

    @Test
    @DisplayName("Token giả hoặc sai chữ ký bị từ chối 401")
    void testForgedTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized());

        String real = jwtTokenProvider.generateToken(admin);
        String tampered = real.substring(0, real.length() - 3) + (real.endsWith("AAA") ? "BBB" : "AAA");
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tampered))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Endpoint gửi mail thử chỉ dành cho admin")
    void testTestMailEndpointIsAdminOnly() throws Exception {
        mockMvc.perform(post("/api/auth/test-mail")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/test-mail").header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Phản hồi có các security headers chống clickjacking và đoán kiểu nội dung")
    void testSecurityHeadersPresent() throws Exception {
        mockMvc.perform(get("/api/booking/branches"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")))
                .andExpect(header().exists("Referrer-Policy"));
    }
}
