package com.thuc_kien.freelance_marketplace.Entity;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "gigpackages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GigPackages {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id")
    private Gig gig;
    
    @Column 
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "delivery_days")
    private Integer deliveryDays;

    private Integer revisions; // Số lần chỉnh sửa

    @OneToMany(mappedBy = "gigPackage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default 
    private Set<PackageFeature> features = new HashSet<>();


    // Hàm Helper để dễ dàng thêm feature 2 chiều
    public void addFeature(PackageFeature feature) {
        features.add(feature);
        feature.setGigPackage(this);
    }

    public void removeFeature(PackageFeature feature) {
        features.remove(feature);
        feature.setGigPackage(null);
    }
    
    
}
