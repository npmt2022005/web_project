package com.thuc_kien.freelance_marketplace.Repository;

import com.thuc_kien.freelance_marketplace.Entity.PackageFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PackageFeatureRepository extends JpaRepository<PackageFeature, Long> {
    @Query("SELECT DISTINCT f.name FROM PackageFeature f " +
            "JOIN f.gigPackage pkg " +
            "JOIN pkg.gig g " +
            "WHERE g.category.id = :categoryId")
    List<String> findDistinctFeatureNamesByCategoryId(@Param("categoryId") Long categoryId);
}