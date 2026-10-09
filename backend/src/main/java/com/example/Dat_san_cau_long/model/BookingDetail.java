package com.example.Dat_san_cau_long.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "booking_details", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"court_id", "time_slot_id", "slot_date"})
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    private Double price;

    @Column(length = 30)
    @Builder.Default
    private String status = "BOOKED"; // BOOKED, PASS_WANTED, CANCELLED

    @Column(length = 100)
    private String passContact; // Số điện thoại người muốn pass sân nếu status là PASS_WANTED
}
