package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(groups = OnCreate.class, message = "Mã chi nhánh không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9_]{2,20}$", message = "Mã chi nhánh chỉ gồm chữ, số, gạch dưới (2-20 ký tự)")
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @NotBlank(groups = OnCreate.class, message = "Tên chi nhánh không được để trống")
    @Size(max = 100, message = "Tên chi nhánh tối đa 100 ký tự")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(groups = OnCreate.class, message = "Địa chỉ không được để trống")
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    @Column(nullable = false, length = 255)
    private String address;

    @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "Số điện thoại không hợp lệ (VD: 0909123456)")
    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Có giá trị nghĩa là chi nhánh đang nằm trong thùng rác (xóa tạm), khôi phục được. */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
