package com.example.Dat_san_cau_long.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_group_id")
    @JsonIgnore
    private CourtGroup courtGroup;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Transient
    public String getName() {
        return "Sân " + (courtNumber != null ? courtNumber : "");
    }

    @Transient
    public Long getBranchId() {
        return branch != null ? branch.getId() : null;
    }
}
