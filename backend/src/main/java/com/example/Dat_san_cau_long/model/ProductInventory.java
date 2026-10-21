package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInventory {

    @EmbeddedId
    private ProductInventoryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("branchId")
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;
}
