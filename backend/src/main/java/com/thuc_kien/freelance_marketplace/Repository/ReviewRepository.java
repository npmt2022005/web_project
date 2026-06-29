package com.thuc_kien.freelance_marketplace.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thuc_kien.freelance_marketplace.Entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // Tính điểm trung bình của một Seller
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.seller.id = :sellerId AND r.rating IS NOT NULL")
    Double calculateAverageRatingBySeller(@Param("sellerId") Long sellerId);

    // Đếm tổng số lượt đánh giá của Seller đó
    @Query("SELECT COUNT(r) FROM Review r WHERE r.seller.id = :sellerId AND r.rating IS NOT NULL")
    Integer countReviewsBySeller(@Param("sellerId") Long sellerId);

    // Tính điểm trung bình của một Dịch vụ (Gig) cụ thể thông qua Order
    @Query("SELECT AVG(r.rating) FROM Review r JOIN r.order o WHERE o.gig.id = :gigId AND r.rating IS NOT NULL")
    Double calculateAverageRatingByGig(@Param("gigId") Long gigId);

    // Đếm tổng số lượt đánh giá của Dịch vụ (Gig) đó
    @Query("SELECT COUNT(r) FROM Review r JOIN r.order o WHERE o.gig.id = :gigId AND r.rating IS NOT NULL")
    Integer countReviewsByGig(@Param("gigId") Long gigId);

    @Query("SELECT r FROM Review r where r.seller.id= :sellerId")
    List<Review> findReviewsBySellerId(@Param("sellerId") Long sellerId);
}
