package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "experiences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Experience {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String duration; // Ví dụ: "2022 - 2024"
    private String role;     // Ví dụ: "Backend Developer"
    private String company;  // Ví dụ: "ABC Corp"
    
    @Column(columnDefinition = "TEXT")
    private String description;

    // Liên kết với Seller
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;
}
