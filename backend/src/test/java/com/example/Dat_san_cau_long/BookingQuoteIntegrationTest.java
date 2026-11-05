package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import com.example.Dat_san_cau_long.repository.MembershipPackageRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử báo giá đặt sân và giảm giá hội viên: khách vãng lai không giảm, hội viên giảm đúng phần trăm,
 * gói Sinh Viên chỉ giảm trong khung giờ áp dụng, và số tiền báo giá khớp số tiền đơn thật.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class BookingQuoteIntegrationTest extends AbstractIntegrationTest {

    private static final AtomicInteger DAY_OFFSET = new AtomicInteger(400);

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private CourtRepository courtRepository;
    @Autowired private MembershipPackageRepository packageRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    private Long courtId;

    @BeforeEach
    void setUp() {
        courtId = courtRepository.findByBranchIdOrderByCourtNumberAsc(1L).get(0).getId();
    }

    private String bearer(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    private String body(LocalDate date, long... timeSlotIds) throws Exception {
        StringBuilder slots = new StringBuilder();
        for (long id : timeSlotIds) {
            if (slots.length() > 0) slots.append(",");
            slots.append("{\"courtId\":").append(courtId).append(",\"timeSlotId\":").append(id).append("}");
        }
        return "{\"branchCode\":\"NVL\",\"bookingDate\":\"" + date + "\",\"customerName\":\"Khach Quote\","
                + "\"customerPhone\":\"0900123456\",\"selectedSlots\":[" + slots + "]}";
    }

    private JsonNode quote(String body, User user) throws Exception {
        var request = post("/api/booking/quote").contentType(MediaType.APPLICATION_JSON).content(body);
        if (user != null) request.header("Authorization", bearer(user));
        String json = mockMvc.perform(request).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json);
    }

    private LocalDate freshDate() {
        return LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet());
    }

    @Test
    @DisplayName("Khách vãng lai xem được báo giá nhưng không có giảm giá")
    void testAnonymousQuoteHasNoDiscount() throws Exception {
        JsonNode q = quote(body(freshDate(), 18, 19), null);

        assertThat(q.get("slots")).hasSize(2);
        assertThat(q.get("discountAmount").decimalValue()).isEqualByComparingTo("0");
        assertThat(q.get("totalPrice").decimalValue()).isEqualByComparingTo(q.get("originalPrice").decimalValue());
        assertThat(q.get("membershipName").isNull()).isTrue();
    }

    @Test
    @DisplayName("Tài khoản chưa là hội viên không được giảm giá")
    void testNonMemberHasNoDiscount() throws Exception {
        User nonMember = userRepository.findByUsername("khachhang1").orElseThrow();

        JsonNode q = quote(body(freshDate(), 18), nonMember);

        assertThat(q.get("discountAmount").decimalValue()).isEqualByComparingTo("0");
        assertThat(q.get("membershipName").isNull()).isTrue();
    }

    @Test
    @DisplayName("Hội viên Vàng được giảm 12% trên từng slot và tên gói hiện trong báo giá")
    void testGoldMemberGetsPercentDiscount() throws Exception {
        User gold = userRepository.findByUsername("hoivien_gold").orElseThrow();

        JsonNode q = quote(body(freshDate(), 18, 19), gold);

        BigDecimal expectedDiscount = BigDecimal.ZERO;
        for (JsonNode slot : q.get("slots")) {
            BigDecimal price = slot.get("price").decimalValue();
            BigDecimal discount = slot.get("discount").decimalValue();
            assertThat(discount).isEqualByComparingTo(price.multiply(new BigDecimal("0.12")).setScale(0, java.math.RoundingMode.HALF_UP));
            expectedDiscount = expectedDiscount.add(discount);
        }
        assertThat(q.get("discountAmount").decimalValue()).isEqualByComparingTo(expectedDiscount);
        assertThat(q.get("totalPrice").decimalValue())
                .isEqualByComparingTo(q.get("originalPrice").decimalValue().subtract(expectedDiscount));
        assertThat(q.get("membershipName").asText()).contains("Vàng");
        assertThat(q.get("membershipDiscountPercent").decimalValue()).isEqualByComparingTo("12");
    }

    @Test
    @DisplayName("Số tiền báo giá khớp đúng số tiền của đơn thật được tạo ra")
    void testQuoteMatchesCreatedBooking() throws Exception {
        User gold = userRepository.findByUsername("hoivien_gold").orElseThrow();
        String body = body(freshDate(), 18, 19);

        JsonNode q = quote(body, gold);

        String createdJson = mockMvc.perform(post("/api/booking/create")
                        .header("Authorization", bearer(gold))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode created = objectMapper.readTree(createdJson);

        assertThat(created.get("originalPrice").decimalValue()).isEqualByComparingTo(q.get("originalPrice").decimalValue());
        assertThat(created.get("discountAmount").decimalValue()).isEqualByComparingTo(q.get("discountAmount").decimalValue());
        assertThat(created.get("totalPrice").decimalValue()).isEqualByComparingTo(q.get("totalPrice").decimalValue());
    }

    @Test
    @DisplayName("Báo giá đánh dấu slot đã có người đặt là không còn trống")
    void testQuoteFlagsUnavailableSlot() throws Exception {
        LocalDate date = freshDate();
        String body = body(date, 18);
        mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());

        JsonNode q = quote(body, null);

        assertThat(q.get("slots").get(0).get("available").asBoolean()).isFalse();
    }

    @Test
    @DisplayName("Gói Sinh Viên chỉ giảm slot bắt đầu trước 16:30, slot buổi tối không được giảm")
    void testStudentPackageOnlyDiscountsBeforeCutoff() throws Exception {
        User student = userRepository.save(User.builder()
                .username("student_quote").password("x").fullName("Sinh Vien Quote")
                .phone("0911000444").email("student_quote@test.vn")
                .role(UserRole.ROLE_USER).status(UserStatus.ACTIVE)
                .studentVerifiedAt(LocalDateTime.now()).build());
        jdbcTemplate.update("INSERT INTO wallets (user_id, balance) VALUES (?, 1000000)", student.getId());
        Long studentPackageId = packageRepository.findByCode("STUDENT").orElseThrow().getId();

        mockMvc.perform(post("/api/memberships/buy")
                        .header("Authorization", bearer(student))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"packageId\":" + studentPackageId + ",\"paymentMethod\":\"WALLET\"}"))
                .andExpect(status().isOk());

        // Khung giờ 10 (10:00) nằm trong vùng giảm, khung giờ 18 (18:40) nằm ngoài
        JsonNode q = quote(body(freshDate(), 10, 18), student);

        JsonNode morning = q.get("slots").get(0);
        JsonNode evening = q.get("slots").get(1);
        assertThat(morning.get("discount").decimalValue())
                .isEqualByComparingTo(morning.get("price").decimalValue().multiply(new BigDecimal("0.10")).setScale(0, java.math.RoundingMode.HALF_UP));
        assertThat(evening.get("discount").decimalValue()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("Báo giá với ngày sai định dạng hoặc không chọn slot trả 400")
    void testInvalidQuoteInput() throws Exception {
        mockMvc.perform(post("/api/booking/quote").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"branchCode\":\"NVL\",\"bookingDate\":\"khong-phai-ngay\","
                                + "\"selectedSlots\":[{\"courtId\":" + courtId + ",\"timeSlotId\":18}]}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/booking/quote").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"branchCode\":\"NVL\",\"bookingDate\":\"" + freshDate() + "\",\"selectedSlots\":[]}"))
                .andExpect(status().isBadRequest());
    }
}
