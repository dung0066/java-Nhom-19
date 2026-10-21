package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {

    @Query("SELECT c FROM Court c WHERE c.branch.code = :branchCode ORDER BY c.courtNumber ASC")
    List<Court> findByBranchCodeOrderByCourtNumberAsc(@Param("branchCode") String branchCode);

    @Query("SELECT c FROM Court c WHERE c.branch.id = :branchId ORDER BY c.courtNumber ASC")
    List<Court> findByBranchIdOrderByCourtNumberAsc(@Param("branchId") Long branchId);

    @Query("SELECT COUNT(c) FROM Court c WHERE c.branch.id = :branchId AND c.active = true")
    long countByBranchIdAndActiveTrue(@Param("branchId") Long branchId);

    @Modifying
    @Query("DELETE FROM Court c WHERE c.branch.id = :branchId")
    void deleteByBranchId(@Param("branchId") Long branchId);
}
