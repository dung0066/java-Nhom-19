package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findAllByOrderBySortOrderAsc();
}
