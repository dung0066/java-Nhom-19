package com.example.Dat_san_cau_long.repository;

import com.example.Dat_san_cau_long.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    List<Review> findByUserId(Long userId);
}
