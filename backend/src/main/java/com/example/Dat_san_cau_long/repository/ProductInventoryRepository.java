package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.ProductInventory;
import com.example.Dat_san_cau_long.model.ProductInventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductInventoryRepository extends JpaRepository<ProductInventory, ProductInventoryId> {

    List<ProductInventory> findByBranchId(Long branchId);

    List<ProductInventory> findByIdProductId(Long productId);

    Optional<ProductInventory> findByBranchIdAndProductId(Long branchId, Long productId);

    @org.springframework.transaction.annotation.Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProductInventory pi SET pi.stockQuantity = pi.stockQuantity - :qty " +
           "WHERE pi.id.branchId = :branchId AND pi.id.productId = :productId AND pi.stockQuantity >= :qty")
    int deductStockAtomic(@Param("branchId") Long branchId, @Param("productId") Long productId, @Param("qty") int qty);

    @org.springframework.transaction.annotation.Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE ProductInventory pi SET pi.stockQuantity = pi.stockQuantity + :qty " +
           "WHERE pi.id.branchId = :branchId AND pi.id.productId = :productId")
    int addStockAtomic(@Param("branchId") Long branchId, @Param("productId") Long productId, @Param("qty") int qty);
}
