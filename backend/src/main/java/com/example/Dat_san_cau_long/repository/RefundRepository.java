package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByPaymentId(Long paymentId);
    List<Refund> findByPaymentBookingId(Long bookingId);
}
