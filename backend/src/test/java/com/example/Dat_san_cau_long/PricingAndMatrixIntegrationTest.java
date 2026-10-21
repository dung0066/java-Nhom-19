package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.ResolvedPriceInfo;
import com.example.Dat_san_cau_long.model.TimeSlot;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.repository.BookingDetailRepository;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.repository.TimeSlotRepository;
import com.example.Dat_san_cau_long.repository.UserRepository;
import com.example.Dat_san_cau_long.service.PricingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class PricingAndMatrixIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @AfterEach
    @org.springframework.transaction.annotation.Transactional
    void cleanTestBookings() {
        bookingRepository.findByCustomerPhone("0999888777").forEach(b -> {
            bookingRepository.delete(b);
        });
    }

    @Test
    @DisplayName("PricingService: Khung giờ thường trả về 70.000đ, giờ cao điểm (slot 17) trả về 120.000đ")
    void testDynamicPricingResolution() {
        LocalDate testDate = LocalDate.now();

        // Slot 1 (thường)
        ResolvedPriceInfo normalPrice = pricingService.resolvePriceInfo(1L, 1L, testDate);
        assertThat(normalPrice.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(70000));
        assertThat(normalPrice.isPeak()).isFalse();

        // Slot 17 (cao điểm trong seed price_rules)
        ResolvedPriceInfo peakPrice = pricingService.resolvePriceInfo(1L, 17L, testDate);
        assertThat(peakPrice.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(120000));
        assertThat(peakPrice.isPeak()).isTrue();
    }

    @Test
    @DisplayName("PricingService: Hội viên Vàng (Gold - 12%) được giảm giá 12% trên giá gốc")
    void testMembershipDiscountCalculation() {
        User goldUser = userRepository.findByUsername("hoivien_gold").orElseThrow();
        TimeSlot slot = timeSlotRepository.findById(1L).orElseThrow();

        BigDecimal originalPrice = BigDecimal.valueOf(70000);
        BigDecimal discount = pricingService.calculateDiscount(originalPrice, goldUser, slot, LocalDate.now());

        // 70000 * 12 / 100 = 8400
        assertThat(discount).isEqualByComparingTo(BigDecimal.valueOf(8400));
    }

    @Test
    @DisplayName("GET /api/booking/matrix trả về ma trận với giá động và cờ isPeak cho từng time slot")
    void testMatrixEndpointWithDynamicPricing() throws Exception {
        mockMvc.perform(get("/api/booking/matrix?branch=NVL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentBranch.code").value("NVL"))
                .andExpect(jsonPath("$.timeSlots").isArray())
                .andExpect(jsonPath("$.timeSlots[0].price").value(70000))
                .andExpect(jsonPath("$.timeSlots[0].isPeak").value(false))
                .andExpect(jsonPath("$.timeSlots[16].price").value(120000))
                .andExpect(jsonPath("$.timeSlots[16].isPeak").value(true));
    }

    @Test
    @DisplayName("POST /api/booking/create tính giá động và chiết khấu hội viên chính xác")
    void testCreateBookingWithDynamicPricingAndDiscount() throws Exception {
        User goldUser = userRepository.findByUsername("hoivien_gold").orElseThrow();

        BookingRequestDto req = new BookingRequestDto();
        req.setBranchCode("NVL");
        req.setBookingDate(LocalDate.now().plusDays(2).toString());
        req.setCustomerName("Nguyen Van Tuan");
        req.setCustomerPhone("0999888777");
        req.setCustomerEmail("tuan.badminton@gmail.com");
        req.setUserId(goldUser.getId());

        BookingRequestDto.SlotItemDto slotItem = new BookingRequestDto.SlotItemDto();
        slotItem.setCourtId(1L);
        slotItem.setTimeSlotId(17L); // Giờ cao điểm: 120.000đ
        req.setSelectedSlots(List.of(slotItem));

        mockMvc.perform(post("/api/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.originalPrice").value(120000))
                .andExpect(jsonPath("$.discountAmount").value(14400)) // 120000 * 12% = 14400
                .andExpect(jsonPath("$.totalPrice").value(105600)); // 120000 - 14400 = 105600
    }

    @Test
    @DisplayName("POST /api/booking/create trùng slot đã đặt trả về 409 Conflict")
    void testCreateBookingConflictReturns409() throws Exception {
        LocalDate targetDate = LocalDate.now().plusDays(3);

        BookingRequestDto req = new BookingRequestDto();
        req.setBranchCode("NVL");
        req.setBookingDate(targetDate.toString());
        req.setCustomerName("Khách 1");
        req.setCustomerPhone("0999888777");
        req.setSelectedSlots(List.of(new BookingRequestDto.SlotItemDto(1L, 5L)));

        // Đặt lần 1 -> Thành công 200
        mockMvc.perform(post("/api/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Đặt lần 2 trùng slot 5 -> Báo lỗi 409 Conflict
        mockMvc.perform(post("/api/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"));
    }
}
