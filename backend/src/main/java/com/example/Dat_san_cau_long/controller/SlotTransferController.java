package com.example.Dat_san_cau_long.controller;

import com.example.Dat_san_cau_long.dto.SlotTransferDto;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.security.CustomUserDetails;
import com.example.Dat_san_cau_long.service.SlotTransferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slot-transfers")
public class SlotTransferController {

    private final SlotTransferService slotTransferService;

    public SlotTransferController(SlotTransferService slotTransferService) {
        this.slotTransferService = slotTransferService;
    }

    @PostMapping("/list")
    public ResponseEntity<SlotTransferDto> listSlot(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long detailId = Long.parseLong(req.get("bookingDetailId").toString());
        BigDecimal passPrice = req.get("passPrice") != null
                ? new BigDecimal(req.get("passPrice").toString())
                : null;
        String contact = req.get("contact") != null ? req.get("contact").toString() : null;
        User seller = userDetails != null ? userDetails.getUser() : null;

        SlotTransferDto dto = slotTransferService.listSlotForTransfer(detailId, passPrice, contact, seller);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/market")
    public ResponseEntity<List<SlotTransferDto>> getMarketListings(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String date) {

        LocalDate targetDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : null;
        List<SlotTransferDto> listings = slotTransferService.getMarketListings(branchId, targetDate);
        return ResponseEntity.ok(listings);
    }

    @PostMapping("/{transferId}/claim")
    public ResponseEntity<SlotTransferDto> claimSlot(
            @PathVariable Long transferId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User buyer = userDetails != null ? userDetails.getUser() : null;
        SlotTransferDto result = slotTransferService.claimSlotTransfer(transferId, buyer);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{transferId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelListing(
            @PathVariable Long transferId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails != null ? userDetails.getUser() : null;
        slotTransferService.cancelListing(transferId, user);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy tin đăng pass sân thành công!"));
    }
}
