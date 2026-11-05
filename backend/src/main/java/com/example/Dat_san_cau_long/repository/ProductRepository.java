package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT DISTINCT p FROM Product p JOIN FETCH p.category WHERE p.active = true")
    List<Product> findByActiveTrue();

    @Query("SELECT DISTINCT p FROM Product p JOIN FETCH p.category WHERE UPPER(p.category.code) = UPPER(:categoryCode) AND p.active = true")
    List<Product> findByCategoryCodeAndActiveTrue(@Param("categoryCode") String categoryCode);

    @Query("SELECT DISTINCT p FROM Product p JOIN FETCH p.category")
    List<Product> findAllWithCategory();
}
