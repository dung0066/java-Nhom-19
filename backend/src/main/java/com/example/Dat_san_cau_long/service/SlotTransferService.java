package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.SlotTransferDto;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.Branch;
import com.example.Dat_san_cau_long.model.Court;
import com.example.Dat_san_cau_long.model.SlotTransfer;
import com.example.Dat_san_cau_long.model.TimeSlot;
import com.example.Dat_san_cau_long.model.User;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.TransferStatus;
import com.example.Dat_san_cau_long.model.enums.UserRole;
import com.example.Dat_san_cau_long.repository.BookingDetailRepository;
import com.example.Dat_san_cau_long.repository.SlotTransferRepository;
import com.example.Dat_san_cau_long.repository.WalletRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Chợ pass sân: khách đăng bán slot đã đặt (LISTED), người khác nhận (CLAIMED) và trả tiền qua ví.
 * Slot đã qua giờ thì scheduler tự chuyển tin sang EXPIRED.
 */
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

    /** Chỉ chủ đơn (hoặc nhân viên/admin) mới được đăng bán slot; tiền bán về ví của chủ đơn. */
    @Transactional
    public SlotTransferDto listSlotForTransfer(Long detailId, BigDecimal passPrice, String contact, User requester) {
        BookingDetail detail = bookingDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đặt sân với ID: " + detailId));

        User owner = detail.getBooking() != null ? detail.getBooking().getUser() : null;
        requireOwnerOrStaff(requester, owner != null ? owner.getId() : null);

        if (detail.getStatus() != BookingDetailStatus.BOOKED) {
            throw new IllegalStateException("Chỉ có thể pass sân khi trạng thái là BOOKED!");
        }
        if (hasStarted(detail)) {
            throw new IllegalStateException("Slot đã qua giờ bắt đầu nên không thể đăng pass!");
        }
        if (slotTransferRepository.findByBookingDetailIdAndStatus(detailId, TransferStatus.LISTED).isPresent()) {
            throw new IllegalStateException("Sân này đã được đăng bán trên chợ pass!");
        }
        if (passPrice != null && passPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá pass không được là số âm!");
        }

        BigDecimal effectivePassPrice = passPrice != null ? passPrice : detail.getPrice();

        String effectiveContact = (contact != null && !contact.trim().isEmpty())
                ? contact.trim()
                : (detail.getBooking() != null ? detail.getBooking().getCustomerPhone() : null);

        SlotTransfer transfer = SlotTransfer.builder()
                .bookingDetail(detail)
                .fromUser(owner != null ? owner : requester)
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

    /**
     * Người mua nhận pass: trừ ví người mua, cộng ví người bán, đổi chủ đơn.
     * Dòng tin bị khóa khi xử lý nên hai người nhận cùng lúc thì chỉ một người thành công,
     * và nếu một bước lỗi thì toàn bộ giao dịch (kể cả tiền) được hoàn tác.
     */
    @Transactional
    public SlotTransferDto claimSlotTransfer(Long transferId, User buyer) {
        if (buyer == null) {
            throw new AccessDeniedException("Bạn cần đăng nhập để nhận pass sân!");
        }
        SlotTransfer transfer = slotTransferRepository.findByIdForUpdate(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin pass sân với ID: " + transferId));

        if (transfer.getStatus() != TransferStatus.LISTED) {
            throw new IllegalStateException("Tin pass sân này không còn khả dụng!");
        }
        if (hasStarted(transfer.getBookingDetail())) {
            throw new IllegalStateException("Slot đã qua giờ bắt đầu nên không thể nhận pass!");
        }
        if (transfer.getFromUser() != null && transfer.getFromUser().getId().equals(buyer.getId())) {
            throw new IllegalStateException("Không thể tự mua lại sân do chính mình đăng pass!");
        }

        BigDecimal price = transfer.getPassPrice();
        if (price != null && price.compareTo(BigDecimal.ZERO) > 0) {
            if (walletRepository.deductBalanceAtomic(buyer.getId(), price) == 0) {
                throw new IllegalStateException("Số dư ví không đủ để nhận pass sân! Cần: " + price + "đ");
            }
            if (transfer.getFromUser() == null
                    || walletRepository.addBalanceAtomic(transfer.getFromUser().getId(), price) == 0) {
                throw new IllegalStateException("Người bán chưa có ví để nhận tiền, giao dịch bị hủy!");
            }
        }

        transfer.setStatus(TransferStatus.CLAIMED);
        transfer.setToUser(buyer);
        transfer.setClaimedAt(LocalDateTime.now());
        transfer = slotTransferRepository.save(transfer);

        // Chuyển đơn sang tên người mua
        Booking booking = transfer.getBookingDetail().getBooking();
        if (booking != null) {
            booking.setUser(buyer);
            booking.setCustomerName(buyer.getFullName());
            booking.setCustomerPhone(buyer.getPhone());
        }

        return toDto(transfer);
    }

    /** Chỉ người đăng bán (hoặc nhân viên/admin) mới hủy được tin. */
    @Transactional
    public void cancelListing(Long transferId, User requester) {
        SlotTransfer transfer = slotTransferRepository.findByIdForUpdate(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin pass sân với ID: " + transferId));

        requireOwnerOrStaff(requester, transfer.getFromUser() != null ? transfer.getFromUser().getId() : null);

        if (transfer.getStatus() != TransferStatus.LISTED) {
            throw new IllegalStateException("Tin pass sân không ở trạng thái LISTED!");
        }

        transfer.setStatus(TransferStatus.CANCELLED);
        slotTransferRepository.save(transfer);
    }

    /** Cho qua nếu là chủ dữ liệu hoặc nhân viên/admin, ngược lại báo 403. */
    private void requireOwnerOrStaff(User requester, Long ownerId) {
        if (requester == null) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này!");
        }
        boolean isStaff = requester.getRole() == UserRole.ROLE_ADMIN || requester.getRole() == UserRole.ROLE_STAFF;
        boolean isOwner = ownerId != null && ownerId.equals(requester.getId());
        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("Bạn không có quyền thao tác trên tin pass sân của người khác!");
        }
    }

    /** Slot đã bắt đầu (hoặc đã qua) thì không còn pass được; cùng quy tắc với scheduler. */
    private boolean hasStarted(BookingDetail detail) {
        LocalDate today = LocalDate.now();
        if (detail.getSlotDate().isBefore(today)) {
            return true;
        }
        return detail.getSlotDate().isEqual(today) && !detail.getTimeSlot().getStartTime().isAfter(LocalTime.now());
    }

    /** Đổi SlotTransfer sang DTO; các thông tin sân, chi nhánh, khung giờ có thể null nên được kiểm tra từng cái. */
    private SlotTransferDto toDto(SlotTransfer transfer) {
        BookingDetail detail = transfer.getBookingDetail();
        Court court = (detail != null) ? detail.getCourt() : null;
        Branch branch = (court != null) ? court.getBranch() : null;
        TimeSlot timeSlot = (detail != null) ? detail.getTimeSlot() : null;

        return SlotTransferDto.builder()
                .id(transfer.getId())
                .bookingDetailId(detail != null ? detail.getId() : null)
                .branchId(branch != null ? branch.getId() : null)
                .branchName(branch != null ? branch.getName() : null)
                .courtName(court != null ? court.getName() : null)
                .slotDate(detail != null ? detail.getSlotDate() : null)
                .timeSlotId(timeSlot != null ? timeSlot.getId() : null)
                .timeSlotDisplay(timeSlot != null ? timeSlot.getDisplayLabel() : null)
                .originalPrice(detail != null ? detail.getPrice() : null)
                .passPrice(transfer.getPassPrice())
                .contact(transfer.getContact())
                .sellerName(transfer.getFromUser() != null ? transfer.getFromUser().getFullName() : "Khách hàng")
                .status(transfer.getStatus().name())
                .createdAt(transfer.getCreatedAt())
                .build();
    }
}
