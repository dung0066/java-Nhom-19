package com.example.Dat_san_cau_long.validation;

import jakarta.validation.groups.Default;

/**
 * Nhóm validation chỉ áp dụng khi TẠO MỚI (POST): các trường bắt buộc phải có.
 * Nhóm này kế thừa Default nên cũng kiểm tra luôn các ràng buộc định dạng (độ dài, khoảng giá trị...).
 * Khi CẬP NHẬT (PUT) chỉ dùng nhóm Default: trường nào được gửi lên thì kiểm tra định dạng, trường null thì giữ nguyên.
 */
public interface OnCreate extends Default {
}
