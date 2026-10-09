package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findByBranchCodeOrderByCourtNumberAsc(String branchCode);
    List<Court> findByBranchIdOrderByCourtNumberAsc(Long branchId);
    void deleteByBranchId(Long branchId);
}
