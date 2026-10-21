package com.example.Dat_san_cau_long.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffBranchId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "branch_id")
    private Long branchId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StaffBranchId that = (StaffBranchId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(branchId, that.branchId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, branchId);
    }
}
