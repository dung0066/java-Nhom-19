package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.BookingQuoteDto;
import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.service.BookingService;
import jakarta.validation.Valid;
import com.example.Dat_san_cau_long.security.AccessChecks;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
public class BookingApiController {

    private final BookingService bookingService;
    private final BranchRepository branchRepository;

    public BookingApiController(BookingService bookingService, BranchRepository branchRepository) {
        this.bookingService = bookingService;
        this.branchRepository = branchRepository;
    }

    @GetMapping("/branches")
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findByDeletedAtIsNull());
    }

    @GetMapping("/matrix")
    public ResponseEntity<MatrixResponseDto> getMatrix(
            @RequestParam(defaultValue = "NVL") String branch,
            @RequestParam(required = false) String date) {

        LocalDate bookingDate = (date != null && !date.isEmpty())
                ? LocalDate.parse(date)
                : LocalDate.now();

        MatrixResponseDto matrix = bookingService.getMatrixData(branch, bookingDate);
        return ResponseEntity.ok(matrix);
    }

    /** Báo giá trước khi đặt (có token thì kèm giảm giá hội viên); không lưu đơn. */
    @PostMapping("/quote")
    public ResponseEntity<BookingQuoteDto> quoteBooking(@RequestBody BookingRequestDto request,
                                                        @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(bookingService.quoteBooking(request, principal != null ? principal.getUser() : null));
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody BookingRequestDto request,
                                                             @AuthenticationPrincipal CustomUserDetails principal) {
        // Người đặt luôn lấy từ token đăng nhập, bỏ qua userId client gửi lên (chống mạo danh và hưởng giảm giá của người khác)
        request.setUserId(principal != null ? principal.getId() : null);
        Booking booking = bookingService.createBooking(request);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đặt sân thành công!");
        res.put("bookingId", booking.getId());
        res.put("bookingCode", booking.getBookingCode());
        res.put("status", booking.getStatus() != null ? booking.getStatus().name() : "PENDING");
        res.put("holdExpiresAt", booking.getHoldExpiresAt() != null ? booking.getHoldExpiresAt().toString() : null);
        Payment payment = bookingService.findLatestPayment(booking.getId());
        res.put("paymentCode", payment != null ? payment.getPaymentCode() : null);
        res.put("paymentMethod", payment != null ? payment.getMethod().name() : null);
        res.put("paymentStatus", payment != null ? payment.getStatus().name() : "NOT_REQUIRED");
        res.put("originalPrice", booking.getOriginalPrice());
        res.put("discountAmount", booking.getDiscountAmount());
        res.put("totalPrice", booking.getTotalPrice());
        res.put("totalHours", booking.getTotalHours());
        res.put("customerName", booking.getCustomerName());
        res.put("bookingDate", booking.getBookingDate() != null ? booking.getBookingDate().toString() : null);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getBookingByCode(@PathVariable String code) {
        return bookingService.getBookingByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/pass-slot")
    public ResponseEntity<Map<String, Object>> togglePassSlot(
            @RequestParam Long detailId,
            @RequestParam(required = false) String contactPhone) {
        bookingService.togglePassStatus(detailId, contactPhone);
        return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật trạng thái pass sân thành công!"));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /** Tra cứu cho khách vãng lai theo mã đơn hoặc số điện thoại đầy đủ. */
    @GetMapping("/lookup")
    public ResponseEntity<List<Booking>> lookup(@RequestParam String query) {
        return ResponseEntity.ok(bookingService.lookupBookings(query));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Long userId,
                                                           @AuthenticationPrincipal CustomUserDetails principal) {
        AccessChecks.requireSelfOrStaff(principal, userId);
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id,
                                                             @AuthenticationPrincipal CustomUserDetails principal) {
        bookingService.cancelBooking(id, principal);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy đơn đặt sân thành công!"));
    }
}
