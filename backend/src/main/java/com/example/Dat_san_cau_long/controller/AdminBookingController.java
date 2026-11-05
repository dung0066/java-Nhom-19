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

    public AdminBookingController(BookingRepository bookingRepository, BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<?> getBookings(@RequestParam(required = false) Long branchId,
                                         @RequestParam(required = false) String status,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (branchId != null) {
            Page<Booking> res = bookingRepository.findByBranchIdOrderByCreatedAtDesc(branchId, pageable);
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

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id,
                                                            @RequestBody(required = false) Map<String, String> body) {
        bookingService.cancelBooking(id);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đã hủy đơn đặt sân và hoàn trả tồn kho thành công!");
        return ResponseEntity.ok(res);
    }
}
