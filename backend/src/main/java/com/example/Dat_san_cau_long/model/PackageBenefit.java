package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.BenefitType;
import com.example.Dat_san_cau_long.model.enums.QuotaPeriod;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "package_benefits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageBenefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "package_id", nullable = false)
    private MembershipPackage membershipPackage;

    @Enumerated(EnumType.STRING)
    @Column(name = "benefit_type", nullable = false)
    private BenefitType benefitType;

    @Column(precision = 8, scale = 2)
    private BigDecimal value;

    @Column(name = "quota_limit")
    private Integer quotaLimit;

    @Enumerated(EnumType.STRING)
    @Column(name = "quota_period")
    private QuotaPeriod quotaPeriod;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "courts", "manager"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "time_from")
    private LocalTime timeFrom;

    @Column(name = "time_to")
    private LocalTime timeTo;

    @Column(nullable = false, length = 255)
    private String description;
}
