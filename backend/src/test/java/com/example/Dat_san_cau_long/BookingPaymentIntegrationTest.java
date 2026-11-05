package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentMethod;
import com.example.Dat_san_cau_long.model.enums.PaymentPurpose;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.BookingDetailRepository;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.example.Dat_san_cau_long.service.BookingExpirationScheduler;
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
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử thanh toán đơn đặt sân: đơn chờ thanh toán kèm giao dịch, trả bằng ví, duyệt của admin,
 * hủy và hoàn ví, hết hạn giữ chỗ, và chặn đặt slot đã qua giờ.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class BookingPaymentIntegrationTest extends AbstractIntegrationTest {

    private static final AtomicInteger DAY_OFFSET = new AtomicInteger(600);
    private static final AtomicInteger USER_SEQ = new AtomicInteger(0);

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private CourtRepository courtRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private BookingDetailRepository bookingDetailRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BookingExpirationScheduler scheduler;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User admin;
    private Long courtId;

    @BeforeEach
    void setUp() {
        admin = userRepository.findByUsername("admin").orElseThrow();
        courtId = courtRepository.findByBranchIdOrderByCourtNumberAsc(1L).get(0).getId();
    }

    // ---------- Hàm dựng dữ liệu ----------

    private String bearer(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    private User newUser(long walletBalance) {
        int n = USER_SEQ.incrementAndGet();
        User user = userRepository.save(User.builder()
                .username("bkpay_user_" + n).password("x").fullName("Khach Thanh Toan " + n)
                .phone("09330000" + String.format("%02d", n)).email("bkpay_user_" + n + "@test.vn")
                .role(UserRole.ROLE_USER).status(UserStatus.ACTIVE).build());
        jdbcTemplate.update("INSERT INTO wallets (user_id, balance) VALUES (?, ?)", user.getId(), walletBalance);
        return user;
    }

    private BigDecimal walletOf(User user) {
        return jdbcTemplate.queryForObject("SELECT balance FROM wallets WHERE user_id = ?", BigDecimal.class, user.getId());
    }

    private LocalDate freshDate() {
        return LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet());
    }

    private String body(LocalDate date, String paymentType, long... timeSlotIds) {
        StringBuilder slots = new StringBuilder();
        for (long id : timeSlotIds) {
            if (slots.length() > 0) slots.append(",");
            slots.append("{\"courtId\":").append(courtId).append(",\"timeSlotId\":").append(id).append("}");
        }
        return "{\"branchCode\":\"NVL\",\"bookingDate\":\"" + date + "\",\"customerName\":\"Khach Test\","
                + "\"customerPhone\":\"0900123456\",\"paymentType\":\"" + paymentType + "\",\"selectedSlots\":[" + slots + "]}";
    }

    private JsonNode create(String body, User user) throws Exception {
        var request = post("/api/booking/create").contentType(MediaType.APPLICATION_JSON).content(body);
        if (user != null) request.header("Authorization", bearer(user));
        String json = mockMvc.perform(request).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json);
    }

    private Payment paymentOf(JsonNode created) {
        List<Payment> payments = paymentRepository.findByBookingId(created.get("bookingId").asLong());
        assertThat(payments).hasSize(1);
        return payments.get(0);
    }

    private Booking bookingOf(JsonNode created) {
        return bookingRepository.findById(created.get("bookingId").asLong()).orElseThrow();
    }

    // ---------- VietQR và tiền mặt: đơn chờ thanh toán ----------

    @Test
    @DisplayName("VietQR: đơn ở trạng thái PENDING có giữ chỗ và một giao dịch PENDING đúng số tiền sau giảm giá")
    void testVietQrBookingIsPendingWithPayment() throws Exception {
        User gold = userRepository.findByUsername("hoivien_gold").orElseThrow();

        JsonNode created = create(body(freshDate(), "VIETQR", 18, 19), gold);

        assertThat(created.get("status").asText()).isEqualTo("PENDING");
        assertThat(created.get("holdExpiresAt").isNull()).isFalse();
        assertThat(created.get("paymentStatus").asText()).isEqualTo("PENDING");
        assertThat(created.get("paymentMethod").asText()).isEqualTo("VIETQR");

        Payment payment = paymentOf(created);
        assertThat(payment.getPurpose()).isEqualTo(PaymentPurpose.BOOKING);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payment.getAmount()).isEqualByComparingTo(created.get("totalPrice").decimalValue());
        assertThat(payment.getPaymentCode()).isEqualTo(created.get("paymentCode").asText());
        assertThat(created.get("discountAmount").decimalValue()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Tiền mặt: đơn PENDING chờ thanh toán tại quầy kèm giao dịch CASH")
    void testCashBookingIsPending() throws Exception {
        JsonNode created = create(body(freshDate(), "CASH", 10), null);

        assertThat(created.get("status").asText()).isEqualTo("PENDING");
        Payment payment = paymentOf(created);
        assertThat(payment.getMethod()).isEqualTo(PaymentMethod.CASH);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    @DisplayName("Admin duyệt giao dịch của đơn: giao dịch PAID, đơn CONFIRMED và hết hạn giữ chỗ")
    void testAdminConfirmsBookingPayment() throws Exception {
        JsonNode created = create(body(freshDate(), "VIETQR", 10), null);
        Payment payment = paymentOf(created);

        mockMvc.perform(post("/api/admin/payments/" + payment.getId() + "/confirm").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));

        assertThat(bookingOf(created).getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(bookingOf(created).getHoldExpiresAt()).isNull();
    }

    @Test
    @DisplayName("Admin xác nhận đơn trực tiếp cũng chuyển giao dịch đang chờ sang PAID")
    void testAdminConfirmBookingMarksPaymentPaid() throws Exception {
        JsonNode created = create(body(freshDate(), "VIETQR", 10), null);

        mockMvc.perform(post("/api/admin/bookings/" + created.get("bookingId").asLong() + "/confirm")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        assertThat(paymentOf(created).getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(paymentOf(created).getPaidAt()).isNotNull();
    }

    // ---------- Thanh toán bằng ví ----------

    @Test
    @DisplayName("Ví đủ tiền: trừ đúng số tiền, đơn CONFIRMED ngay và giao dịch PAID bằng WALLET")
    void testWalletPaymentConfirmsImmediately() throws Exception {
        User user = newUser(500000);

        JsonNode created = create(body(freshDate(), "WALLET", 10), user);

        BigDecimal total = created.get("totalPrice").decimalValue();
        assertThat(created.get("status").asText()).isEqualTo("CONFIRMED");
        assertThat(created.get("paymentStatus").asText()).isEqualTo("PAID");
        assertThat(walletOf(user)).isEqualByComparingTo(BigDecimal.valueOf(500000).subtract(total));
        Payment payment = paymentOf(created);
        assertThat(payment.getMethod()).isEqualTo(PaymentMethod.WALLET);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    @DisplayName("Ví không đủ tiền: báo 409, ví không đổi và slot không bị giữ")
    void testWalletInsufficientBalanceRollsBack() throws Exception {
        User user = newUser(1000);
        LocalDate date = freshDate();

        mockMvc.perform(post("/api/booking/create").header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON).content(body(date, "WALLET", 10)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Số dư ví không đủ")));

        assertThat(walletOf(user)).isEqualByComparingTo("1000");
        assertThat(bookingDetailRepository.findActiveBookingsByBranchAndDate("NVL", date)).isEmpty();
    }

    @Test
    @DisplayName("Khách chưa đăng nhập không thể chọn thanh toán bằng ví")
    void testWalletRequiresLogin() throws Exception {
        mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON)
                        .content(body(freshDate(), "WALLET", 10)))
                .andExpect(status().isBadRequest());
    }

    // ---------- Hủy đơn, hoàn ví, hết hạn ----------

    @Test
    @DisplayName("Hủy đơn đang chờ: giao dịch chuyển FAILED; hủy lần hai không tác động thêm")
    void testCancelPendingBookingFailsPayment() throws Exception {
        User user = newUser(0);
        JsonNode created = create(body(freshDate(), "VIETQR", 10), user);
        Long bookingId = created.get("bookingId").asLong();

        mockMvc.perform(delete("/api/booking/cancel/" + bookingId).header("Authorization", bearer(user)))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/booking/cancel/" + bookingId).header("Authorization", bearer(user)))
                .andExpect(status().isOk());

        assertThat(bookingOf(created).getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(paymentOf(created).getStatus()).isEqualTo(PaymentStatus.FAILED);
    }

    @Test
    @DisplayName("Hủy đơn đã trả bằng ví: hoàn đủ tiền vào ví, giao dịch REFUNDED và không hoàn hai lần")
    void testCancelWalletBookingRefundsOnce() throws Exception {
        User user = newUser(500000);
        JsonNode created = create(body(freshDate(), "WALLET", 10), user);
        Long bookingId = created.get("bookingId").asLong();
        assertThat(walletOf(user)).isLessThan(BigDecimal.valueOf(500000));

        mockMvc.perform(delete("/api/booking/cancel/" + bookingId).header("Authorization", bearer(user)))
                .andExpect(status().isOk());
        assertThat(walletOf(user)).isEqualByComparingTo("500000");
        assertThat(paymentOf(created).getStatus()).isEqualTo(PaymentStatus.REFUNDED);

        mockMvc.perform(delete("/api/booking/cancel/" + bookingId).header("Authorization", bearer(user)))
                .andExpect(status().isOk());
        assertThat(walletOf(user)).isEqualByComparingTo("500000");
    }

    @Test
    @DisplayName("Đơn chờ thanh toán quá hạn giữ chỗ bị scheduler hủy, giao dịch FAILED và admin không duyệt lại được")
    void testExpiredPendingBookingCannotBeConfirmed() throws Exception {
        JsonNode created = create(body(freshDate(), "VIETQR", 10), null);
        Booking booking = bookingOf(created);
        booking.setHoldExpiresAt(LocalDateTime.now().minusMinutes(1));
        bookingRepository.save(booking);

        scheduler.cancelExpiredPendingBookings();

        assertThat(bookingOf(created).getStatus()).isEqualTo(BookingStatus.CANCELLED);
        Payment payment = paymentOf(created);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);

        mockMvc.perform(post("/api/admin/payments/" + payment.getId() + "/confirm").header("Authorization", bearer(admin)))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/admin/bookings/" + created.get("bookingId").asLong() + "/confirm")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isConflict());
        assertThat(bookingOf(created).getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    // ---------- Slot đã qua ----------

    @Test
    @DisplayName("Không thể đặt slot của ngày đã qua và báo giá đánh dấu slot đó không còn trống")
    void testCannotBookPastDate() throws Exception {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON)
                        .content(body(yesterday, "VIETQR", 10)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("đã qua giờ bắt đầu")));

        String quote = mockMvc.perform(post("/api/booking/quote").contentType(MediaType.APPLICATION_JSON)
                        .content(body(yesterday, "VIETQR", 10)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(objectMapper.readTree(quote).get("slots").get(0).get("available").asBoolean()).isFalse();
    }

    @Test
    @DisplayName("Slot của hôm nay đã qua giờ bắt đầu cũng không đặt được")
    void testCannotBookStartedSlotToday() throws Exception {
        org.junit.jupiter.api.Assumptions.assumeTrue(java.time.LocalTime.now().isAfter(java.time.LocalTime.of(0, 16)),
                "Slot đầu tiên (00:15) chưa bắt đầu nên không kiểm thử được ngay lúc này");

        mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON)
                        .content(body(LocalDate.now(), "VIETQR", 1)))
                .andExpect(status().isConflict());
    }
}
