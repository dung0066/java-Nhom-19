package com.example.Dat_san_cau_long.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet implements Persistable<Long> {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(nullable = false, precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Transient
    @Builder.Default
    private boolean isNewEntity = true;

    @Override
    public Long getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNewEntity;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNewEntity = false;
    }
}
