package com.thuc_kien.freelance_marketplace.Entity;

import java.util.List;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    // Mối quan hệ Self-Reference: Một danh mục có thể có một danh mục cha
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    // Một danh mục có thể có nhiều danh mục con
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Category> children;

    // Mối quan hệ với bảng Gigs (nếu cần thiết)
    // Một Category có thể chứa nhiều Gigs
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Gig> gigs;
}
