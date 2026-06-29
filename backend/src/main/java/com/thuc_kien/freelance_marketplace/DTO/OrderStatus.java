package com.thuc_kien.freelance_marketplace.DTO;

public enum OrderStatus {
    AWAITING_REQUIREMENT,       // Đơn hàng đã được thanh toán, chờ Buyer nộp requirement
    PENDING,    // Buyer đã nộp requirement, chờ Seller xử lý
    IN_PROGRESS, // 
    ACCEPTED,   // Seller đã đồng ý làm
    REJECTED,   // Seller từ chối làm
    DELIVERED,  // Seller đã nộp sản phẩm
    COMPLETED,  // Buyer đã nghiệm thu, kết thúc luồng
    REFUNDED,   // Đã hoàn tiền do Buyer không nộp requirement kịp hạn
    LATE,
    VERY_LATE,
    CANCELED
}
