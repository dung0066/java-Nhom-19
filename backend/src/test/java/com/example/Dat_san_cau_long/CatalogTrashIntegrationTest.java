package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.model.enums.UserStatus;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.CourtRepository;
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
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử xóa tạm (thùng rác) chi nhánh và sân: biến mất khỏi danh sách và màn hình đặt sân, khôi phục được,
 * xóa chi nhánh kéo theo các sân của nó, chặn khi còn lịch chưa diễn ra, và xóa vĩnh viễn giữ lịch sử.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class CatalogTrashIntegrationTest extends AbstractIntegrationTest {

    private static final AtomicInteger SEQ = new AtomicInteger(0);
    private static final AtomicInteger DAY_OFFSET = new AtomicInteger(800);

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private CourtRepository courtRepository;

    private String adminToken;

    @BeforeEach
    void setUp() {
        adminToken = "Bearer " + jwtTokenProvider.generateToken(userRepository.findByUsername("admin").orElseThrow());
    }

    private Branch newBranch() {
        int n = SEQ.incrementAndGet();
        return branchRepository.save(Branch.builder().code("TRASH" + n).name("Chi Nhanh Rac " + n)
                .address("Dia chi " + n).phone("0988000" + String.format("%03d", n)).build());
    }

    private Court newCourt(Branch branch, int number) {
        return courtRepository.save(Court.builder().branch(branch).courtNumber(number).build());
    }

    private JsonNode json(String body) throws Exception {
        return objectMapper.readTree(body);
    }

    private boolean listedInAdminCourts(Long branchId, Long courtId) throws Exception {
        String body = mockMvc.perform(get("/api/admin/courts").param("branchId", branchId.toString()).header("Authorization", adminToken))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for (JsonNode c : json(body)) if (c.get("id").asLong() == courtId) return true;
        return false;
    }

    private boolean listed(String url, Long id) throws Exception {
        String body = mockMvc.perform(get(url).header("Authorization", adminToken))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        for (JsonNode n : json(body)) if (n.get("id").asLong() == id) return true;
        return false;
    }

    private String bookBody(Branch branch, Court court, LocalDate date) {
        return "{\"branchCode\":\"" + branch.getCode() + "\",\"bookingDate\":\"" + date + "\",\"customerName\":\"Khach\","
                + "\"customerPhone\":\"0900000777\",\"paymentType\":\"CASH\",\"selectedSlots\":[{\"courtId\":" + court.getId() + ",\"timeSlotId\":10}]}";
    }

    @Test
    @DisplayName("Xóa tạm sân: biến mất khỏi danh sách, nằm trong thùng rác, khôi phục được")
    void testSoftDeleteAndRestoreCourt() throws Exception {
        Branch branch = newBranch();
        Court court = newCourt(branch, 1);

        mockMvc.perform(delete("/api/admin/courts/" + court.getId()).header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("thùng rác")));

        assertThat(listedInAdminCourts(branch.getId(), court.getId())).isFalse();
        assertThat(listed("/api/admin/courts/trash", court.getId())).isTrue();
        assertThat(courtRepository.findById(court.getId())).isPresent();

        mockMvc.perform(post("/api/admin/courts/" + court.getId() + "/restore").header("Authorization", adminToken))
                .andExpect(status().isOk());

        assertThat(listedInAdminCourts(branch.getId(), court.getId())).isTrue();
        assertThat(listed("/api/admin/courts/trash", court.getId())).isFalse();
    }

    @Test
    @DisplayName("Sân đang trong thùng rác không còn đặt được")
    void testTrashedCourtCannotBeBooked() throws Exception {
        Branch branch = newBranch();
        Court court = newCourt(branch, 1);
        mockMvc.perform(delete("/api/admin/courts/" + court.getId()).header("Authorization", adminToken)).andExpect(status().isOk());

        mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON)
                        .content(bookBody(branch, court, LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet()))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Sân còn lượt đặt chưa diễn ra thì chưa xóa tạm được; hủy lượt đặt xong thì xóa được")
    void testCannotSoftDeleteCourtWithUpcomingBooking() throws Exception {
        Branch branch = newBranch();
        Court court = newCourt(branch, 1);
        String created = mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON)
                        .content(bookBody(branch, court, LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet()))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long bookingId = json(created).get("bookingId").asLong();

        mockMvc.perform(delete("/api/admin/courts/" + court.getId()).header("Authorization", adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("chưa diễn ra")));
        assertThat(listedInAdminCourts(branch.getId(), court.getId())).isTrue();

        mockMvc.perform(post("/api/admin/bookings/" + bookingId + "/cancel").header("Authorization", adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/courts/" + court.getId()).header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Xóa vĩnh viễn: chỉ áp dụng cho mục trong thùng rác và chưa từng có lượt đặt")
    void testPermanentDeleteRules() throws Exception {
        Branch branch = newBranch();
        Court plain = newCourt(branch, 1);
        Court used = newCourt(branch, 2);

        // sân đang hoạt động không xóa vĩnh viễn được
        mockMvc.perform(delete("/api/admin/courts/" + plain.getId() + "/permanent").header("Authorization", adminToken))
                .andExpect(status().isConflict());

        // sân chưa từng đặt: xóa tạm rồi xóa vĩnh viễn
        mockMvc.perform(delete("/api/admin/courts/" + plain.getId()).header("Authorization", adminToken)).andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/courts/" + plain.getId() + "/permanent").header("Authorization", adminToken))
                .andExpect(status().isOk());
        assertThat(courtRepository.findById(plain.getId())).isEmpty();

        // sân đã có lượt đặt (đã hủy): xóa tạm được nhưng không xóa vĩnh viễn được vì cần giữ lịch sử
        String created = mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON)
                        .content(bookBody(branch, used, LocalDate.now().plusDays(DAY_OFFSET.incrementAndGet()))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        mockMvc.perform(post("/api/admin/bookings/" + json(created).get("bookingId").asLong() + "/cancel").header("Authorization", adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/courts/" + used.getId()).header("Authorization", adminToken)).andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/courts/" + used.getId() + "/permanent").header("Authorization", adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("giữ lịch sử")));
        assertThat(courtRepository.findById(used.getId())).isPresent();
    }

    @Test
    @DisplayName("Xóa tạm chi nhánh kéo theo các sân; khôi phục chi nhánh chỉ khôi phục sân xóa cùng lúc")
    void testBranchCascadeAndRestore() throws Exception {
        Branch branch = newBranch();
        Court alone = newCourt(branch, 1);
        Court together = newCourt(branch, 2);

        // sân 1 bị xóa riêng từ trước, nên khi khôi phục chi nhánh nó phải ở lại thùng rác
        mockMvc.perform(delete("/api/admin/courts/" + alone.getId()).header("Authorization", adminToken)).andExpect(status().isOk());
        // đợi để mốc xóa của sân 1 khác mốc xóa chi nhánh
        Thread.sleep(1100);

        mockMvc.perform(delete("/api/admin/branches/" + branch.getId()).header("Authorization", adminToken))
                .andExpect(status().isOk());

        assertThat(listed("/api/admin/branches", branch.getId())).isFalse();
        assertThat(listed("/api/admin/branches/trash", branch.getId())).isTrue();
        assertThat(listed("/api/booking/branches", branch.getId())).isFalse();
        assertThat(listed("/api/admin/courts/trash", together.getId())).isTrue();

        // sân của chi nhánh đang trong thùng rác không khôi phục riêng được
        mockMvc.perform(post("/api/admin/courts/" + together.getId() + "/restore").header("Authorization", adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("khôi phục chi nhánh")));

        mockMvc.perform(post("/api/admin/branches/" + branch.getId() + "/restore").header("Authorization", adminToken))
                .andExpect(status().isOk());

        assertThat(listed("/api/admin/branches", branch.getId())).isTrue();
        assertThat(listedInAdminCourts(branch.getId(), together.getId())).isTrue();
        assertThat(listedInAdminCourts(branch.getId(), alone.getId())).isFalse();
        assertThat(listed("/api/admin/courts/trash", alone.getId())).isTrue();
    }

    @Test
    @DisplayName("Mã chi nhánh đang trong thùng rác không dùng lại được cho chi nhánh mới")
    void testCannotReuseTrashedBranchCode() throws Exception {
        Branch branch = newBranch();
        mockMvc.perform(delete("/api/admin/branches/" + branch.getId()).header("Authorization", adminToken)).andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/branches").header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + branch.getCode() + "\",\"name\":\"Trung ma\",\"address\":\"Dia chi\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("thùng rác")));
    }

    @Test
    @DisplayName("Chỉ admin được xem và thao tác thùng rác; nhân viên bị 403")
    void testTrashIsAdminOnly() throws Exception {
        int n = SEQ.incrementAndGet();
        User staff = userRepository.save(User.builder().username("trash_staff_" + n).password("x").fullName("Nhan Vien")
                .phone("09550000" + String.format("%02d", n)).email("trash_staff_" + n + "@test.vn")
                .role(UserRole.ROLE_STAFF).status(UserStatus.ACTIVE).build());
        String staffToken = "Bearer " + jwtTokenProvider.generateToken(staff);

        mockMvc.perform(get("/api/admin/branches/trash").header("Authorization", staffToken)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/courts/trash").header("Authorization", staffToken)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/branches/trash")).andExpect(status().isUnauthorized());
    }
}
