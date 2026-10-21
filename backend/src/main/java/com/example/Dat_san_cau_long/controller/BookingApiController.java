package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
        return ResponseEntity.ok(branchRepository.findAll());
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

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody BookingRequestDto request) {
        Booking booking = bookingService.createBooking(request);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đặt sân thành công!");
        res.put("bookingCode", booking.getBookingCode());
        res.put("originalPrice", booking.getOriginalPrice());
        res.put("discountAmount", booking.getDiscountAmount());
        res.put("totalPrice", booking.getTotalPrice());
        res.put("totalHours", booking.getTotalHours());
        res.put("customerName", booking.getCustomerName());
        res.put("bookingDate", booking.getBookingDate() != null ? booking.getBookingDate().toString() : null);
        return ResponseEntity.ok(res);
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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy đơn đặt sân thành công!"));
    }
}
