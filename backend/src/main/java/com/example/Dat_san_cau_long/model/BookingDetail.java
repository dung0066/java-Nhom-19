package com.example.Dat_san_cau_long.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "booking_details", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"court_id", "time_slot_id", "slot_date"})
})
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
    private String status = "BOOKED"; // BOOKED, PASS_WANTED, CANCELLED

    @Column(length = 100)
    private String passContact;

    public BookingDetail() {
    }

    public BookingDetail(Long id, Booking booking, Court court, TimeSlot timeSlot, LocalDate slotDate, Double price, String status, String passContact) {
        this.id = id;
        this.booking = booking;
        this.court = court;
        this.timeSlot = timeSlot;
        this.slotDate = slotDate;
        this.price = price;
        this.status = status != null ? status : "BOOKED";
        this.passContact = passContact;
    }

    public static BookingDetailBuilder builder() {
        return new BookingDetailBuilder();
    }

    public static class BookingDetailBuilder {
        private Long id;
        private Booking booking;
        private Court court;
        private TimeSlot timeSlot;
        private LocalDate slotDate;
        private Double price;
        private String status = "BOOKED";
        private String passContact;

        public BookingDetailBuilder id(Long id) { this.id = id; return this; }
        public BookingDetailBuilder booking(Booking booking) { this.booking = booking; return this; }
        public BookingDetailBuilder court(Court court) { this.court = court; return this; }
        public BookingDetailBuilder timeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; return this; }
        public BookingDetailBuilder slotDate(LocalDate slotDate) { this.slotDate = slotDate; return this; }
        public BookingDetailBuilder price(Double price) { this.price = price; return this; }
        public BookingDetailBuilder status(String status) { this.status = status; return this; }
        public BookingDetailBuilder passContact(String passContact) { this.passContact = passContact; return this; }

        public BookingDetail build() {
            return new BookingDetail(id, booking, court, timeSlot, slotDate, price, status, passContact);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public Court getCourt() { return court; }
    public void setCourt(Court court) { this.court = court; }

    public TimeSlot getTimeSlot() { return timeSlot; }
    public void setTimeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; }

    public LocalDate getSlotDate() { return slotDate; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPassContact() { return passContact; }
    public void setPassContact(String passContact) { this.passContact = passContact; }
}
