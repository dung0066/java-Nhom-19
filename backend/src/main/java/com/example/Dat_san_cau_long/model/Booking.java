package com.example.Dat_san_cau_long.model;

import com.example.Dat_san_cau_long.model.enums.BookingDetailStatus;
import com.example.Dat_san_cau_long.model.enums.BookingItemStatus;
import com.example.Dat_san_cau_long.model.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "bookings", uniqueConstraints = {
    @UniqueConstraint(name = "uk_bookings_id_branch", columnNames = {"id", "branch_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 30)
    private String bookingCode;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "wallet"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "courts", "manager"})
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applied_membership_id")
    private UserMembership appliedMembership;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "hold_expires_at")
    private LocalDateTime holdExpiresAt;

    @Column(length = 500)
    private String notes;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", length = 255)
    private String cancelReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingDetail> details = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingItem> items = new ArrayList<>();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "booking", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @Transient
    public LocalDate getBookingDate() {
        if (details == null || details.isEmpty()) return null;
        return details.stream()
                .filter(d -> d.getStatus() != BookingDetailStatus.CANCELLED)
                .map(BookingDetail::getSlotDate)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElse(null);
    }

    @Transient
    public Integer getTotalHours() {
        if (details == null || details.isEmpty()) return 0;
        return (int) details.stream()
                .filter(d -> d.getStatus() != BookingDetailStatus.CANCELLED)
                .count();
    }

    @Transient
    public BigDecimal getOriginalPrice() {
        BigDecimal courtAmount = BigDecimal.ZERO;
        if (details != null) {
            courtAmount = details.stream()
                    .filter(d -> d.getStatus() != BookingDetailStatus.CANCELLED && d.getPrice() != null)
                    .map(BookingDetail::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        BigDecimal itemAmount = BigDecimal.ZERO;
        if (items != null) {
            itemAmount = items.stream()
                    .filter(i -> i.getStatus() != BookingItemStatus.CANCELLED && i.getUnitPrice() != null)
                    .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return courtAmount.add(itemAmount);
    }

    @Transient
    public BigDecimal getTotalPrice() {
        BigDecimal orig = getOriginalPrice();
        BigDecimal disc = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        BigDecimal total = orig.subtract(disc);
        return total.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : total;
    }

    @Transient
    public BigDecimal getPaidAmount() {
        if (payments == null || payments.isEmpty()) return BigDecimal.ZERO;
        return payments.stream()
                .filter(p -> p.getStatus() == com.example.Dat_san_cau_long.model.enums.PaymentStatus.PAID)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transient
    public BigDecimal getRemainingAmount() {
        BigDecimal total = getTotalPrice();
        BigDecimal paid = getPaidAmount();
        BigDecimal remaining = total.subtract(paid);
        return remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining;
    }

    @Transient
    public boolean isDeposit() {
        if (notes != null && (notes.contains("Đặt cọc 50%") || notes.contains("[COC_50%]"))) {
            return true;
        }
        BigDecimal total = getTotalPrice();
        BigDecimal paid = getPaidAmount();
        return paid.compareTo(BigDecimal.ZERO) > 0 && paid.compareTo(total) < 0;
    }
}
