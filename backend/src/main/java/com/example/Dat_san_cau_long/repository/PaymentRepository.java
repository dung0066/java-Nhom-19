package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Payment;
import com.example.Dat_san_cau_long.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentCode(String paymentCode);

    boolean existsByProviderTxnCode(String providerTxnCode);

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByUserMembershipId(Long userMembershipId);

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByPurposeAndStatusAndCreatedAtBefore(
            com.example.Dat_san_cau_long.model.enums.PaymentPurpose purpose,
            PaymentStatus status,
            LocalDateTime threshold);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Payment p SET p.status = com.example.Dat_san_cau_long.model.enums.PaymentStatus.PAID, " +
           "p.paidAt = :paidAt, p.providerTxnCode = :providerTxnCode " +
           "WHERE p.id = :id AND p.status = com.example.Dat_san_cau_long.model.enums.PaymentStatus.PENDING")
    int markPaidIfPending(@Param("id") Long id,
                          @Param("paidAt") LocalDateTime paidAt,
                          @Param("providerTxnCode") String providerTxnCode);
}
