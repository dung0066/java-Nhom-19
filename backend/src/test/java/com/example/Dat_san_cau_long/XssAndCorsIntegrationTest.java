package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Kiểm thử chống XSS và CORS: dữ liệu chứa mã script chỉ được lưu và trả về như dữ liệu JSON thuần,
 * header CSP chặn script lạ, CORS chỉ cho các địa chỉ giao diện đã khai báo (không còn "*"),
 * và mã nguồn giao diện không dùng các hàm chèn HTML thô.
 */
@SpringBootTest
@AutoConfigureMockMvc
public class XssAndCorsIntegrationTest extends AbstractIntegrationTest {

    private static final String PAYLOAD = "<script>alert('xss')</script><img src=x onerror=alert(1)>";
    private static final String ALLOWED_ORIGIN = "http://localhost:5173";
    private static final String EVIL_ORIGIN = "https://evil.example.com";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private UserRepository userRepository;

    // ---------- CORS ----------

    @Test
    @DisplayName("CORS: địa chỉ giao diện hợp lệ được phép, đúng địa chỉ đó chứ không phải dấu *")
    void testAllowedOriginIsEchoedNotWildcard() throws Exception {
        mockMvc.perform(options("/api/memberships/packages")
                        .header("Origin", ALLOWED_ORIGIN)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", ALLOWED_ORIGIN));
    }

    @Test
    @DisplayName("CORS: trang web lạ bị từ chối cả khi hỏi trước (preflight) lẫn khi gọi thật, kể cả API hội viên")
    void testForeignOriginRejected() throws Exception {
        mockMvc.perform(options("/api/memberships/packages")
                        .header("Origin", EVIL_ORIGIN)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/memberships/packages").header("Origin", EVIL_ORIGIN))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/booking/branches").header("Origin", EVIL_ORIGIN))
                .andExpect(status().isForbidden());
    }

    // ---------- CSP ----------

    @Test
    @DisplayName("CSP: chỉ cho chạy script cùng nguồn, cấm plugin, cấm nhúng khung")
    void testContentSecurityPolicy() throws Exception {
        mockMvc.perform(get("/api/booking/branches"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Security-Policy", containsString("script-src 'self'")))
                .andExpect(header().string("Content-Security-Policy", containsString("object-src 'none'")))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")));
    }

    // ---------- XSS: dữ liệu độc hại chỉ là dữ liệu ----------

    @Test
    @DisplayName("Tên khách chứa mã script được lưu nguyên văn và trả về dạng JSON, không bao giờ là trang HTML")
    void testScriptInCustomerNameIsInertData() throws Exception {
        String body = "{\"branchCode\":\"NVL\",\"bookingDate\":\"" + LocalDate.now().plusDays(900) + "\","
                + "\"customerName\":" + objectMapper.writeValueAsString(PAYLOAD) + ",\"customerPhone\":\"0900123456\","
                + "\"paymentType\":\"CASH\",\"selectedSlots\":[{\"courtId\":1,\"timeSlotId\":12}]}";

        String created = mockMvc.perform(post("/api/booking/create").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andReturn().getResponse().getContentAsString();
        String code = objectMapper.readTree(created).get("bookingCode").asText();

        String fetched = mockMvc.perform(get("/api/booking/code/" + code))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andReturn().getResponse().getContentAsString();

        assertThat(objectMapper.readTree(fetched).get("customerName").asText()).isEqualTo(PAYLOAD);
        assertThat(fetched).doesNotStartWith("<");
    }

    @Test
    @DisplayName("Tiêu đề bài viết chứa mã script cũng chỉ được trả về như chuỗi JSON thuần")
    void testScriptInArticleTitleIsInertData() throws Exception {
        String admin = "Bearer " + jwtTokenProvider.generateToken(userRepository.findByUsername("admin").orElseThrow());
        String article = "{\"title\":" + objectMapper.writeValueAsString(PAYLOAD) + ",\"summary\":\"tom tat\",\"content\":\"noi dung\","
                + "\"category\":\"TIN_TUC\",\"published\":true}";

        mockMvc.perform(post("/api/admin/articles").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(article))
                .andExpect(status().isOk());

        String list = mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andReturn().getResponse().getContentAsString();

        boolean found = false;
        for (JsonNode node : objectMapper.readTree(list)) {
            if (PAYLOAD.equals(node.path("title").asText())) found = true;
        }
        assertThat(found).as("bài viết có tiêu đề độc hại vẫn trả về nguyên văn dạng dữ liệu").isTrue();
    }

    // ---------- Mã nguồn giao diện ----------

    @Test
    @DisplayName("Mã nguồn giao diện không dùng các hàm chèn HTML thô (dangerouslySetInnerHTML, innerHTML, eval, document.write)")
    void testFrontendHasNoRawHtmlSinks() throws IOException {
        Path frontendSrc = Paths.get("..", "frontend", "src");
        Assumptions.assumeTrue(Files.isDirectory(frontendSrc), "Không tìm thấy thư mục frontend/src cạnh backend, bỏ qua kiểm tra");

        List<String> sinks = List.of("dangerouslySetInnerHTML", ".innerHTML", "outerHTML", "eval(", "document.write(", "insertAdjacentHTML");
        List<String> violations;
        try (Stream<Path> files = Files.walk(frontendSrc)) {
            violations = files
                    .filter(p -> p.toString().endsWith(".jsx") || p.toString().endsWith(".js"))
                    .flatMap(p -> {
                        try {
                            String text = Files.readString(p);
                            return sinks.stream().filter(text::contains).map(s -> p.getFileName() + " dùng " + s);
                        } catch (IOException e) {
                            return Stream.empty();
                        }
                    })
                    .collect(Collectors.toList());
        }

        assertThat(violations).as("các chỗ chèn HTML thô trong giao diện").isEmpty();
    }
}
