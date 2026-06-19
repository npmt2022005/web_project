package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    @OneToMany(mappedBy = "gig", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GigPackages> packages = new HashSet<>();
    
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
    @ElementCollection
    @CollectionTable(name = "gig_gallery", joinColumns = @JoinColumn(name = "gig_id"))
    @Column(name = "image_url")
    private List<String> galleryUrls;
    
    private BigDecimal price;
    private Integer deliveryTime = 1; // Số ngày tối thiểu hoàn thành
    private Double ratingAvg ;
    private Integer totalReviews = 0;
    private Boolean isPaused = false;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name="saleCount")
    private Long salesCount = 0L; 
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "gig", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GigRequirement> requirements = new java.util.HashSet<>();
    
    public void addPackage(GigPackages gigPackage) {
        packages.add(gigPackage);
        gigPackage.setGig(this); // Gắn ngược ID của Gig hiện tại vào Package
    }

    public void removePackage(GigPackages gigPackage) {
        packages.remove(gigPackage);
        gigPackage.setGig(null);
    }

}
