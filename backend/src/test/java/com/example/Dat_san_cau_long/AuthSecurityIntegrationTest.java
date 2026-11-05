package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.dto.auth.LoginRequest;
import com.example.Dat_san_cau_long.dto.auth.RegisterRequest;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthSecurityIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private static final List<String> TEST_USERNAMES = List.of(
            "test_new_player",
            "test_dup_player"
    );

    @BeforeEach
    @AfterEach
    void cleanupTestUsers() {
        for (String uname : TEST_USERNAMES) {
            userRepository.findByUsername(uname).ifPresent(u -> {
                walletRepository.deleteById(u.getId());
                userRepository.deleteById(u.getId());
            });
        }
    }

    @Test
    @DisplayName("Đăng ký tài khoản thành công tạo ví và trả về JWT token")
    void testRegisterSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("test_new_player");
        req.setPassword("secret123");
        req.setFullName("Nguyen Van Test");
        req.setEmail("test_new_player@example.com");
        req.setPhone("0988776655");

        String res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.username").value("test_new_player"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"))
                .andReturn().getResponse().getContentAsString();

        JsonNode node = objectMapper.readTree(res);
        Long userId = node.get("id").asLong();

        // Kiểm tra ví đã được tạo tự động với số dư 0
        assertThat(walletRepository.existsById(userId)).isTrue();
    }

    @Test
    @DisplayName("Đăng ký trùng tên đăng nhập hoặc số điện thoại trả về 409 Conflict")
    void testRegisterDuplicateUsername() throws Exception {
        // 'admin' đã có trong seed data
        RegisterRequest req = new RegisterRequest();
        req.setUsername("admin");
        req.setPassword("secret123");
        req.setFullName("Duplicate Admin");
        req.setPhone("0988112233");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    @DisplayName("Đăng nhập thành công với seed user (khachhang1 / 123456)")
    void testLoginSuccess() throws Exception {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setIdentifier("khachhang1");
        loginReq.setPassword("123456");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("khachhang1"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("Đăng nhập sai mật khẩu trả về 401 Unauthorized")
    void testLoginWrongPassword() throws Exception {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setIdentifier("khachhang1");
        loginReq.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Truy cập /api/auth/me với JWT token hợp lệ trả về hồ sơ người dùng")
    void testGetMeWithJwtToken() throws Exception {
        User user = userRepository.findByUsername("khachhang1").orElseThrow();
        String token = jwtTokenProvider.generateToken(user);

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.username").value("khachhang1"))
                .andExpect(jsonPath("$.email").value("duc.tm@gmail.com"));
    }

    @Test
    @DisplayName("Truy cập endpoint ADMIN /api/auth/users bằng ROLE_USER trả về 403 Forbidden")
    void testAdminEndpointForbiddenForUser() throws Exception {
        User user = userRepository.findByUsername("khachhang1").orElseThrow();
        String token = jwtTokenProvider.generateToken(user);

        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("Truy cập endpoint ADMIN /api/auth/users bằng ROLE_ADMIN thành công 200")
    void testAdminEndpointSuccessForAdmin() throws Exception {
        User admin = userRepository.findByUsername("admin").orElseThrow();
        String token = jwtTokenProvider.generateToken(admin);

        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
