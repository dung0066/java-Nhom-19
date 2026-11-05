package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.WalletResponseDto;
import com.example.Dat_san_cau_long.dto.WalletTopupRequestDto;
import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import com.example.Dat_san_cau_long.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletApiController {

    private final WalletService walletService;

    public WalletApiController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * Lấy số dư ví của người dùng đang đăng nhập
     */
    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WalletResponseDto> getMyBalance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        WalletResponseDto dto = walletService.getWalletBalance(userDetails.getUser().getId());
        return ResponseEntity.ok(dto);
    }

    /**
     * Nạp tiền vào ví (tạo lệnh thanh toán PENDING chờ xác nhận)
     */
    @PostMapping("/topup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> topupWallet(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                           @Valid @RequestBody WalletTopupRequestDto req) {
        Payment payment = walletService.createTopupPayment(userDetails.getUser().getId(), req);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Tạo yêu cầu nạp tiền thành công! Vui lòng chuyển khoản để hoàn tất giao dịch.");
        res.put("paymentId", payment.getId());
        res.put("paymentCode", payment.getPaymentCode());
        res.put("amount", payment.getAmount());
        res.put("method", payment.getMethod().name());
        res.put("status", payment.getStatus().name());
        res.put("createdAt", payment.getCreatedAt());

        return ResponseEntity.ok(res);
    }

    /**
     * Lịch sử giao dịch ví / thanh toán của người dùng
     */
    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getMyTransactions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Payment> list = walletService.getWalletPayments(userDetails.getUser().getId());
        return ResponseEntity.ok(list);
    }

    /**
     * Tra cứu trạng thái lệnh nạp ví (dành cho frontend polling thời gian thực)
     */
    @GetMapping("/topup/{paymentCode}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getTopupStatus(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                              @PathVariable String paymentCode) {
        Payment payment = walletService.getPaymentByCodeForUser(userDetails.getUser().getId(), paymentCode);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("paymentCode", payment.getPaymentCode());
        res.put("status", payment.getStatus().name());
        res.put("amount", payment.getAmount());
        res.put("paidAt", payment.getPaidAt());
        return ResponseEntity.ok(res);
    }
}
