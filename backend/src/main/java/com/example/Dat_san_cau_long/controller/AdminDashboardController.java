package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class AdminDashboardController {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourtRepository courtRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;

    public AdminDashboardController(BookingRepository bookingRepository,
                                    PaymentRepository paymentRepository,
                                    UserRepository userRepository,
                                    CourtRepository courtRepository,
                                    BranchRepository branchRepository,
                                    ProductRepository productRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.courtRepository = courtRepository;
        this.branchRepository = branchRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAll();

        long totalBookings = allBookings.size();
        long pendingBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();
        long confirmedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CONFIRMED).count();
        long completedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED).count();
        long cancelledBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();

        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED && b.getTotalPrice() != null)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalUsers = userRepository.count();
        long totalCourts = courtRepository.count();
        long totalBranches = branchRepository.count();
        long totalProducts = productRepository.count();

        long pendingPayments = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .count();

        List<Booking> recentBookings = bookingRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        Map<String, BigDecimal> branchRevenue = new HashMap<>();
        for (Booking b : allBookings) {
            if (b.getStatus() != BookingStatus.CANCELLED && b.getBranch() != null && b.getTotalPrice() != null) {
                String branchName = b.getBranch().getName();
                branchRevenue.put(branchName, branchRevenue.getOrDefault(branchName, BigDecimal.ZERO).add(b.getTotalPrice()));
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("cancelledBookings", cancelledBookings);
        stats.put("totalUsers", totalUsers);
        stats.put("totalCourts", totalCourts);
        stats.put("totalBranches", totalBranches);
        stats.put("totalProducts", totalProducts);
        stats.put("pendingPayments", pendingPayments);
        stats.put("recentBookings", recentBookings);
        stats.put("branchRevenue", branchRevenue);

        return ResponseEntity.ok(stats);
    }
}
