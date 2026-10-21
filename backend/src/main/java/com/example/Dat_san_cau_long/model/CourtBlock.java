package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "court_blocks")
@Getter
@Setter
@Builder
public class CourtBlock {

    public CourtBlock() {
    }

    public CourtBlock(Long id, Court court, LocalDateTime startAt, LocalDateTime endAt, String reason, Long createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.court = court;
        this.startAt = startAt;
        this.endAt = endAt;
        this.reason = reason;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(length = 255)
    private String reason;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
