package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.RecurringBooking;
import com.example.Dat_san_cau_long.model.enums.RecurringBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Long> {
    List<RecurringBooking> findByUserId(Long userId);
    List<RecurringBooking> findByCourtIdAndStatus(Long courtId, RecurringBookingStatus status);
}
