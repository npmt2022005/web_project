package com.thuc_kien.freelance_marketplace.Entity;
import lombok.*;
import jakarta.persistence.*;

@Entity 
@Table(name = "package_features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ N-1: Nhiều Feature thuộc về 1 Package
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private GigPackages gigPackage;

    @Column(nullable = false)
    private String name; 

    @Column(name = "is_included", nullable = false)
    private Boolean isIncluded; 
}
