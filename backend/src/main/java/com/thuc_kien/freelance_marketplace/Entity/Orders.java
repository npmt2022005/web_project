package com.thuc_kien.freelance_marketplace.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "package_id", nullable = false)
    private Long packageId;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // Ví dụ: PENDING, PAID, CANCELED, COMPLETED

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer; // Giả sử bảng User chứa thông tin người mua

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gig_id", nullable = false)
    private Gig gig;

    @Column(name = "gigPrice")
    private BigDecimal gigPrice;

    @Column(name="serviceFee")
    private BigDecimal serviceFee;

    // Tự động lấy giờ hệ thống lúc đơn hàng được tạo (Insert)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "requirement_text", columnDefinition = "TEXT")
    private String requirementText;

    @ElementCollection
    @CollectionTable(
        name = "order_attachments", // Tên bảng phụ tự động sinh ra để lưu link
        joinColumns = @JoinColumn(name = "order_id") // Khóa ngoại nối với bảng orders
    )
    @Column(name = "file_url", columnDefinition = "TEXT")
    private List<String> attachedFiles = new java.util.ArrayList<>();
}
