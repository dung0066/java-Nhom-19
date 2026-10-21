package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.model.Product;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.repository.ProductRepository;
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

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductInventoryIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private String generateTokenFor(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return jwtTokenProvider.generateToken(user);
    }

    @Test
    @DisplayName("Lấy danh sách sản phẩm: specs JSON được trả về cùng spec1, spec2 tương thích ngược")
    void testGetActiveProductsAndSpecs() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists())
                .andExpect(jsonPath("$[0].specs").exists())
                .andExpect(jsonPath("$[0].spec1").exists());
    }

    @Test
    @DisplayName("Lọc sản phẩm theo danh mục RACKET chuẩn Database V2")
    void testGetProductsByCategoryRacket() throws Exception {
        mockMvc.perform(get("/api/products/category/RACKET"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].category.code").value("RACKET"));
    }

    @Test
    @DisplayName("Admin cập nhật tồn kho chi nhánh cho sản phẩm thành công")
    void testAdminUpdateBranchInventory() throws Exception {
        String adminToken = generateTokenFor("admin");
        Long branchId = 1L;
        Long productId = 4L; // Quấn cán vợt

        Map<String, Object> updateReq = Map.of(
                "branchId", branchId,
                "stockQuantity", 50
        );

        mockMvc.perform(put("/api/admin/products/" + productId + "/inventory")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stockQuantity").value(50));

        // Kiểm tra tra cứu tồn kho qua API admin
        mockMvc.perform(get("/api/admin/products/" + productId + "/inventory")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Người dùng thông thường không thể sửa hoặc cập nhật kho sản phẩm (403 Forbidden)")
    void testUnauthorizedUserCannotModifyProducts() throws Exception {
        String userToken = generateTokenFor("khachhang1");
        Map<String, Object> updateReq = Map.of(
                "branchId", 1L,
                "stockQuantity", 99
        );

        mockMvc.perform(put("/api/admin/products/4/inventory")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isForbidden());
    }
}
