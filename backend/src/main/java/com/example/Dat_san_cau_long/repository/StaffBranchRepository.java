package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.StaffBranch;
import com.example.Dat_san_cau_long.model.StaffBranchId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffBranchRepository extends JpaRepository<StaffBranch, StaffBranchId> {
    List<StaffBranch> findByUserId(Long userId);
    List<StaffBranch> findByBranchId(Long branchId);
}
