package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "membership_packages")
public class MembershipPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code; // SILVER, GOLD, DIAMOND, STUDENT

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer durationDays; // 30, 90, 365 ngày

    @Column(nullable = false)
    private Double discountPercent = 0.0; // Ưu đãi từ 5% - 10% khi đặt sân

    @Column(columnDefinition = "TEXT")
    private String perks;

    @Column(length = 500)
    private String description;

    @Column(length = 30)
    private String badgeColor = "#0284c7";

    @Column(length = 50)
    private String icon = "fa-solid fa-crown";

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public MembershipPackage() {
    }

    public MembershipPackage(Long id, String code, String name, Double price, Integer durationDays, Double discountPercent, String perks, String description, String badgeColor, String icon, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.price = price;
        this.durationDays = durationDays;
        this.discountPercent = discountPercent != null ? discountPercent : 0.0;
        this.perks = perks;
        this.description = description;
        this.badgeColor = badgeColor != null ? badgeColor : "#0284c7";
        this.icon = icon != null ? icon : "fa-solid fa-crown";
        this.active = active != null ? active : true;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public static MembershipPackageBuilder builder() {
        return new MembershipPackageBuilder();
    }

    public static class MembershipPackageBuilder {
        private Long id;
        private String code;
        private String name;
        private Double price;
        private Integer durationDays;
        private Double discountPercent = 0.0;
        private String perks;
        private String description;
        private String badgeColor = "#0284c7";
        private String icon = "fa-solid fa-crown";
        private Boolean active = true;
        private LocalDateTime createdAt = LocalDateTime.now();

        public MembershipPackageBuilder id(Long id) { this.id = id; return this; }
        public MembershipPackageBuilder code(String code) { this.code = code; return this; }
        public MembershipPackageBuilder name(String name) { this.name = name; return this; }
        public MembershipPackageBuilder price(Double price) { this.price = price; return this; }
        public MembershipPackageBuilder durationDays(Integer durationDays) { this.durationDays = durationDays; return this; }
        public MembershipPackageBuilder discountPercent(Double discountPercent) { this.discountPercent = discountPercent; return this; }
        public MembershipPackageBuilder perks(String perks) { this.perks = perks; return this; }
        public MembershipPackageBuilder description(String description) { this.description = description; return this; }
        public MembershipPackageBuilder badgeColor(String badgeColor) { this.badgeColor = badgeColor; return this; }
        public MembershipPackageBuilder icon(String icon) { this.icon = icon; return this; }
        public MembershipPackageBuilder active(Boolean active) { this.active = active; return this; }
        public MembershipPackageBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public MembershipPackage build() {
            return new MembershipPackage(id, code, name, price, durationDays, discountPercent, perks, description, badgeColor, icon, active, createdAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }

    public Double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Double discountPercent) { this.discountPercent = discountPercent; }

    public String getPerks() { return perks; }
    public void setPerks(String perks) { this.perks = perks; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBadgeColor() { return badgeColor; }
    public void setBadgeColor(String badgeColor) { this.badgeColor = badgeColor; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
