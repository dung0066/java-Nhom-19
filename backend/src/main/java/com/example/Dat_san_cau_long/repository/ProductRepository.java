package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.category.code = :categoryCode AND p.active = true")
    List<Product> findByCategoryCodeAndActiveTrue(@Param("categoryCode") String categoryCode);
}
