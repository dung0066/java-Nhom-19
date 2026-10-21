package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Booking;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findAllByOrderByCreatedAtDesc();

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT b FROM Booking b JOIN b.details d WHERE d.slotDate = :date AND d.status != 'CANCELLED' ORDER BY b.createdAt DESC")
    List<Booking> findBySlotDate(@Param("date") LocalDate date);

    List<Booking> findByCustomerPhone(String customerPhone);

    List<Booking> findByStatusAndHoldExpiresAtBefore(BookingStatus status, LocalDateTime now);
}
