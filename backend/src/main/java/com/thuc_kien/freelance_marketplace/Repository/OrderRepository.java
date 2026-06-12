package com.thuc_kien.freelance_marketplace.Repository;

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
            @Param("allowedStatuses") List<String> allowedStatuses
    );

}
