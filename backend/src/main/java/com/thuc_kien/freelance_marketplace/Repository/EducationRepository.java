package com.thuc_kien.freelance_marketplace.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thuc_kien.freelance_marketplace.Entity.Education;

public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findBySellerId(Long sellerId);
}
