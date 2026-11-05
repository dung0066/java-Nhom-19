package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "membership_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(groups = OnCreate.class, message = "Mã gói không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9_-]{2,30}$", message = "Mã gói chỉ gồm chữ, số, gạch (2-30 ký tự)")
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @NotBlank(groups = OnCreate.class, message = "Tên gói không được để trống")
    @Size(max = 100, message = "Tên gói tối đa 100 ký tự")
    @Column(nullable = false, length = 100)
    private String name;

    @NotNull(groups = OnCreate.class, message = "Giá gói không được để trống")
    @DecimalMin(value = "0", message = "Giá gói không được âm")
    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal price;

    @NotNull(groups = OnCreate.class, message = "Thời hạn gói không được để trống")
    @Min(value = 1, message = "Thời hạn gói tối thiểu 1 ngày")
    @Max(value = 3650, message = "Thời hạn gói tối đa 3650 ngày")
    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @DecimalMin(value = "0", message = "Phần trăm giảm giá không được âm")
    @DecimalMax(value = "100", message = "Phần trăm giảm giá tối đa 100%")
    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "discount_from_time")
    private LocalTime discountFromTime;

    @Column(name = "discount_to_time")
    private LocalTime discountToTime;

    @Column(name = "student_only", nullable = false)
    @Builder.Default
    private Boolean studentOnly = false;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    @Column(length = 500)
    private String description;

    @Column(name = "badge_color", nullable = false, length = 30)
    @Builder.Default
    private String badgeColor = "#0284c7";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String icon = "fa-solid fa-crown";

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "membershipPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PackageBenefit> benefits = new ArrayList<>();
}
