package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.MembershipPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipPackageRepository extends JpaRepository<MembershipPackage, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT p FROM MembershipPackage p LEFT JOIN FETCH p.benefits WHERE p.active = true ORDER BY p.price ASC")
    List<MembershipPackage> findByActiveTrueOrderByPriceAsc();

    Optional<MembershipPackage> findByCode(String code);

    boolean existsByCode(String code);
}
