package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.BookingItem;
import com.example.Dat_san_cau_long.model.enums.BookingItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingItemRepository extends JpaRepository<BookingItem, Long> {

    List<BookingItem> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(SUM(bi.quantity), 0) FROM BookingItem bi " +
           "JOIN bi.booking b " +
           "JOIN b.details d " +
           "WHERE b.branch.id = :branchId " +
           "AND bi.product.id = :productId " +
           "AND d.slotDate = :date " +
           "AND bi.status IN :statuses")
    int countReservedRentalQuantity(@Param("branchId") Long branchId,
                                    @Param("productId") Long productId,
                                    @Param("date") LocalDate date,
                                    @Param("statuses") Collection<BookingItemStatus> statuses);
}
