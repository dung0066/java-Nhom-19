package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "time_slots", uniqueConstraints = {
    @UniqueConstraint(name = "uk_time_slots_start", columnNames = {"start_time"}),
    @UniqueConstraint(name = "uk_time_slots_sort", columnNames = {"sort_order"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Transient
    public String getDisplayLabel() {
        if (startTime == null || endTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("H:mm");
        return startTime.format(formatter) + "-" + endTime.format(formatter);
    }
}
