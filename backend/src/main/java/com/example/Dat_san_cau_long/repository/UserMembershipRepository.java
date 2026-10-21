package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.UserMembership;
import com.example.Dat_san_cau_long.model.enums.MembershipStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {

    List<UserMembership> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<UserMembership> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<UserMembership> findBySubscriptionCode(String subscriptionCode);

    List<UserMembership> findAllByOrderByCreatedAtDesc();

    Page<UserMembership> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT um FROM UserMembership um " +
           "WHERE um.user.id = :userId " +
           "AND um.status = :status " +
           "AND :now BETWEEN um.startDate AND um.endDate " +
           "ORDER BY um.endDate DESC")
    List<UserMembership> findValidMemberships(@Param("userId") Long userId,
                                             @Param("status") MembershipStatus status,
                                             @Param("now") LocalDateTime now);

    default Optional<UserMembership> findActiveMembershipForUser(Long userId, LocalDateTime now) {
        List<UserMembership> list = findValidMemberships(userId, MembershipStatus.ACTIVE, now);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT MAX(um.endDate) FROM UserMembership um WHERE um.user.id = :userId AND um.status = 'ACTIVE' AND um.endDate > :now")
    Optional<LocalDateTime> findLatestActiveEndDate(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
