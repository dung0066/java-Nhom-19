package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.MembershipUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipUsageRepository extends JpaRepository<MembershipUsage, Long> {
    List<MembershipUsage> findByUserMembershipId(Long userMembershipId);
}
