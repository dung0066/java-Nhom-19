package com.example.Dat_san_cau_long.security;

import org.springframework.security.access.AccessDeniedException;

/** Kiểm tra quyền sở hữu dữ liệu: người dùng chỉ được thao tác trên dữ liệu của chính mình, nhân viên và admin thì được xem tất cả. */
public final class AccessChecks {

    private AccessChecks() {
    }

    public static boolean isStaffOrAdmin(CustomUserDetails principal) {
        return principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));
    }

    /** Cho qua nếu là chính chủ hoặc nhân viên/admin, ngược lại báo 403. */
    public static void requireSelfOrStaff(CustomUserDetails principal, Long ownerId) {
        if (principal == null) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này!");
        }
        boolean isOwner = ownerId != null && ownerId.equals(principal.getId());
        if (!isOwner && !isStaffOrAdmin(principal)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập dữ liệu của người khác!");
        }
    }
}
