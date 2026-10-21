package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.CourtBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CourtBlockRepository extends JpaRepository<CourtBlock, Long> {

    @Query("SELECT cb FROM CourtBlock cb WHERE cb.court.id = :courtId " +
           "AND cb.startAt < :endAt AND cb.endAt > :startAt")
    List<CourtBlock> findConflictingBlocks(@Param("courtId") Long courtId,
                                           @Param("startAt") LocalDateTime startAt,
                                           @Param("endAt") LocalDateTime endAt);
}
