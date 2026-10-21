package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal amount;

    @Column(length = 255)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RefundStatus status = RefundStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
