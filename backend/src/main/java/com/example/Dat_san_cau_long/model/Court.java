package com.example.Dat_san_cau_long.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "courts", uniqueConstraints = {
    @UniqueConstraint(name = "uk_courts_branch_number", columnNames = {"branch_id", "court_number"}),
    @UniqueConstraint(name = "uk_courts_id_branch", columnNames = {"id", "branch_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnore
    private Branch branch;

    @Column(name = "court_number", nullable = false)
    private Integer courtNumber;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /** Có giá trị nghĩa là sân đang nằm trong thùng rác (xóa tạm), khôi phục được. */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Transient
    public String getName() {
        return "Sân " + (courtNumber != null ? courtNumber : "");
    }

    @Transient
    public Long getBranchId() {
        return branch != null ? branch.getId() : null;
    }
}
