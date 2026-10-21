package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.PriceRule;
import com.example.Dat_san_cau_long.model.enums.PriceDayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {

    @Query("SELECT pr FROM PriceRule pr " +
           "WHERE pr.active = true " +
           "AND (pr.branch IS NULL OR pr.branch.id = :branchId) " +
           "AND (pr.timeSlot IS NULL OR pr.timeSlot.id = :timeSlotId) " +
           "AND (pr.validFrom IS NULL OR :date >= pr.validFrom) " +
           "AND (pr.validTo IS NULL OR :date <= pr.validTo) " +
           "AND (pr.dayType = 'ALL' OR pr.dayType = :dayType) " +
           "ORDER BY pr.priority DESC")
    List<PriceRule> findCandidateRules(@Param("branchId") Long branchId,
                                       @Param("timeSlotId") Long timeSlotId,
                                       @Param("date") LocalDate date,
                                       @Param("dayType") PriceDayType dayType);
}
