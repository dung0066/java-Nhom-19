package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    private Double originalPrice = 0.0;

    private Double discountAmount = 0.0;

    private Double totalPrice;

    private Double totalHours;

    @Column(length = 30)
    private String status = "CONFIRMED"; // CONFIRMED, PENDING_PAYMENT, CANCELLED

    @Column(length = 50)
    private String paymentMethod = "VIETQR"; // VIETQR, CASH, MOMO

    @Column(length = 500)
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingDetail> details = new ArrayList<>();

    public Booking() {
    }

    public Booking(Long id, String bookingCode, String customerName, String customerPhone, String customerEmail, LocalDate bookingDate, Branch branch, User user, Double originalPrice, Double discountAmount, Double totalPrice, Double totalHours, String status, String paymentMethod, String notes, LocalDateTime createdAt, List<BookingDetail> details) {
        this.id = id;
        this.bookingCode = bookingCode;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.bookingDate = bookingDate;
        this.branch = branch;
        this.user = user;
        this.originalPrice = originalPrice != null ? originalPrice : 0.0;
        this.discountAmount = discountAmount != null ? discountAmount : 0.0;
        this.totalPrice = totalPrice;
        this.totalHours = totalHours;
        this.status = status != null ? status : "CONFIRMED";
        this.paymentMethod = paymentMethod != null ? paymentMethod : "VIETQR";
        this.notes = notes;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.details = details != null ? details : new ArrayList<>();
    }

    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private Long id;
        private String bookingCode;
        private String customerName;
        private String customerPhone;
        private String customerEmail;
        private LocalDate bookingDate;
        private Branch branch;
        private User user;
        private Double originalPrice = 0.0;
        private Double discountAmount = 0.0;
        private Double totalPrice;
        private Double totalHours;
        private String status = "CONFIRMED";
        private String paymentMethod = "VIETQR";
        private String notes;
        private LocalDateTime createdAt = LocalDateTime.now();
        private List<BookingDetail> details = new ArrayList<>();

        public BookingBuilder id(Long id) { this.id = id; return this; }
        public BookingBuilder bookingCode(String bookingCode) { this.bookingCode = bookingCode; return this; }
        public BookingBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public BookingBuilder customerPhone(String customerPhone) { this.customerPhone = customerPhone; return this; }
        public BookingBuilder customerEmail(String customerEmail) { this.customerEmail = customerEmail; return this; }
        public BookingBuilder bookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; return this; }
        public BookingBuilder branch(Branch branch) { this.branch = branch; return this; }
        public BookingBuilder user(User user) { this.user = user; return this; }
        public BookingBuilder originalPrice(Double originalPrice) { this.originalPrice = originalPrice; return this; }
        public BookingBuilder discountAmount(Double discountAmount) { this.discountAmount = discountAmount; return this; }
        public BookingBuilder totalPrice(Double totalPrice) { this.totalPrice = totalPrice; return this; }
        public BookingBuilder totalHours(Double totalHours) { this.totalHours = totalHours; return this; }
        public BookingBuilder status(String status) { this.status = status; return this; }
        public BookingBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public BookingBuilder notes(String notes) { this.notes = notes; return this; }
        public BookingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BookingBuilder details(List<BookingDetail> details) { this.details = details; return this; }

        public Booking build() {
            return new Booking(id, bookingCode, customerName, customerPhone, customerEmail, bookingDate, branch, user, originalPrice, discountAmount, totalPrice, totalHours, status, paymentMethod, notes, createdAt, details);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public Double getTotalHours() { return totalHours; }
    public void setTotalHours(Double totalHours) { this.totalHours = totalHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<BookingDetail> getDetails() { return details; }
    public void setDetails(List<BookingDetail> details) { this.details = details; }
}
