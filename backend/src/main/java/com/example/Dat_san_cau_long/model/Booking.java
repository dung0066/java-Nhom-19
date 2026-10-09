package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String bookingCode; // VD: WAY-20261004-9872

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, length = 20)
    private String customerPhone;

    @Column(length = 100)
    private String customerEmail;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    private Double totalPrice;

    private Double totalHours;

    @Column(length = 30)
    @Builder.Default
    private String status = "CONFIRMED"; // CONFIRMED, PENDING_PAYMENT, CANCELLED

    @Column(length = 50)
    @Builder.Default
    private String paymentMethod = "VIETQR"; // VIETQR, CASH, MOMO

    @Column(length = 500)
    private String notes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingDetail> details = new ArrayList<>();
}
