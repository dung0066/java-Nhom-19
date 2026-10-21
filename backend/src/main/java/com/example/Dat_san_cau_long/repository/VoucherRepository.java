package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCodeAndActiveTrue(String code);
}
