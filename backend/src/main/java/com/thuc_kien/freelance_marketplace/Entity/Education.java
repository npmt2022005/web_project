package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "educations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Education {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String duration; // Ví dụ: "2018 - 2022"
    private String degree;   // Ví dụ: "Bachelors in Computer Science"
    private String school;   // Ví dụ: "University of Technology"
    
    @Column(columnDefinition = "TEXT")
    private String description;

    // Quan hệ: Nhiều học vấn -> Một User
    // Liên kết với Seller
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;
}
