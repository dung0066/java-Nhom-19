package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "time_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String startTime; // VD: 05:00, 06:15

    @Column(nullable = false, length = 10)
    private String endTime; // VD: 06:00, 07:15

    @Column(nullable = false, length = 30)
    private String displayLabel; // VD: 5:00-6:00

    private Double standardPrice; // Giá thường: 70,000đ

    private Double peakPrice; // Giá giờ vàng (17h-22h): 120,000đ

    private Boolean isPeakHour; // true nếu giờ cao điểm

    private Integer sortOrder; // Thứ tự sắp xếp từ sáng đến tối
}
