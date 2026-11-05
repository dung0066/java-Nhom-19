package com.example.Dat_san_cau_long.dto;

import com.example.Dat_san_cau_long.validation.OnCreate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Dữ liệu admin gửi lên khi tạo hoặc sửa tài khoản. Khi sửa, trường nào null thì giữ nguyên. */
@Getter
@Setter
public class AdminUserRequest {

    @NotBlank(groups = OnCreate.class, message = "Tên đăng nhập không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9_.]{4,50}$", message = "Tên đăng nhập gồm chữ, số, dấu chấm, gạch dưới (4-50 ký tự)")
    private String username;

    @NotBlank(groups = OnCreate.class, message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    private String password;

    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    private String email;

    @NotBlank(groups = OnCreate.class, message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "Số điện thoại không hợp lệ (VD: 0909123456)")
    private String phone;

    private String role;
}
