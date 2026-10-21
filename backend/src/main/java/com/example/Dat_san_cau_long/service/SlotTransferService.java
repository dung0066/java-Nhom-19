package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.SlotTransferDto;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.SlotTransfer;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.Wallet;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.TransferStatus;
import com.example.Dat_san_cau_long.repository.BookingDetailRepository;
import com.example.Dat_san_cau_long.repository.SlotTransferRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotTransferService {

    private final SlotTransferRepository slotTransferRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final WalletRepository walletRepository;

    public SlotTransferService(SlotTransferRepository slotTransferRepository,
                               BookingDetailRepository bookingDetailRepository,
                               WalletRepository walletRepository) {
        this.slotTransferRepository = slotTransferRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public SlotTransferDto listSlotForTransfer(Long detailId, BigDecimal passPrice, String contact, User seller) {
        BookingDetail detail = bookingDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đặt sân với ID: " + detailId));

        if (detail.getStatus() != BookingDetailStatus.BOOKED) {
            throw new IllegalStateException("Chỉ có thể pass sân khi trạng thái là BOOKED!");
        }

        if (slotTransferRepository.findByBookingDetailIdAndStatus(detailId, TransferStatus.LISTED).isPresent()) {
            throw new IllegalStateException("Sân này đã được đăng bán trên chợ pass!");
        }

        BigDecimal effectivePassPrice = (passPrice != null && passPrice.compareTo(BigDecimal.ZERO) >= 0)
                ? passPrice
                : detail.getPrice();

        String effectiveContact = (contact != null && !contact.trim().isEmpty())
                ? contact.trim()
                : (detail.getBooking() != null ? detail.getBooking().getCustomerPhone() : null);

        SlotTransfer transfer = SlotTransfer.builder()
                .bookingDetail(detail)
                .fromUser(seller != null ? seller : (detail.getBooking() != null ? detail.getBooking().getUser() : null))
                .passPrice(effectivePassPrice)
                .contact(effectiveContact)
                .status(TransferStatus.LISTED)
                .build();

        transfer = slotTransferRepository.save(transfer);
        return toDto(transfer);
    }

    public List<SlotTransferDto> getMarketListings(Long branchId, LocalDate date) {
        List<SlotTransfer> list;
        if (branchId != null && date != null) {
            list = slotTransferRepository.findListedByBranchAndDate(branchId, date);
        } else {
            list = slotTransferRepository.findByStatus(TransferStatus.LISTED);
        }

        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SlotTransferDto claimSlotTransfer(Long transferId, User buyer) {
        SlotTransfer transfer = slotTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin pass sân với ID: " + transferId));

        if (transfer.getStatus() != TransferStatus.LISTED) {
            throw new IllegalStateException("Tin pass sân này không còn khả dụng!");
        }

        if (buyer != null && transfer.getFromUser() != null && transfer.getFromUser().getId().equals(buyer.getId())) {
            throw new IllegalStateException("Không thể tự mua lại sân do chính mình đăng pass!");
        }

        // Nếu thanh toán qua ví (buyer có tài khoản và giá pass > 0)
        BigDecimal price = transfer.getPassPrice();
        if (price != null && price.compareTo(BigDecimal.ZERO) > 0 && buyer != null) {
            Wallet buyerWallet = walletRepository.findById(buyer.getId())
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy ví của người mua!"));

            if (buyerWallet.getBalance().compareTo(price) < 0) {
                throw new IllegalStateException("Số dư ví không đủ để nhận pass sân! Cần: " + price + "đ, hiện có: " + buyerWallet.getBalance() + "đ");
            }

            // Trừ tiền người mua
            buyerWallet.setBalance(buyerWallet.getBalance().subtract(price));
            walletRepository.save(buyerWallet);

            // Cộng tiền người bán
            if (transfer.getFromUser() != null) {
                walletRepository.findById(transfer.getFromUser().getId()).ifPresent(sellerWallet -> {
                    sellerWallet.setBalance(sellerWallet.getBalance().add(price));
                    walletRepository.save(sellerWallet);
                });
            }
        }

        transfer.setStatus(TransferStatus.CLAIMED);
        transfer.setToUser(buyer);
        transfer.setClaimedAt(LocalDateTime.now());
        transfer = slotTransferRepository.save(transfer);

        // Cập nhật người sở hữu trong đơn
        if (buyer != null && transfer.getBookingDetail() != null && transfer.getBookingDetail().getBooking() != null) {
            transfer.getBookingDetail().getBooking().setUser(buyer);
            transfer.getBookingDetail().getBooking().setCustomerName(buyer.getFullName());
            transfer.getBookingDetail().getBooking().setCustomerPhone(buyer.getPhone());
        }

        return toDto(transfer);
    }

    @Transactional
    public void cancelListing(Long transferId, User user) {
        SlotTransfer transfer = slotTransferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin pass sân với ID: " + transferId));

        if (transfer.getStatus() != TransferStatus.LISTED) {
            throw new IllegalStateException("Tin pass sân không ở trạng thái LISTED!");
        }

        transfer.setStatus(TransferStatus.CANCELLED);
        slotTransferRepository.save(transfer);
    }

    private SlotTransferDto toDto(SlotTransfer transfer) {
        BookingDetail detail = transfer.getBookingDetail();
        return SlotTransferDto.builder()
                .id(transfer.getId())
                .bookingDetailId(detail != null ? detail.getId() : null)
                .branchId(detail != null && detail.getCourt() != null && detail.getCourt().getBranch() != null ? detail.getCourt().getBranch().getId() : null)
                .branchName(detail != null && detail.getCourt() != null && detail.getCourt().getBranch() != null ? detail.getCourt().getBranch().getName() : null)
                .courtName(detail != null && detail.getCourt() != null ? detail.getCourt().getName() : null)
                .slotDate(detail != null ? detail.getSlotDate() : null)
                .timeSlotId(detail != null && detail.getTimeSlot() != null ? detail.getTimeSlot().getId() : null)
                .timeSlotDisplay(detail != null && detail.getTimeSlot() != null ? detail.getTimeSlot().getDisplayLabel() : null)
                .originalPrice(detail != null ? detail.getPrice() : null)
                .passPrice(transfer.getPassPrice())
                .contact(transfer.getContact())
                .sellerName(transfer.getFromUser() != null ? transfer.getFromUser().getFullName() : "Khách hàng")
                .status(transfer.getStatus().name())
                .createdAt(transfer.getCreatedAt())
                .build();
    }
}
