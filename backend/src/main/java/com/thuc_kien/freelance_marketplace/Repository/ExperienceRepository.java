package com.thuc_kien.freelance_marketplace.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thuc_kien.freelance_marketplace.Entity.Experience;



public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findBySellerId(Long sellerId);
}
