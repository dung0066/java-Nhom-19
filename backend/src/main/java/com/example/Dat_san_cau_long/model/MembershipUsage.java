package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "membership_usage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_membership_id", nullable = false)
    private UserMembership userMembership;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "benefit_id", nullable = false)
    private PackageBenefit packageBenefit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @CreationTimestamp
    @Column(name = "used_at", nullable = false, updatable = false)
    private LocalDateTime usedAt;
}
