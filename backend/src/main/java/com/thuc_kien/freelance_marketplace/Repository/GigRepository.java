package com.thuc_kien.freelance_marketplace.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Gig;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface GigRepository extends JpaRepository<Gig, Long> {
        @Query("SELECT g FROM Gig g " +
                        "JOIN FETCH g.seller s " +
                        "JOIN FETCH s.user u " +
                        "ORDER BY g.ratingAvg DESC, g.totalReviews  DESC")
        List<Gig> findTopFeaturedGigs(Pageable pageable);

        @Query("SELECT DISTINCT g FROM Gig g " +
                        "JOIN FETCH g.seller s " +
                        "JOIN FETCH s.user u " +
                        "JOIN FETCH g.category c")
        List<Gig> findAll();

        @Query("SELECT MAX(g.price) FROM Gig g")
        Double findMaximumPrice();

        @Query("SELECT c.name, c.slug as categorySlug FROM Gig g " +
                        "JOIN g.category c " +
                        "GROUP BY c.name, c.slug " +
                        "ORDER BY COUNT(g.id) DESC")
        List<Object[]> findPopularCategoryNames(Pageable pageable);

        @Query("SELECT DISTINCT g FROM Gig g " +
                        "LEFT JOIN FETCH g.seller " +
                        "LEFT JOIN FETCH g.packages p " + // Kéo mảng packages lên và đặt tên là 'p'
                        "LEFT JOIN FETCH p.features " + // Từ 'p', kéo tiếp mảng features lên
                        "WHERE g.id = :gigId")
        Optional<Gig> findGigById(@Param("gigId") Long gigId);

}
