package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.MembershipPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipPackageRepository extends JpaRepository<MembershipPackage, Long> {

    List<MembershipPackage> findByActiveTrueOrderByPriceAsc();

    Optional<MembershipPackage> findByCode(String code);

    boolean existsByCode(String code);
}
