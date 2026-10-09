package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByBookingDateOrderByCreatedAtDesc(LocalDate date);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
