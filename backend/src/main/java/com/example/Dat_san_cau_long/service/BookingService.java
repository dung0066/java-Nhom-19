package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.model.*;
import com.example.Dat_san_cau_long.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final MembershipPackageRepository packageRepository;

    public BookingService(BranchRepository branchRepository, CourtRepository courtRepository, TimeSlotRepository timeSlotRepository, BookingRepository bookingRepository, BookingDetailRepository bookingDetailRepository, UserRepository userRepository, MembershipPackageRepository packageRepository) {
        this.branchRepository = branchRepository;
        this.courtRepository = courtRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
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
                        .orElseThrow(() -> new RuntimeException("Chưa có dữ liệu chi nhánh!")));

        List<Branch> allBranches = branchRepository.findAll();
        List<Court> courts = courtRepository.findByBranchCodeOrderByCourtNumberAsc(currentBranch.getCode());
        List<TimeSlot> timeSlots = timeSlotRepository.findAllByOrderBySortOrderAsc();

        List<BookingDetail> activeBookings = bookingDetailRepository.findActiveBookingsByBranchAndDate(currentBranch.getCode(), date);

        Map<String, MatrixResponseDto.SlotStatusDto> statusMap = new HashMap<>();
        for (BookingDetail detail : activeBookings) {
            String key = detail.getCourt().getId() + "_" + detail.getTimeSlot().getId();
            statusMap.put(key, MatrixResponseDto.SlotStatusDto.builder()
                    .status(detail.getStatus())
                    .customerName(detail.getBooking() != null ? detail.getBooking().getCustomerName() : "Khách đã đặt")
                    .passContact(detail.getPassContact())
                    .price(detail.getPrice())
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh: " + req.getBranchCode()));

        LocalDate date = LocalDate.parse(req.getBookingDate());

        if (req.getSelectedSlots() == null || req.getSelectedSlots().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất 1 khung giờ đặt sân!");
        }

        // Tạo mã đặt sân ngẫu nhiên: WAY-YYYYMMDD-XXXX
        String bookingCode = "WAY-" + date.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (1000 + new Random().nextInt(9000));

        double totalPrice = 0.0;
        double totalHours = 0.0;

        List<BookingDetail> details = new ArrayList<>();
        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .customerName(req.getCustomerName())
                .customerPhone(req.getCustomerPhone())
                .customerEmail(req.getCustomerEmail())
                .bookingDate(date)
                .branch(branch)
                .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "VIETQR")
                .notes(req.getNotes())
                .status("CONFIRMED")
                .createdAt(LocalDateTime.now())
                .build();

        for (BookingRequestDto.SlotItemDto item : req.getSelectedSlots()) {
            Court court = courtRepository.findById(item.getCourtId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sân id: " + item.getCourtId()));
            TimeSlot slot = timeSlotRepository.findById(item.getTimeSlotId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ id: " + item.getTimeSlotId()));

            // Kiểm tra trùng lịch
            Optional<BookingDetail> existing = bookingDetailRepository.findByCourtIdAndTimeSlotIdAndSlotDateAndStatusNot(
                    court.getId(), slot.getId(), date, "CANCELLED");
            
            if (existing.isPresent()) {
                BookingDetail existDetail = existing.get();
                if ("PASS_WANTED".equals(existDetail.getStatus())) {
                    // Mua lại slot cần pass
                    existDetail.setStatus("BOOKED");
                    existDetail.setPassContact(null);
                    existDetail.setBooking(booking);
                    details.add(existDetail);
                    totalPrice += (slot.getIsPeakHour() != null && slot.getIsPeakHour()) ? slot.getPeakPrice() : slot.getStandardPrice();
                    totalHours += 1.0;
                    continue;
                } else {
                    throw new RuntimeException("Sân " + court.getName() + " lúc " + slot.getDisplayLabel() + " đã có người đặt trước!");
                }
            }

            double slotPrice = (slot.getIsPeakHour() != null && slot.getIsPeakHour()) ? slot.getPeakPrice() : slot.getStandardPrice();
            totalPrice += slotPrice;
            totalHours += 1.0;

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .court(court)
                    .timeSlot(slot)
                    .slotDate(date)
                    .price(slotPrice)
                    .status("BOOKED")
                    .build();

            details.add(detail);
        }

        // Kiểm tra người dùng và áp dụng ưu đãi gói hội viên
        User user = null;
        double discountPercent = 0.0;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null && user.isMembershipValid()) {
                discountPercent = user.getActiveDiscountPercent();
            }
        }

        double originalPrice = totalPrice;
        double discountAmount = 0.0;
        if (discountPercent > 0) {
            discountAmount = Math.round(originalPrice * (discountPercent / 100.0));
            totalPrice = originalPrice - discountAmount;
        }

        booking.setUser(user);
        booking.setOriginalPrice(originalPrice);
        booking.setDiscountAmount(discountAmount);
        booking.setTotalPrice(totalPrice);
        booking.setTotalHours(totalHours);
        booking.setDetails(details);

        Booking savedBooking = bookingRepository.save(booking);

        // Tích lũy điểm thưởng và chi tiêu từ hóa đơn đặt sân, tự động thăng hạng theo mốc
        if (user != null) {
            user.addSpendingAndPoints(totalPrice);
            autoUpgradeTier(user);
            userRepository.save(user);
        }

        return savedBooking;
    }

    /**
     * Tự động thăng hạng thành viên dựa trên mốc chi tiêu và điểm tích lũy:
     * - Mốc >= 10.000.000đ (hoặc >= 1000 điểm): Hạng Kim Cương VIP (DIAMOND - Giảm 10% + full đặc quyền)
     * - Mốc >= 5.000.000đ (hoặc >= 500 điểm): Hạng Vàng (GOLD - Giảm 8% + locker + sấy giày)
     * - Mốc >= 2.000.000đ (hoặc >= 200 điểm): Hạng Bạc (SILVER - Giảm 5% + gửi đồ lễ tân + khăn)
     */
    private void autoUpgradeTier(User user) {
        if (user == null || packageRepository == null) return;
        double spending = user.getTotalSpending() != null ? user.getTotalSpending() : 0.0;
        int points = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;

        String targetCode = null;
        if (spending >= 10000000.0 || points >= 1000) {
            targetCode = "DIAMOND";
        } else if (spending >= 5000000.0 || points >= 500) {
            targetCode = "GOLD";
        } else if (spending >= 2000000.0 || points >= 200) {
            targetCode = "SILVER";
        }

        if (targetCode != null) {
            String currentCode = user.getMembershipPackage() != null ? user.getMembershipPackage().getCode() : null;
            if (!targetCode.equals(currentCode)) {
                int currentRank = getRankLevel(currentCode);
                int targetRank = getRankLevel(targetCode);
                if (targetRank > currentRank) {
                    MembershipPackage newPkg = packageRepository.findByCode(targetCode).orElse(null);
                    if (newPkg != null) {
                        user.setMembershipPackage(newPkg);
                        // Hạng tích lũy theo mốc được công nhận dài hạn
                        user.setMembershipExpiresAt(null);
                    }
                }
            }
        }
    }

    private int getRankLevel(String code) {
        if ("DIAMOND".equals(code)) return 3;
        if ("GOLD".equals(code)) return 2;
        if ("SILVER".equals(code)) return 1;
        return 0;
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void togglePassStatus(Long detailId, String passContact) {
        BookingDetail detail = bookingDetailRepository.findById(detailId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đặt sân!"));
        
        if ("PASS_WANTED".equals(detail.getStatus())) {
            detail.setStatus("BOOKED");
            detail.setPassContact(null);
        } else {
            detail.setStatus("PASS_WANTED");
            detail.setPassContact(passContact != null ? passContact : "0889555559");
        }
        bookingDetailRepository.save(detail);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt sân!"));
        booking.setStatus("CANCELLED");
        for (BookingDetail d : booking.getDetails()) {
            d.setStatus("CANCELLED");
        }
        bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }
}
