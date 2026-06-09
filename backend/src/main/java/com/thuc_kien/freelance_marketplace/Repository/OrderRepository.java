package com.thuc_kien.freelance_marketplace.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Orders;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {
    
    
}
