package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.BookingItemStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 0)
    private BigDecimal unitPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingItemStatus status = BookingItemStatus.RESERVED;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;
}
