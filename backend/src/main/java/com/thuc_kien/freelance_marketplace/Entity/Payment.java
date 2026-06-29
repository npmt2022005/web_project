package com.thuc_kien.freelance_marketplace.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Mối quan hệ với Đơn hàng (Một đơn hàng có thể có nhiều giao dịch: Charge, Refund...)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true)
    private Orders order;

    // Người thực hiện hoặc người nhận dòng tiền này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // Khóa ngoại trỏ sang bảng ví nội bộ (Cho phép NULL nếu thanh toán thẳng qua Stripe)
    @Column(name = "wallet_id", nullable = true)
    private Integer walletId;

    // Loại giao dịch: CHARGE (Thu tiền), REFUND (Hoàn tiền), PAYOUT (Rút tiền/Trả lương)
    @Column(name = "payment_type", length = 50, nullable = false)
    private String paymentType;

    // Số tiền giao dịch - Sử dụng BigDecimal để đảm bảo chính xác tuyệt đối
    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    // Đơn vị tiền tệ: USD, VND, EUR... (Stripe bắt buộc cần thông tin này)
    @Column(name = "currency", length = 10, nullable = false)
    private String currency;

    // Phương thức thanh toán: STRIPE, INTERNAL_WALLET, VNPAY...
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // Trạng thái: PENDING, SUCCESS, FAILED
    @Column(name = "status", length = 50)
    private String status;

    // Lưu mã giao dịch của bên thứ 3 (Ví dụ: PaymentIntent ID "pi_..." hoặc Refund ID "re_..." từ Stripe)
    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    // Nội dung hiển thị lịch sử (Ví dụ: "Thanh toán đơn hàng ORD-102", "Hoàn tiền trễ hạn")
    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Tự động gán thời gian khi tạo mới bản ghi
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Tự động cập nhật thời gian khi update trạng thái (Ví dụ từ PENDING sang SUCCESS)
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}