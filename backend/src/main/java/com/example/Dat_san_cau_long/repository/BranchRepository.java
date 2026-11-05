package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    Optional<Branch> findByCode(String code);

    // Các truy vấn dưới đây bỏ qua chi nhánh đang nằm trong thùng rác (deleted_at khác null)
    List<Branch> findByDeletedAtIsNull();

    Optional<Branch> findByIdAndDeletedAtIsNull(Long id);

    Optional<Branch> findByCodeAndDeletedAtIsNull(String code);

    long countByDeletedAtIsNull();

    List<Branch> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);
}
