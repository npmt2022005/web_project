package com.thuc_kien.freelance_marketplace.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Orders;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {
        @Query("SELECT o FROM Orders o " +
                        "WHERE ((:role = 'BUYER' AND o.buyer.id = :userId) " +
                        "   OR (:role = 'SELLER' AND o.seller.user.id = :userId)) " +
                        "AND (:hasStatusFilter = false OR o.status IN :allowedStatuses) " +
                        "ORDER BY o.createdAt DESC")
        List<Orders> findOrdersOptimized(
                        @Param("userId") Long userId,
                        @Param("role") String role,
                        @Param("hasStatusFilter") boolean hasStatusFilter,
                        @Param("allowedStatuses") List<String> allowedStatuses);
        List<Orders> findByStatusAndDeliveryDateBefore(String status, LocalDateTime time);


        // Tìm các đơn thanh toán rồi nhưng quên nộp Requirement quá 7 ngày
        @Query("SELECT o FROM Orders o WHERE o.status = 'AWAITING_REQUIREMENTS' AND o.createdAt < :deadline")
        List<Orders> findAbandonedOrders(@Param("deadline") LocalDateTime deadline);
        // // Lấy điểm trung bình của 1 Gig
        // @Query("SELECT AVG(o.rating) FROM Orders o WHERE o.gig.id = :gigId AND o.status = 'COMPLETED' AND o.rating IS NOT NULL")
        // Double calculateAverageRating(@Param("gigId") Long gigId);

        // // Đếm tổng số lượt đánh giá
        // @Query("SELECT COUNT(o) FROM Orders o WHERE o.gig.id = :gigId AND o.status = 'COMPLETED' AND o.rating IS NOT NULL")
        // Integer countReviews(@Param("gigId") Long gigId);
        
}
