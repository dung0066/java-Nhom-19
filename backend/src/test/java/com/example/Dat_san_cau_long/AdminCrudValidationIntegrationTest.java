package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingItem;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.BookingItemStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.repository.BookingItemRepository;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.repository.ProductCategoryRepository;
import com.example.Dat_san_cau_long.repository.ProductRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử CRUD phía admin: kiểm tra dữ liệu nhập (400), ràng buộc nghiệp vụ (409)
 * và các trường hợp xóa khi còn dữ liệu liên quan.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class AdminCrudValidationIntegrationTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;
    @Autowired private BranchRepository branchRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private BookingItemRepository bookingItemRepository;
    @Autowired private ProductCategoryRepository productCategoryRepository;

    private String adminToken;
    private User admin;

    @BeforeEach
    void setUp() {
        admin = userRepository.findByUsername("admin").orElseThrow();
        adminToken = jwtTokenProvider.generateToken(admin);
    }

    private ResultActions send(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder, String json) throws Exception {
        return mockMvc.perform(builder.header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    // ---------- Chi nhánh ----------

    @Test
    @DisplayName("Tạo chi nhánh thiếu tên và sai số điện thoại trả 400 kèm thông báo rõ ràng")
    void testCreateBranchValidation() throws Exception {
        send(post("/api/admin/branches"), "{\"code\":\"VAL1\",\"address\":\"1 Test\",\"phone\":\"123\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Tên chi nhánh không được để trống")))
                .andExpect(jsonPath("$.message", containsString("Số điện thoại không hợp lệ")));
    }

    @Test
    @DisplayName("Tạo chi nhánh trùng mã trả 409, mã được chuẩn hóa chữ hoa")
    void testCreateBranchDuplicateCode() throws Exception {
        String body = "{\"code\":\"crud1\",\"name\":\"CRUD Branch\",\"address\":\"1 Test\",\"phone\":\"0909123456\"}";
        send(post("/api/admin/branches"), body)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("CRUD1"));

        send(post("/api/admin/branches"), body)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("đã tồn tại")));
    }

    @Test
    @DisplayName("Chi nhánh đã có đơn: xóa tạm được nhưng không xóa vĩnh viễn được (giữ lịch sử); chi nhánh trống xóa vĩnh viễn được")
    void testDeleteBranchGuard() throws Exception {
        Branch used = branchRepository.save(Branch.builder().code("CRUD2").name("Used").address("2 Test").build());
        bookingRepository.save(Booking.builder().bookingCode("WAY-CRUD-" + System.nanoTime())
                .customerName("Khach").customerPhone("0900000001").branch(used).status(BookingStatus.PENDING).build());

        mockMvc.perform(delete("/api/admin/branches/" + used.getId()).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/branches/" + used.getId() + "/permanent").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("không thể xóa vĩnh viễn")));

        Branch empty = branchRepository.save(Branch.builder().code("CRUD3").name("Empty").address("3 Test").build());
        mockMvc.perform(delete("/api/admin/branches/" + empty.getId()).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/branches/" + empty.getId() + "/permanent").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    // ---------- Sân ----------

    @Test
    @DisplayName("Tạo sân: thiếu chi nhánh trả 400, số sân vượt giới hạn trả 400, trùng số sân trả 409")
    void testCourtValidationAndDuplicate() throws Exception {
        send(post("/api/admin/courts"), "{\"courtNumber\":3}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("chọn chi nhánh")));

        send(post("/api/admin/courts"), "{\"branchId\":1,\"courtNumber\":500}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Số sân tối đa 99")));

        // Sân 1 của chi nhánh 1 đã có sẵn trong dữ liệu mẫu
        send(post("/api/admin/courts"), "{\"branchId\":1,\"courtNumber\":1}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("đã có Sân 1")));
    }

    // ---------- Sản phẩm ----------

    @Test
    @DisplayName("Tạo sản phẩm giá âm hoặc thiếu tên trả 400")
    void testProductValidation() throws Exception {
        send(post("/api/admin/products"), "{\"name\":\"Vợt lỗi\",\"price\":-5}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Giá sản phẩm không được âm")));

        send(post("/api/admin/products"), "{\"price\":1000}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Tên sản phẩm không được để trống")));
    }

    @Test
    @DisplayName("Không xóa được sản phẩm đã nằm trong đơn đặt sân")
    void testDeleteProductUsedInBooking() throws Exception {
        Branch branch = branchRepository.findById(1L).orElseThrow();
        Product product = productRepository.save(Product.builder().category(productCategoryRepository.findAll().get(0)).name("SP crud").price(BigDecimal.valueOf(10000)).build());
        Booking booking = bookingRepository.save(Booking.builder().bookingCode("WAY-CRUD-" + System.nanoTime())
                .customerName("Khach").customerPhone("0900000002").branch(branch).status(BookingStatus.PENDING).build());
        bookingItemRepository.save(BookingItem.builder().booking(booking).product(product).quantity(1)
                .unitPrice(BigDecimal.valueOf(10000)).status(BookingItemStatus.RESERVED).build());

        mockMvc.perform(delete("/api/admin/products/" + product.getId()).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("không thể xóa")));
    }

    // ---------- Bài viết ----------

    @Test
    @DisplayName("Tạo bài viết không có tiêu đề trả 400")
    void testArticleValidation() throws Exception {
        send(post("/api/admin/articles"), "{\"summary\":\"chỉ có tóm tắt\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Tiêu đề bài viết không được để trống")));
    }

    // ---------- Bảng giá ----------

    @Test
    @DisplayName("Tạo quy tắc giá: giá quá thấp trả 400, ngày kết thúc trước ngày bắt đầu trả 400")
    void testPriceRuleValidation() throws Exception {
        send(post("/api/admin/price-rules"), "{\"price\":10}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Giá tối thiểu")));

        send(post("/api/admin/price-rules"),
                "{\"price\":80000,\"validFrom\":\"2026-12-31\",\"validTo\":\"2026-01-01\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Ngày kết thúc")));
    }

    // ---------- Gói hội viên ----------

    @Test
    @DisplayName("Tạo gói hội viên giảm giá trên 100% hoặc thời hạn 0 ngày trả 400")
    void testMembershipPackageValidation() throws Exception {
        send(post("/api/admin/memberships/packages"),
                "{\"code\":\"BAD1\",\"name\":\"Gói lỗi\",\"price\":100000,\"durationDays\":0,\"discountPercent\":150}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Thời hạn gói tối thiểu 1 ngày")))
                .andExpect(jsonPath("$.message", containsString("Phần trăm giảm giá tối đa 100%")));
    }

    // ---------- Tài khoản ----------

    @Test
    @DisplayName("Tạo tài khoản: sai định dạng trả 400, trùng tên đăng nhập hoặc số điện thoại trả 409")
    void testUserValidationAndDuplicates() throws Exception {
        send(post("/api/admin/users"), "{\"username\":\"ab\",\"password\":\"123\",\"phone\":\"abc\",\"email\":\"khong-phai-email\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Tên đăng nhập")))
                .andExpect(jsonPath("$.message", containsString("Mật khẩu")))
                .andExpect(jsonPath("$.message", containsString("Số điện thoại")))
                .andExpect(jsonPath("$.message", containsString("Email")));

        String ok = "{\"username\":\"crud_user1\",\"password\":\"secret1\",\"fullName\":\"Crud User\",\"phone\":\"0911000111\"}";
        send(post("/api/admin/users"), ok).andExpect(status().isOk());

        send(post("/api/admin/users"), ok)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Tên đăng nhập đã tồn tại")));

        send(post("/api/admin/users"),
                "{\"username\":\"crud_user2\",\"password\":\"secret1\",\"phone\":\"0911000111\"}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Số điện thoại")));
    }

    @Test
    @DisplayName("Admin không thể tự xóa hoặc tự khóa chính mình")
    void testAdminCannotDeleteOrLockSelf() throws Exception {
        mockMvc.perform(delete("/api/admin/users/" + admin.getId()).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("chính tài khoản đang đăng nhập")));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/admin/users/" + admin.getId() + "/toggle-status")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Sửa tài khoản trùng số điện thoại của người khác trả 409")
    void testUpdateUserDuplicatePhone() throws Exception {
        User other = userRepository.findByUsername("khachhang1").orElseThrow();
        send(put("/api/admin/users/" + other.getId()), "{\"phone\":\"" + admin.getPhone() + "\"}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Số điện thoại")));
    }
}
