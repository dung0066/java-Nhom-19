package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "staff_branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffBranch {

    @EmbeddedId
    private StaffBranchId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("branchId")
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
