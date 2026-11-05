package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.repository.BookingRepository;
import com.example.Dat_san_cau_long.service.BookingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class AdminBookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final com.example.Dat_san_cau_long.repository.StaffBranchRepository staffBranchRepository;

    public AdminBookingController(BookingRepository bookingRepository,
                                  BookingService bookingService,
                                  com.example.Dat_san_cau_long.repository.StaffBranchRepository staffBranchRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.staffBranchRepository = staffBranchRepository;
    }

    @GetMapping
    public ResponseEntity<?> getBookings(@RequestParam(required = false) Long branchId,
                                         @RequestParam(required = false) String status,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size,
                                         @org.springframework.security.core.annotation.AuthenticationPrincipal com.example.Dat_san_cau_long.security.CustomUserDetails principal) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Long targetBranchId = branchId;
        // Nếu là ROLE_STAFF (Quản lý cửa hàng), chỉ cho xem đơn thuộc chi nhánh được ủy quyền
        if (principal != null && principal.getUser().getRole() == com.example.Dat_san_cau_long.model.enums.UserRole.ROLE_STAFF) {
            targetBranchId = staffBranchRepository.findFirstByIdUserId(principal.getId())
                    .map(sb -> sb.getId().getBranchId())
                    .orElse(targetBranchId);
        }

        if (targetBranchId != null) {
            Page<Booking> res = bookingRepository.findByBranchIdOrderByCreatedAtDesc(targetBranchId, pageable);
            return ResponseEntity.ok(res);
        }

        if (status != null && !status.trim().isEmpty()) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.trim().toUpperCase());
            List<Booking> res = bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus);
            return ResponseEntity.ok(res);
        }

        Page<Booking> res = bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmBooking(@PathVariable Long id) {
        Booking booking = bookingService.confirmBooking(id);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đã xác nhận đơn đặt sân thành công!");
        res.put("bookingCode", booking.getBookingCode());
        res.put("status", booking.getStatus().name());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<Map<String, Object>> checkinBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân ID: " + id));

        booking.setStatus(BookingStatus.COMPLETED);
        if (booking.getDetails() != null) {
            booking.getDetails().forEach(d -> d.setStatus(BookingDetailStatus.COMPLETED));
        }
        bookingRepository.save(booking);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đã check-in hoàn tất cho đơn đặt sân!");
        res.put("bookingCode", booking.getBookingCode());
        res.put("status", booking.getStatus().name());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/pay-remaining")
    public ResponseEntity<Map<String, Object>> payRemaining(@PathVariable Long id,
                                                            @RequestBody(required = false) Map<String, String> body) {
        String methodStr = body != null ? body.get("paymentMethod") : "CASH";
        com.example.Dat_san_cau_long.model.enums.PaymentMethod method =
                com.example.Dat_san_cau_long.model.enums.PaymentMethod.fromStringOrDefault(methodStr);

        com.example.Dat_san_cau_long.model.Payment payment = bookingService.payRemainingBooking(id, method);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đã thu nốt số tiền " + payment.getAmount().toPlainString() + " đ thành công!");
        res.put("paymentCode", payment.getPaymentCode());
        res.put("amount", payment.getAmount());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id,
                                                             @RequestBody(required = false) Map<String, String> body) {
        java.math.BigDecimal refunded = bookingService.cancelBooking(id);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("refundedAmount", refunded);
        if (refunded != null && refunded.compareTo(java.math.BigDecimal.ZERO) > 0) {
            res.put("message", "Đã hủy đơn đặt sân và hoàn trả " + refunded.toPlainString() + " đ về ví khách hàng thành công!");
        } else {
            res.put("message", "Đã hủy đơn đặt sân và hoàn trả tồn kho thành công!");
        }
        return ResponseEntity.ok(res);
    }
}
