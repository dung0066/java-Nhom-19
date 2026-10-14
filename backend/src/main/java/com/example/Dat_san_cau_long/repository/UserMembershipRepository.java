package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {

    List<UserMembership> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserMembership> findBySubscriptionCode(String subscriptionCode);

    List<UserMembership> findAllByOrderByCreatedAtDesc();
}
