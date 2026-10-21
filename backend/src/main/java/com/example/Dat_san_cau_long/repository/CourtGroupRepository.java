package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.CourtGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtGroupRepository extends JpaRepository<CourtGroup, Long> {
    List<CourtGroup> findByBranchId(Long branchId);
}
