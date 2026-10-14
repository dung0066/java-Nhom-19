package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;

@Entity
@Table(name = "time_slots")
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

    public TimeSlot() {
    }

    public TimeSlot(Long id, String startTime, String endTime, String displayLabel, Double standardPrice, Double peakPrice, Boolean isPeakHour, Integer sortOrder) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.displayLabel = displayLabel;
        this.standardPrice = standardPrice;
        this.peakPrice = peakPrice;
        this.isPeakHour = isPeakHour;
        this.sortOrder = sortOrder;
    }

    public static TimeSlotBuilder builder() {
        return new TimeSlotBuilder();
    }

    public static class TimeSlotBuilder {
        private Long id;
        private String startTime;
        private String endTime;
        private String displayLabel;
        private Double standardPrice;
        private Double peakPrice;
        private Boolean isPeakHour;
        private Integer sortOrder;

        public TimeSlotBuilder id(Long id) { this.id = id; return this; }
        public TimeSlotBuilder startTime(String startTime) { this.startTime = startTime; return this; }
        public TimeSlotBuilder endTime(String endTime) { this.endTime = endTime; return this; }
        public TimeSlotBuilder displayLabel(String displayLabel) { this.displayLabel = displayLabel; return this; }
        public TimeSlotBuilder standardPrice(Double standardPrice) { this.standardPrice = standardPrice; return this; }
        public TimeSlotBuilder peakPrice(Double peakPrice) { this.peakPrice = peakPrice; return this; }
        public TimeSlotBuilder isPeakHour(Boolean isPeakHour) { this.isPeakHour = isPeakHour; return this; }
        public TimeSlotBuilder sortOrder(Integer sortOrder) { this.sortOrder = sortOrder; return this; }

        public TimeSlot build() {
            return new TimeSlot(id, startTime, endTime, displayLabel, standardPrice, peakPrice, isPeakHour, sortOrder);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getDisplayLabel() { return displayLabel; }
    public void setDisplayLabel(String displayLabel) { this.displayLabel = displayLabel; }

    public Double getStandardPrice() { return standardPrice; }
    public void setStandardPrice(Double standardPrice) { this.standardPrice = standardPrice; }

    public Double getPeakPrice() { return peakPrice; }
    public void setPeakPrice(Double peakPrice) { this.peakPrice = peakPrice; }

    public Boolean getIsPeakHour() { return isPeakHour; }
    public void setIsPeakHour(Boolean isPeakHour) { this.isPeakHour = isPeakHour; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
