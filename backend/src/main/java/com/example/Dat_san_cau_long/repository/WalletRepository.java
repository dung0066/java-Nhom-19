package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.userId = :userId")
    Optional<Wallet> findByUserIdForUpdate(@Param("userId") Long userId);

    @org.springframework.transaction.annotation.Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Wallet w SET w.balance = w.balance - :amount WHERE w.userId = :userId AND w.balance >= :amount")
    int deductBalanceAtomic(@Param("userId") Long userId, @Param("amount") BigDecimal amount);

    @org.springframework.transaction.annotation.Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Wallet w SET w.balance = w.balance + :amount WHERE w.userId = :userId")
    int addBalanceAtomic(@Param("userId") Long userId, @Param("amount") BigDecimal amount);
}
