package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.model.SlotTransfer;
import com.example.Dat_san_cau_long.model.TimeSlot;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.TransferStatus;
import com.example.Dat_san_cau_long.repository.BookingDetailRepository;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
import com.example.Dat_san_cau_long.repository.SlotTransferRepository;
import com.example.Dat_san_cau_long.repository.TimeSlotRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.example.Dat_san_cau_long.service.BookingExpirationScheduler;
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
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử chợ pass sân: đăng bán, nhận pass bằng ví, hủy tin, tin quá hạn
 * và các tình huống khó (không đủ tiền, nhận hai lần, người lạ thao tác trên tin của người khác).
 */
@SpringBootTest
@AutoConfigureMockMvc
public class SlotTransferIntegrationTest extends AbstractIntegrationTest {

    /** Mỗi test dùng một ngày riêng để các slot không đụng ràng buộc chống đặt trùng. */
    private static final AtomicInteger DAY_OFFSET = new AtomicInteger(200);

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private CourtRepository courtRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private BookingDetailRepository bookingDetailRepository;
    @Autowired private SlotTransferRepository slotTransferRepository;
    @Autowired private WalletRepository walletRepository;
    @Autowired private BookingExpirationScheduler scheduler;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User admin;
    private User seller;
    private User buyer;
    private User stranger;
    private Branch branch;
    private Court court;
    private TimeSlot timeSlot;

    @BeforeEach
    void setUp() {
        admin = userRepository.findByUsername("admin").orElseThrow();
        seller = userRepository.findByUsername("hoivien_gold").orElseThrow();
        buyer = userRepository.findByUsername("khachhang1").orElseThrow();
        branch = branchRepository.findById(1L).orElseThrow();
        court = courtRepository.findByBranchIdOrderByCourtNumberAsc(1L).get(0);
        timeSlot = timeSlotRepository.findById(18L).orElseThrow();

        // Người ngoài cuộc: tài khoản thường thứ ba, tạo riêng để không trùng người bán và người mua
        stranger = userRepository.findByUsername("stranger_slot").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("stranger_slot").password("x").fullName("Nguoi La")
                        .phone("0911000333").email("stranger_slot@test.vn")
                        .role(com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_USER)
                        .status(com.example.Dat_san_cau_long.model.enums.UserStatus.ACTIVE)
                        .build()));

        setBalance(seller, 100000);
        setBalance(buyer, 500000);
        setBalance(stranger, 500000);
    }

    // ---------- Hàm dựng dữ liệu ----------

    private String bearer(User user) {
        return "Bearer " + jwtTokenProvider.generateToken(user);
    }

    /** Ghi thẳng số dư bằng SQL để tài khoản chưa có ví cũng được tạo ví. */
    private void setBalance(User user, long amount) {
        jdbcTemplate.update("INSERT INTO wallets (user_id, balance) VALUES (?, ?) "
                + "ON DUPLICATE KEY UPDATE balance = VALUES(balance)", user.getId(), amount);
    }

    private BigDecimal balanceOf(User user) {
        return walletRepository.findById(user.getId()).orElseThrow().getBalance();
    }

    /** Tạo đơn của {@code owner} có đúng một slot trong ngày chỉ định. */
    private BookingDetail saveSlotOf(User owner, LocalDate date, BookingDetailStatus detailStatus) {
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("WAY-PASS-" + System.nanoTime())
                .customerName(owner.getFullName()).customerPhone(owner.getPhone())
                .branch(branch).user(owner).status(BookingStatus.CONFIRMED).build());
        return bookingDetailRepository.save(BookingDetail.builder()
                .booking(booking).branchId(branch.getId()).court(court).timeSlot(timeSlot)
                .slotDate(date).price(BigDecimal.valueOf(120000)).status(detailStatus).build());
    }

    private BookingDetail saveFutureSlotOf(User owner) {
        return saveSlotOf(owner, LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet()), BookingDetailStatus.BOOKED);
    }

    private String listBody(BookingDetail detail, long passPrice) {
        return "{\"bookingDetailId\":" + detail.getId() + ",\"passPrice\":" + passPrice + ",\"contact\":\"0900111222\"}";
    }

    private Long listSlot(User owner, BookingDetail detail, long passPrice) throws Exception {
        String json = mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listBody(detail, passPrice)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return com.fasterxml.jackson.databind.json.JsonMapper.builder().build().readTree(json).get("id").asLong();
    }

    // ---------- Luồng chính ----------

    @Test
    @DisplayName("Luồng đầy đủ: đăng bán -> hiện trên chợ -> người mua nhận bằng ví -> tiền và chủ đơn đổi đúng")
    void testListAndClaimHappyPath() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(get("/api/slot-transfers/market"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + transferId + ")].passPrice").value(80000));

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(buyer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLAIMED"));

        assertThat(balanceOf(buyer)).isEqualByComparingTo("420000");
        assertThat(balanceOf(seller)).isEqualByComparingTo("180000");

        SlotTransfer saved = slotTransferRepository.findById(transferId).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo(TransferStatus.CLAIMED);
        assertThat(saved.getClaimedAt()).isNotNull();

        Booking booking = bookingRepository.findById(detail.getBooking().getId()).orElseThrow();
        assertThat(booking.getUser().getId()).isEqualTo(buyer.getId());
        assertThat(booking.getCustomerPhone()).isEqualTo(buyer.getPhone());

        // Tin đã bán không còn trên chợ
        mockMvc.perform(get("/api/slot-transfers/market"))
                .andExpect(jsonPath("$[?(@.id == " + transferId + ")]").isEmpty());
    }

    @Test
    @DisplayName("Lọc chợ theo chi nhánh và ngày chỉ trả đúng tin của ngày đó")
    void testMarketFilterByBranchAndDate() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 50000);

        mockMvc.perform(get("/api/slot-transfers/market")
                        .param("branchId", branch.getId().toString())
                        .param("date", detail.getSlotDate().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + transferId + ")]").isNotEmpty());

        mockMvc.perform(get("/api/slot-transfers/market")
                        .param("branchId", branch.getId().toString())
                        .param("date", detail.getSlotDate().plusDays(1).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + transferId + ")]").isEmpty());
    }

    @Test
    @DisplayName("Pass miễn phí (giá 0): nhận được dù ví người mua trống và chủ đơn vẫn đổi")
    void testClaimFreeSlotWithEmptyWallet() throws Exception {
        setBalance(buyer, 0);
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 0);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(buyer)))
                .andExpect(status().isOk());

        assertThat(balanceOf(buyer)).isEqualByComparingTo("0");
        assertThat(balanceOf(seller)).isEqualByComparingTo("100000");
        assertThat(bookingRepository.findById(detail.getBooking().getId()).orElseThrow().getUser().getId())
                .isEqualTo(buyer.getId());
    }

    // ---------- Tình huống khó ----------

    @Test
    @DisplayName("Ví không đủ tiền: nhận pass thất bại, tin vẫn còn trên chợ, ví và chủ đơn không đổi")
    void testClaimWithInsufficientBalance() throws Exception {
        setBalance(buyer, 10000);
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(buyer)))
                .andExpect(status().isConflict());

        assertThat(balanceOf(buyer)).isEqualByComparingTo("10000");
        assertThat(balanceOf(seller)).isEqualByComparingTo("100000");
        assertThat(slotTransferRepository.findById(transferId).orElseThrow().getStatus()).isEqualTo(TransferStatus.LISTED);
        assertThat(bookingRepository.findById(detail.getBooking().getId()).orElseThrow().getUser().getId())
                .isEqualTo(seller.getId());
    }

    @Test
    @DisplayName("Tin đã được nhận thì người thứ hai không nhận được nữa và không bị trừ tiền")
    void testCannotClaimTwice() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(buyer)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(stranger)))
                .andExpect(status().isConflict());

        assertThat(balanceOf(stranger)).isEqualByComparingTo("500000");
        assertThat(bookingRepository.findById(detail.getBooking().getId()).orElseThrow().getUser().getId())
                .isEqualTo(buyer.getId());
    }

    @Test
    @DisplayName("Người bán không thể tự mua lại tin của chính mình")
    void testSellerCannotClaimOwnListing() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(seller)))
                .andExpect(status().isConflict());
        assertThat(slotTransferRepository.findById(transferId).orElseThrow().getStatus()).isEqualTo(TransferStatus.LISTED);
    }

    @Test
    @DisplayName("Một slot không thể đăng bán hai lần cùng lúc")
    void testCannotListTwice() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        listSlot(seller, detail, 80000);

        mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listBody(detail, 80000)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Slot đã hủy không thể đăng bán")
    void testCannotListCancelledSlot() throws Exception {
        BookingDetail detail = saveSlotOf(seller, LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet()),
                BookingDetailStatus.CANCELLED);

        mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listBody(detail, 80000)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Slot đã qua ngày không thể đăng bán")
    void testCannotListPastSlot() throws Exception {
        BookingDetail detail = saveSlotOf(seller, LocalDate.now().minusDays(DAY_OFFSET.incrementAndGet()),
                BookingDetailStatus.BOOKED);

        mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listBody(detail, 80000)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Đăng bán slot không tồn tại trả 404")
    void testListUnknownDetail() throws Exception {
        mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookingDetailId\":999999999,\"passPrice\":1000}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Giá pass âm bị từ chối")
    void testNegativePassPriceRejected() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);

        mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(seller))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listBody(detail, -5000)))
                .andExpect(status().isBadRequest());
        assertThat(slotTransferRepository.findByBookingDetailIdAndStatus(detail.getId(), TransferStatus.LISTED)).isEmpty();
    }

    // ---------- Hủy tin ----------

    @Test
    @DisplayName("Người bán hủy tin: tin biến khỏi chợ và không ai nhận được nữa")
    void testSellerCancelsListing() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/cancel").header("Authorization", bearer(seller)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        assertThat(slotTransferRepository.findById(transferId).orElseThrow().getStatus()).isEqualTo(TransferStatus.CANCELLED);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim").header("Authorization", bearer(buyer)))
                .andExpect(status().isConflict());
        assertThat(balanceOf(buyer)).isEqualByComparingTo("500000");

        // Sau khi hủy, người bán đăng bán lại được
        listSlot(seller, detail, 70000);
    }

    // ---------- Phân quyền ----------

    @Test
    @DisplayName("Chưa đăng nhập: đăng bán, nhận và hủy đều bị 401, riêng xem chợ thì công khai")
    void testAnonymousAccess() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(get("/api/slot-transfers/market")).andExpect(status().isOk());
        mockMvc.perform(post("/api/slot-transfers/list").contentType(MediaType.APPLICATION_JSON).content(listBody(detail, 1000)))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/claim")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/cancel")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Người lạ không thể đăng bán slot của người khác để chiếm tiền")
    void testStrangerCannotListSomeoneElsesSlot() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);

        mockMvc.perform(post("/api/slot-transfers/list")
                        .header("Authorization", bearer(stranger))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(listBody(detail, 80000)))
                .andExpect(status().isForbidden());
        assertThat(slotTransferRepository.findByBookingDetailIdAndStatus(detail.getId(), TransferStatus.LISTED)).isEmpty();
    }

    @Test
    @DisplayName("Người lạ không thể hủy tin pass của người khác; admin thì được")
    void testStrangerCannotCancelSomeoneElsesListing() throws Exception {
        BookingDetail detail = saveFutureSlotOf(seller);
        Long transferId = listSlot(seller, detail, 80000);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/cancel").header("Authorization", bearer(stranger)))
                .andExpect(status().isForbidden());
        assertThat(slotTransferRepository.findById(transferId).orElseThrow().getStatus()).isEqualTo(TransferStatus.LISTED);

        mockMvc.perform(post("/api/slot-transfers/" + transferId + "/cancel").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    // ---------- Tin quá hạn ----------

    @Test
    @DisplayName("Scheduler chuyển tin của slot đã qua giờ sang EXPIRED, tin của slot tương lai giữ nguyên")
    void testSchedulerExpiresOnlyPastListings() throws Exception {
        BookingDetail futureDetail = saveFutureSlotOf(seller);
        Long futureTransferId = listSlot(seller, futureDetail, 80000);

        // Tin của slot đã qua được tạo thẳng trong database vì API không cho đăng slot quá khứ
        BookingDetail pastDetail = saveSlotOf(seller, LocalDate.now().minusDays(DAY_OFFSET.incrementAndGet()),
                BookingDetailStatus.BOOKED);
        SlotTransfer pastTransfer = slotTransferRepository.save(SlotTransfer.builder()
                .bookingDetail(pastDetail).fromUser(seller).passPrice(BigDecimal.valueOf(50000))
                .status(TransferStatus.LISTED).build());

        scheduler.expireOldSlotTransfers();

        assertThat(slotTransferRepository.findById(pastTransfer.getId()).orElseThrow().getStatus())
                .isEqualTo(TransferStatus.EXPIRED);
        assertThat(slotTransferRepository.findById(futureTransferId).orElseThrow().getStatus())
                .isEqualTo(TransferStatus.LISTED);

        mockMvc.perform(post("/api/slot-transfers/" + pastTransfer.getId() + "/claim").header("Authorization", bearer(buyer)))
                .andExpect(status().isConflict());
        assertThat(balanceOf(buyer)).isEqualByComparingTo("500000");
    }
}
