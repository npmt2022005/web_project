package com.thuc_kien.freelance_marketplace.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    // 1. Tìm tất cả giao dịch liên quan đến một Đơn hàng (Xem đơn này đã Charge bao nhiêu, Refund bao nhiêu)
    List<Payment> findByOrderId(Long orderId);

    // 2. Lấy lịch sử giao dịch của một User (Dùng để hiển thị danh sách biến động số dư/lịch sử ví trên UI)
    List<Payment> findByUserId(Long userId);

    // 3. Tìm giao dịch theo mã của bên thứ 3 (Rất quan trọng khi làm việc với Stripe Webhook để tránh trùng lặp)
    Optional<Payment> findByTransactionId(String transactionId);
    
}
