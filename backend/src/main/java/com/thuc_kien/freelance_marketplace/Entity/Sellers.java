package com.thuc_kien.freelance_marketplace.Entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "sellers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sellers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. user_id: Thiết lập mối quan hệ 1-1 với bảng User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 2. bio: Mô tả ngắn gọn về bản thân hoặc kỹ năng
    @Column(columnDefinition = "TEXT")
    private String bio;

    // 3. rating_avg: Điểm đánh giá trung bình
    @Column(name = "rating_avg")
    private Double ratingAvg = 0.0;

    // 4. total_reviews: Tổng số lượt đánh giá
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    // 5. response_time: Thời gian phản hồi trung bình (ví dụ: "1 hour")
    @Column(name = "response_time")
    private String responseTime;

    // 6. is_active: Trạng thái hoạt động của hồ sơ người bán
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Mối quan hệ bổ sung: Một Seller có nhiều Gigs (Services)
    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Gig> gigs;
}
