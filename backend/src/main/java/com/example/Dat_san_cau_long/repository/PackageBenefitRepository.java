package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.PackageBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackageBenefitRepository extends JpaRepository<PackageBenefit, Long> {
    List<PackageBenefit> findByMembershipPackageId(Long packageId);
}
