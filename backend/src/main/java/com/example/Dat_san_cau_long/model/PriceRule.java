package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.PriceDayType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "price_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id")
    private TimeSlot timeSlot;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false)
    @Builder.Default
    private PriceDayType dayType = PriceDayType.ALL;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
