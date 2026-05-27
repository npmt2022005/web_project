package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import com.thuc_kien.freelance_marketplace.Entity.*;
import lombok.*;

@Entity
@Table(name = "gigs")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class Gig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnailUrl;
    private Double price;
    private Integer deliveryTime = 1; // Số ngày tối thiểu hoàn thành
    private Double ratingAvg ;
    private Integer totalReviews = 0;
    private Boolean isPaused = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
