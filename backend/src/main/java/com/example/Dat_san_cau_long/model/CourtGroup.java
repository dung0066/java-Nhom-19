package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "court_groups", uniqueConstraints = {
    @UniqueConstraint(name = "uk_court_groups_branch_name", columnNames = {"branch_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourtGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 50)
    private String name;
}
