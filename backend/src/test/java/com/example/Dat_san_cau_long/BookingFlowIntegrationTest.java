package com.example.Dat_san_cau_long;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.SlotTransferDto;
import com.example.Dat_san_cau_long.model.*;
import com.example.Dat_san_cau_long.model.enums.*;
import com.example.Dat_san_cau_long.repository.*;
import com.example.Dat_san_cau_long.service.BookingExpirationScheduler;
import com.example.Dat_san_cau_long.service.BookingService;
import com.example.Dat_san_cau_long.service.SlotTransferService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BookingFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private ProductInventoryRepository productInventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private SlotTransferRepository slotTransferRepository;

    @Autowired
    private SlotTransferService slotTransferService;

    @Autowired
    private BookingExpirationScheduler expirationScheduler;

    @Autowired
    private com.example.Dat_san_cau_long.repository.PaymentRepository paymentRepository;

    @AfterEach
    @Transactional
    void cleanup() {
        slotTransferRepository.deleteAll();
        bookingRepository.findByCustomerPhone("0987654321").forEach(b -> {
            paymentRepository.deleteAll(paymentRepository.findByBookingId(b.getId()));
            bookingRepository.delete(b);
        });
    }

    @Test
    @DisplayName("Đặt sân kèm sản phẩm phụ kiện: Trừ tồn kho kho hàng tự động và gắn BookingItem")
    void testBookingWithAddonItems() throws Exception {
        Long branchId = 1L; // NVL
        Long productId = 4L; // Quấn cán vợt (RETAIL)

        ProductInventory initialInventory = productInventoryRepository.findByBranchIdAndProductId(branchId, productId).orElseThrow();
        int initialStock = initialInventory.getStockQuantity();

        BookingRequestDto req = new BookingRequestDto();
        req.setBranchCode("NVL");
        req.setBookingDate(LocalDate.now().plusDays(5).toString());
        req.setCustomerName("Test Customer Addon");
        req.setCustomerPhone("0987654321");
        req.setSelectedSlots(List.of(new BookingRequestDto.SlotItemDto(2L, 6L)));
        req.setAddonItems(List.of(new BookingRequestDto.AddonItemDto(productId, 2)));

        mockMvc.perform(post("/api/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        ProductInventory updatedInventory = productInventoryRepository.findByBranchIdAndProductId(branchId, productId).orElseThrow();
        assertThat(updatedInventory.getStockQuantity()).isEqualTo(initialStock - 2);
    }

    @Test
    @DisplayName("Đặt sân kèm sản phẩm vượt quá tồn kho chi nhánh: Trả về lỗi 409 Conflict")
    void testBookingWithExceededStockFails() throws Exception {
        BookingRequestDto req = new BookingRequestDto();
        req.setBranchCode("NVL");
        req.setBookingDate(LocalDate.now().plusDays(6).toString());
        req.setCustomerName("Test Customer Stock Exceed");
        req.setCustomerPhone("0987654321");
        req.setSelectedSlots(List.of(new BookingRequestDto.SlotItemDto(2L, 7L)));
        req.setAddonItems(List.of(new BookingRequestDto.AddonItemDto(1L, 9999))); // Quá số lượng

        mockMvc.perform(post("/api/booking/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @Transactional
    @DisplayName("BookingExpirationScheduler: Tự động hủy đơn PENDING đã quá hạn holdExpiresAt và hoàn kho")
    void testBookingHoldExpirationJob() {
        Long branchId = 1L;
        Long productId = 4L;
        ProductInventory beforeInv = productInventoryRepository.findByBranchIdAndProductId(branchId, productId).orElseThrow();
        int beforeStock = beforeInv.getStockQuantity();

        // Trừ kho giả lập khi tạo đơn
        productInventoryRepository.deductStockAtomic(branchId, productId, 1);

        Booking booking = Booking.builder()
                .bookingCode("WAY-EXP-" + System.currentTimeMillis())
                .customerName("Expired Customer")
                .customerPhone("0987654321")
                .branch(initialInventoryBranch(branchId))
                .status(BookingStatus.PENDING)
                .holdExpiresAt(LocalDateTime.now().minusMinutes(5)) // Đã quá hạn 5 phút
                .build();

        BookingItem item = BookingItem.builder()
                .booking(booking)
                .product(productRepository.findById(productId).orElseThrow())
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(25000))
                .status(BookingItemStatus.RESERVED)
                .build();
        booking.setItems(new java.util.ArrayList<>(List.of(item)));

        booking = bookingRepository.save(booking);

        // Kích hoạt job quét hủy
        expirationScheduler.cancelExpiredPendingBookings();

        Booking cancelled = bookingRepository.findById(booking.getId()).orElseThrow();
        assertThat(cancelled.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(cancelled.getItems().get(0).getStatus()).isEqualTo(BookingItemStatus.CANCELLED);

        // Kiểm tra tồn kho đã được hoàn lại đúng số lượng
        ProductInventory afterInv = productInventoryRepository.findByBranchIdAndProductId(branchId, productId).orElseThrow();
        assertThat(afterInv.getStockQuantity()).isEqualTo(beforeStock);
    }

    @Test
    @DisplayName("Chợ Pass Sân: Đăng bán slot, hiển thị trên chợ, người mua thanh toán qua ví thành công")
    void testSlotTransferMarketplaceFlow() throws Exception {
        User seller = userRepository.findByUsername("khachhang1").orElseThrow();
        User buyer = userRepository.findByUsername("hoivien_gold").orElseThrow();

        // 1. Tạo đơn đặt sân cho seller
        BookingRequestDto bookingReq = new BookingRequestDto();
        bookingReq.setBranchCode("NVL");
        bookingReq.setBookingDate(LocalDate.now().plusDays(7).toString());
        bookingReq.setCustomerName(seller.getFullName());
        bookingReq.setCustomerPhone("0987654321");
        bookingReq.setUserId(seller.getId());
        bookingReq.setSelectedSlots(List.of(new BookingRequestDto.SlotItemDto(3L, 8L)));

        Booking booking = bookingService.createBooking(bookingReq);
        BookingDetail detail = booking.getDetails().get(0);

        // 2. Seller đăng bán slot lên chợ pass
        SlotTransferDto transferDto = slotTransferService.listSlotForTransfer(
                detail.getId(),
                BigDecimal.valueOf(60000), // Giá pass: 60k
                "0987654321",
                seller
        );
        assertThat(transferDto.getStatus()).isEqualTo("LISTED");

        // 3. Khách hàng kiểm tra danh sách chợ pass qua API
        mockMvc.perform(get("/api/slot-transfers/market?branchId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Ghi nhận số dư ví trước giao dịch
        BigDecimal sellerBalanceBefore = walletRepository.findById(seller.getId()).map(Wallet::getBalance).orElse(BigDecimal.ZERO);
        BigDecimal buyerBalanceBefore = walletRepository.findById(buyer.getId()).map(Wallet::getBalance).orElse(BigDecimal.ZERO);

        // 4. Buyer nhận pass sân
        SlotTransferDto claimed = slotTransferService.claimSlotTransfer(transferDto.getId(), buyer);
        assertThat(claimed.getStatus()).isEqualTo("CLAIMED");

        // Kiểm tra ví
        BigDecimal sellerBalanceAfter = walletRepository.findById(seller.getId()).map(Wallet::getBalance).orElse(BigDecimal.ZERO);
        BigDecimal buyerBalanceAfter = walletRepository.findById(buyer.getId()).map(Wallet::getBalance).orElse(BigDecimal.ZERO);

        assertThat(buyerBalanceAfter).isEqualByComparingTo(buyerBalanceBefore.subtract(BigDecimal.valueOf(60000)));
        assertThat(sellerBalanceAfter).isEqualByComparingTo(sellerBalanceBefore.add(BigDecimal.valueOf(60000)));
    }

    private Branch initialInventoryBranch(Long id) {
        return Branch.builder().id(id).name("Chi nhánh NVL").code("NVL").build();
    }
}
