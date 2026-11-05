package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.SlotTransfer;
import com.example.Dat_san_cau_long.model.enums.TransferStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SlotTransferRepository extends JpaRepository<SlotTransfer, Long> {

    List<SlotTransfer> findByStatus(TransferStatus status);

    /** Khóa dòng tin khi nhận hoặc hủy để hai người không xử lý cùng một tin cùng lúc. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT st FROM SlotTransfer st WHERE st.id = :id")
    Optional<SlotTransfer> findByIdForUpdate(@Param("id") Long id);

    Optional<SlotTransfer> findByBookingDetailIdAndStatus(Long bookingDetailId, TransferStatus status);

    @Query("SELECT st FROM SlotTransfer st " +
           "JOIN st.bookingDetail bd " +
           "JOIN bd.court c " +
           "WHERE c.branch.id = :branchId AND bd.slotDate = :date AND st.status = 'LISTED'")
    List<SlotTransfer> findListedByBranchAndDate(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("UPDATE SlotTransfer st SET st.status = 'EXPIRED' WHERE st.status = 'LISTED' AND st.bookingDetail.id IN (" +
           "SELECT bd.id FROM BookingDetail bd WHERE bd.slotDate < :today OR (bd.slotDate = :today AND bd.timeSlot.startTime <= :nowTime))")
    int expirePastSlotTransfersAtomic(@Param("today") java.time.LocalDate today, @Param("nowTime") java.time.LocalTime nowTime);
}
