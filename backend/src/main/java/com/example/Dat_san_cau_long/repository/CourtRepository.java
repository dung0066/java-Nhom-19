package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {

    @Query("SELECT c FROM Court c WHERE c.branch.code = :branchCode AND c.deletedAt IS NULL ORDER BY c.courtNumber ASC")
    List<Court> findByBranchCodeOrderByCourtNumberAsc(@Param("branchCode") String branchCode);

    @Query("SELECT c FROM Court c WHERE c.branch.id = :branchId AND c.deletedAt IS NULL ORDER BY c.courtNumber ASC")
    List<Court> findByBranchIdOrderByCourtNumberAsc(@Param("branchId") Long branchId);

    @Query("SELECT COUNT(c) FROM Court c WHERE c.branch.id = :branchId AND c.active = true AND c.deletedAt IS NULL")
    long countByBranchIdAndActiveTrue(@Param("branchId") Long branchId);

    @Modifying
    @Query("DELETE FROM Court c WHERE c.branch.id = :branchId")
    void deleteByBranchId(@Param("branchId") Long branchId);

    @Query("SELECT COUNT(c) > 0 FROM Court c WHERE c.branch.id = :branchId AND c.courtNumber = :courtNumber")
    boolean existsByBranchIdAndCourtNumber(@Param("branchId") Long branchId, @Param("courtNumber") Integer courtNumber);

    @Query("SELECT COUNT(c) > 0 FROM Court c WHERE c.branch.id = :branchId AND c.courtNumber = :courtNumber AND c.id <> :id")
    boolean existsByBranchIdAndCourtNumberAndIdNot(@Param("branchId") Long branchId, @Param("courtNumber") Integer courtNumber, @Param("id") Long id);

    // Thùng rác: sân bị xóa tạm có deleted_at khác null
    List<Court> findByDeletedAtIsNull();

    Optional<Court> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT c FROM Court c WHERE c.branch.id = :branchId AND c.courtNumber = :courtNumber AND c.deletedAt IS NULL")
    Optional<Court> findByBranchIdAndCourtNumberAndDeletedAtIsNull(@Param("branchId") Long branchId, @Param("courtNumber") Integer courtNumber);

    long countByDeletedAtIsNull();

    List<Court> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    /** Các sân bị xóa tạm cùng lúc với chi nhánh (cùng mốc deleted_at) để khôi phục theo chi nhánh. */
    @Query("SELECT c FROM Court c WHERE c.branch.id = :branchId AND c.deletedAt = :deletedAt")
    List<Court> findByBranchIdAndDeletedAt(@Param("branchId") Long branchId, @Param("deletedAt") LocalDateTime deletedAt);
}
