package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nhiều giao dịch thuộc về một ví
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(name = "order_id")
    private Long orderId;

    // Số tiền biến động (Ví dụ: +90.00 hoặc -50.00)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Loại giao dịch: EARNING (Kiếm tiền), WITHDRAW (Rút tiền), DEPOSIT (Nạp tiền), REFUND (Hoàn tiền)
    @Column(nullable = false, length = 20)
    private String type;

    // Mô tả chi tiết giao dịch để hiển thị lên màn hình giao diện
    @Column(length = 255)
    private String description;

    // Tự động lưu thời gian tạo giao dịch
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}