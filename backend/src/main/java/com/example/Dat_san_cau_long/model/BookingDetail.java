package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "booking_details", uniqueConstraints = {
    @UniqueConstraint(name = "uk_slot_active", columnNames = {"court_id", "time_slot_id", "slot_date", "active_slot_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branch", "courtGroup"})
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingDetailStatus status = BookingDetailStatus.BOOKED;

    @Column(name = "active_slot_key", insertable = false, updatable = false)
    private Byte activeSlotKey;
}
