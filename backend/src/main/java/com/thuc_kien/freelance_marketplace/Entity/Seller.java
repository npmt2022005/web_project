package com.thuc_kien.freelance_marketplace.Entity;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "sellers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "rating_avg")
    private Double ratingAvg = 0.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "level")
    private String level = "New Seller"; 

    @Column(name = "language")
    private String language;

    @Column(name = "response_time")
    private String responseTime;

    
    @Column(name = "is_active")
    private Boolean isActive = true;

    
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Gig> gigs;

}
    