package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "membership_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "discount_from_time")
    private LocalTime discountFromTime;

    @Column(name = "discount_to_time")
    private LocalTime discountToTime;

    @Column(name = "student_only", nullable = false)
    @Builder.Default
    private Boolean studentOnly = false;

    @Column(length = 500)
    private String description;

    @Column(name = "badge_color", nullable = false, length = 30)
    @Builder.Default
    private String badgeColor = "#0284c7";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String icon = "fa-solid fa-crown";

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "membershipPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PackageBenefit> benefits = new ArrayList<>();
}
