package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.repository.BranchRepository;
import com.example.Dat_san_cau_long.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingApiController {

    private final BookingService bookingService;
    private final BranchRepository branchRepository;

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
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDto request) {
        try {
            Booking booking = bookingService.createBooking(request);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Đặt sân thành công!");
            res.put("bookingCode", booking.getBookingCode());
            res.put("totalPrice", booking.getTotalPrice());
            res.put("totalHours", booking.getTotalHours());
            res.put("customerName", booking.getCustomerName());
            res.put("bookingDate", booking.getBookingDate().toString());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/pass-slot")
    public ResponseEntity<?> togglePassSlot(
            @RequestParam Long detailId,
            @RequestParam(required = false) String contactPhone) {
        try {
            bookingService.togglePassStatus(detailId, contactPhone);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật trạng thái pass sân thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy đơn đặt sân thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
