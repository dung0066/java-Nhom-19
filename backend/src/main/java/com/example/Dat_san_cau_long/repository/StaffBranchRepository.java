package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.StaffBranch;
import com.example.Dat_san_cau_long.model.StaffBranchId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffBranchRepository extends JpaRepository<StaffBranch, StaffBranchId> {

    List<StaffBranch> findByIdUserId(Long userId);

    List<StaffBranch> findByIdBranchId(Long branchId);

    Optional<StaffBranch> findFirstByIdUserId(Long userId);

    Optional<StaffBranch> findFirstByIdBranchId(Long branchId);

    boolean existsByIdUserIdAndIdBranchId(Long userId, Long branchId);

    @Transactional
    @Modifying
    @Query("DELETE FROM StaffBranch sb WHERE sb.id.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM StaffBranch sb WHERE sb.id.branchId = :branchId")
    void deleteByBranchId(@Param("branchId") Long branchId);

    @Transactional
    @Modifying
    @Query("DELETE FROM StaffBranch sb WHERE sb.id.userId = :userId AND sb.id.branchId = :branchId")
    void deleteByUserIdAndBranchId(@Param("userId") Long userId, @Param("branchId") Long branchId);
}
