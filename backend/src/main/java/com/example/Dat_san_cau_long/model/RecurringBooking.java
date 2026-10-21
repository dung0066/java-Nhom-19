package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.RecurringBookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_bookings")
@Getter
@Setter
@Builder
public class RecurringBooking {

    public RecurringBooking() {
    }

    public RecurringBooking(Long id, User user, Court court, TimeSlot timeSlot, Byte dayOfWeek, LocalDate startDate, LocalDate endDate, RecurringBookingStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.court = court;
        this.timeSlot = timeSlot;
        this.dayOfWeek = dayOfWeek;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "day_of_week", nullable = false)
    private Byte dayOfWeek;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecurringBookingStatus status = RecurringBookingStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
