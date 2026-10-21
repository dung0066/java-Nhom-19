package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.dto.ResolvedPriceInfo;
import com.example.Dat_san_cau_long.exception.ResourceNotFoundException;
import com.example.Dat_san_cau_long.model.*;
import com.example.Dat_san_cau_long.model.enums.*;
import com.example.Dat_san_cau_long.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class BookingService {

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final PackageBenefitRepository packageBenefitRepository;
    private final ProductRepository productRepository;
    private final ProductInventoryRepository productInventoryRepository;
    private final PricingService pricingService;

    public BookingService(BranchRepository branchRepository,
                          CourtRepository courtRepository,
                          TimeSlotRepository timeSlotRepository,
                          BookingRepository bookingRepository,
                          BookingDetailRepository bookingDetailRepository,
                          UserRepository userRepository,
                          UserMembershipRepository userMembershipRepository,
                          PackageBenefitRepository packageBenefitRepository,
                          ProductRepository productRepository,
                          ProductInventoryRepository productInventoryRepository,
                          PricingService pricingService) {
        this.branchRepository = branchRepository;
        this.courtRepository = courtRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.userRepository = userRepository;
        this.userMembershipRepository = userMembershipRepository;
        this.packageBenefitRepository = packageBenefitRepository;
        this.productRepository = productRepository;
        this.productInventoryRepository = productInventoryRepository;
        this.pricingService = pricingService;
    }

    public MatrixResponseDto getMatrixData(String branchCode, LocalDate date) {
        if (branchCode == null || branchCode.isEmpty()) {
            branchCode = "NVL";
        }
        if (date == null) {
            date = LocalDate.now();
        }

        final String finalBranchCode = branchCode;
        Branch currentBranch = branchRepository.findByCode(finalBranchCode)
                .orElseGet(() -> branchRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Chưa có dữ liệu chi nhánh!")));

        List<Branch> allBranches = branchRepository.findAll();
        List<Court> courts = courtRepository.findByBranchCodeOrderByCourtNumberAsc(currentBranch.getCode());
        List<TimeSlot> timeSlots = timeSlotRepository.findAllByOrderBySortOrderAsc();

        // Điền giá động và trạng thái cao điểm cho từng khung giờ
        for (TimeSlot slot : timeSlots) {
            ResolvedPriceInfo priceInfo = pricingService.resolvePriceInfo(currentBranch.getId(), slot.getId(), date);
            slot.setPrice(priceInfo.getPrice());
            slot.setIsPeak(priceInfo.isPeak());
            slot.setIsPeakHour(priceInfo.isPeak());
            slot.setStandardPrice(priceInfo.getStandardPrice());
            slot.setPeakPrice(priceInfo.getPeakPrice());
        }

        List<BookingDetail> activeBookings = bookingDetailRepository.findActiveBookingsByBranchAndDate(currentBranch.getCode(), date);

        Map<String, MatrixResponseDto.SlotStatusDto> statusMap = new HashMap<>();
        for (BookingDetail detail : activeBookings) {
            String key = detail.getCourt().getId() + "_" + detail.getTimeSlot().getId();
            statusMap.put(key, MatrixResponseDto.SlotStatusDto.builder()
                    .status(detail.getStatus().name())
                    .customerName(detail.getBooking() != null ? detail.getBooking().getCustomerName() : "Khách đã đặt")
                    .passContact(null)
                    .price(detail.getPrice() != null ? detail.getPrice().doubleValue() : 70000.0)
                    .bookingDetailId(detail.getId())
                    .build());
        }

        return MatrixResponseDto.builder()
                .currentBranch(currentBranch)
                .allBranches(allBranches)
                .selectedDate(date)
                .courts(courts)
                .timeSlots(timeSlots)
                .slotStatusMap(statusMap)
                .build();
    }

    @Transactional
    public Booking createBooking(BookingRequestDto req) {
        Branch branch = branchRepository.findByCode(req.getBranchCode())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh: " + req.getBranchCode()));

        LocalDate date = LocalDate.parse(req.getBookingDate());

        if (req.getSelectedSlots() == null || req.getSelectedSlots().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 khung giờ đặt sân!");
        }

        String bookingCode = "WAY-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + new Random().nextInt(9000));

        // Xác định thời gian giữ chỗ (mặc định 10 phút, hội viên có đặc quyền HOLD_MINUTES có thể 15 phút)
        int holdMinutes = 10;
        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null) {
                Optional<UserMembership> activeMembership = userMembershipRepository.findActiveMembershipForUser(user.getId(), LocalDateTime.now());
                if (activeMembership.isPresent()) {
                    List<PackageBenefit> benefits = packageBenefitRepository.findByMembershipPackageId(activeMembership.get().getMembershipPackage().getId());
                    for (PackageBenefit b : benefits) {
                        if (b.getBenefitType() == BenefitType.HOLD_MINUTES && b.getValue() != null && b.getValue().compareTo(BigDecimal.ZERO) > 0) {
                            holdMinutes = b.getValue().intValue();
                            break;
                        }
                    }
                }
            }
        }

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .customerName(req.getCustomerName())
                .customerPhone(req.getCustomerPhone())
                .customerEmail(req.getCustomerEmail())
                .branch(branch)
                .notes(req.getNotes())
                .status(BookingStatus.CONFIRMED)
                .holdExpiresAt(LocalDateTime.now().plusMinutes(holdMinutes))
                .user(user)
                .build();

        List<BookingDetail> details = new ArrayList<>();
        BigDecimal totalDiscount = BigDecimal.ZERO;

        for (BookingRequestDto.SlotItemDto item : req.getSelectedSlots()) {
            Court court = courtRepository.findById(item.getCourtId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sân id: " + item.getCourtId()));
            TimeSlot slot = timeSlotRepository.findById(item.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giờ id: " + item.getTimeSlotId()));

            Optional<BookingDetail> existing = bookingDetailRepository.findByCourtIdAndTimeSlotIdAndSlotDateAndStatusNot(
                    court.getId(), slot.getId(), date, BookingDetailStatus.CANCELLED);

            if (existing.isPresent()) {
                throw new IllegalStateException("Sân " + court.getName() + " lúc " + slot.getDisplayLabel() + " đã có người đặt trước!");
            }

            // Tính giá động qua PricingService
            BigDecimal slotPrice = pricingService.resolvePrice(branch.getId(), slot.getId(), date);

            // Tính chiết khấu hội viên nếu có
            if (user != null) {
                BigDecimal slotDiscount = pricingService.calculateDiscount(slotPrice, user, slot, date);
                totalDiscount = totalDiscount.add(slotDiscount);
            }

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .branchId(branch.getId())
                    .court(court)
                    .timeSlot(slot)
                    .slotDate(date)
                    .price(slotPrice)
                    .status(BookingDetailStatus.BOOKED)
                    .build();

            details.add(detail);
        }

        // Xử lý sản phẩm mua kèm và trừ tồn kho
        List<BookingItem> bookingItems = new ArrayList<>();
        if (req.getAddonItems() != null && !req.getAddonItems().isEmpty()) {
            for (BookingRequestDto.AddonItemDto addon : req.getAddonItems()) {
                if (addon.getProductId() == null || addon.getQuantity() == null || addon.getQuantity() <= 0) {
                    continue;
                }

                Product product = productRepository.findById(addon.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID: " + addon.getProductId()));

                int updated = productInventoryRepository.deductStockAtomic(branch.getId(), product.getId(), addon.getQuantity());
                if (updated == 0) {
                    ProductInventory inv = productInventoryRepository.findByBranchIdAndProductId(branch.getId(), product.getId()).orElse(null);
                    int remaining = inv != null ? inv.getStockQuantity() : 0;
                    throw new IllegalStateException("Sản phẩm '" + product.getName() + "' tại chi nhánh " + branch.getName() + " không đủ tồn kho (cần " + addon.getQuantity() + ", hiện có " + remaining + ")!");
                }

                BookingItem bookingItem = BookingItem.builder()
                        .booking(booking)
                        .product(product)
                        .quantity(addon.getQuantity())
                        .unitPrice(product.getPrice())
                        .status(BookingItemStatus.RESERVED)
                        .build();

                bookingItems.add(bookingItem);
            }
        }

        if (user != null) {
            userMembershipRepository.findActiveMembershipForUser(user.getId(), LocalDateTime.now())
                    .ifPresent(booking::setAppliedMembership);
        }

        booking.setDiscountAmount(totalDiscount);
        booking.setDetails(details);
        booking.setItems(bookingItems);

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void togglePassStatus(Long detailId, String passContact) {
        BookingDetail detail = bookingDetailRepository.findById(detailId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi tiết đặt sân!"));
        bookingDetailRepository.save(detail);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt sân!"));
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        for (BookingDetail d : booking.getDetails()) {
            d.setStatus(BookingDetailStatus.CANCELLED);
        }
        for (BookingItem item : booking.getItems()) {
            if (item.getStatus() != BookingItemStatus.CANCELLED) {
                item.setStatus(BookingItemStatus.CANCELLED);
                if (booking.getBranch() != null && item.getProduct() != null) {
                    productInventoryRepository.addStockAtomic(
                            booking.getBranch().getId(),
                            item.getProduct().getId(),
                            item.getQuantity()
                    );
                }
            }
        }
        bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }
}
