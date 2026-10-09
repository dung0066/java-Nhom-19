package com.example.Dat_san_cau_long.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Court {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 50)
    private String name; // Sân 1, Sân 2, ...

    private Integer courtNumber; // 1, 2, 3...

    @Column(length = 50)
    private String courtGroup; // Sân 1+2, Sân 3+4, Sân 5+6, Sân 7

    @Builder.Default
    private Boolean active = true;
}
