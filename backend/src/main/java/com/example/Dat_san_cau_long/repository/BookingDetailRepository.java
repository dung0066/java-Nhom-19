package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.BookingDetail;
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
           "WHERE b.code = :branchCode AND bd.slotDate = :date AND bd.status != 'CANCELLED'")
    List<BookingDetail> findActiveBookingsByBranchAndDate(@Param("branchCode") String branchCode, 
                                                         @Param("date") LocalDate date);

    Optional<BookingDetail> findByCourtIdAndTimeSlotIdAndSlotDateAndStatusNot(Long courtId, Long timeSlotId, LocalDate slotDate, String status);
}
