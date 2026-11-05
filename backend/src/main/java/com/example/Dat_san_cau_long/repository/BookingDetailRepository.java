package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.BookingDetail;
import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, Long> {

    @Query("SELECT bd FROM BookingDetail bd " +
           "JOIN bd.court c " +
           "JOIN c.branch b " +
           "WHERE b.code = :branchCode AND bd.slotDate = :date AND bd.status != com.example.Dat_san_cau_long.model.enums.BookingDetailStatus.CANCELLED")
    List<BookingDetail> findActiveBookingsByBranchAndDate(@Param("branchCode") String branchCode,
                                                         @Param("date") LocalDate date);

    Optional<BookingDetail> findByCourtIdAndTimeSlotIdAndSlotDateAndStatusNot(Long courtId, Long timeSlotId, LocalDate slotDate, BookingDetailStatus status);

    List<BookingDetail> findByBookingId(Long bookingId);

    long countByCourtId(Long courtId);

    /** Số slot đã đặt (BOOKED) từ hôm nay trở đi của một sân; dùng để chặn xóa tạm sân còn lịch chưa diễn ra. */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(bd) FROM BookingDetail bd WHERE bd.court.id = :courtId AND bd.status = :status AND bd.slotDate >= :today")
    long countUpcomingByCourtId(@org.springframework.data.repository.query.Param("courtId") Long courtId,
                                @org.springframework.data.repository.query.Param("status") com.example.Dat_san_cau_long.model.enums.BookingDetailStatus status,
                                @org.springframework.data.repository.query.Param("today") java.time.LocalDate today);

    /** Số slot đã đặt (BOOKED) từ hôm nay trở đi của cả chi nhánh. */
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(bd) FROM BookingDetail bd WHERE bd.court.branch.id = :branchId AND bd.status = :status AND bd.slotDate >= :today")
    long countUpcomingByBranchId(@org.springframework.data.repository.query.Param("branchId") Long branchId,
                                 @org.springframework.data.repository.query.Param("status") com.example.Dat_san_cau_long.model.enums.BookingDetailStatus status,
                                 @org.springframework.data.repository.query.Param("today") java.time.LocalDate today);
}
