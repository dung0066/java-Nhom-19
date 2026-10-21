package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@Builder
public class Review {

    public Review() {
    }

    public Review(Long id, Booking booking, User user, Byte rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.booking = booking;
        this.user = user;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Byte rating;

    @Column(length = 1000)
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
