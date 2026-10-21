package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentCode(String paymentCode);

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByUserMembershipId(Long userMembershipId);

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Payment> findByStatus(PaymentStatus status);
}
