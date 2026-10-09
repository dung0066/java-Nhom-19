package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // RACQUET, SHOES, ACCESSORY

    private String brand;

    @Column(nullable = false)
    private Double price;

    private String priceUnit; // / buổi chơi, / ống 12 quả, / món

    @Column(length = 1000)
    private String imageUrl;

    private String badge; // HOT NHẤT, VIP, BÁN CHẠY...

    private String spec1; // Trọng lượng: 4U/G5

    private String spec2; // Lực căng: 11.0 kg

    @Column(length = 1000)
    private String description;

    @Builder.Default
    private Boolean active = true;
}
