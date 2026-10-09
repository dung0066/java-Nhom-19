package com.example.Dat_san_cau_long.service;

import com.example.Dat_san_cau_long.dto.BookingRequestDto;
import com.example.Dat_san_cau_long.dto.MatrixResponseDto;
import com.example.Dat_san_cau_long.model.*;
import com.example.Dat_san_cau_long.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BranchRepository branchRepository;
    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;

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

        booking.setTotalPrice(totalPrice);
        booking.setTotalHours(totalHours);
        booking.setDetails(details);

        return bookingRepository.save(booking);
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
