package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import com.example.Dat_san_cau_long.repository.PaymentRepository;
import com.example.Dat_san_cau_long.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
public class AdminPaymentController {

    private final WalletService walletService;
    private final PaymentRepository paymentRepository;

    public AdminPaymentController(WalletService walletService, PaymentRepository paymentRepository) {
        this.walletService = walletService;
        this.paymentRepository = paymentRepository;
    }

    /**
     * Admin/Staff xác nhận một giao dịch thanh toán (Nạp ví, Gói hội viên, Đơn đặt sân)
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmPayment(@PathVariable Long id) {
        Payment payment = walletService.confirmPayment(id);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Đã xác nhận thanh toán thành công!");
        res.put("paymentId", payment.getId());
        res.put("paymentCode", payment.getPaymentCode());
        res.put("purpose", payment.getPurpose().name());
        res.put("amount", payment.getAmount());
        res.put("status", payment.getStatus().name());
        res.put("paidAt", payment.getPaidAt());

        return ResponseEntity.ok(res);
    }

    /**
     * Tra cứu danh sách thanh toán theo trạng thái (hoặc tất cả)
     */
    @GetMapping
    public ResponseEntity<List<Payment>> getPayments(@RequestParam(required = false) String status) {
        if (status != null && !status.trim().isEmpty()) {
            PaymentStatus paymentStatus = PaymentStatus.valueOf(status.trim().toUpperCase());
            return ResponseEntity.ok(paymentRepository.findByStatus(paymentStatus));
        }
        return ResponseEntity.ok(paymentRepository.findAll());
    }
}
