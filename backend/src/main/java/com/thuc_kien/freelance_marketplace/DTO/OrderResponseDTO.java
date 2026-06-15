package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponseDTO {
    private String orderId;
    private String gigTitle;
    private String gigThumbnail;
    private String partnerName; // Sẽ linh hoạt đổi thành tên người mua hoặc người bán
    private String packageSelected;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private String gigDescription;
    private LocalDateTime createdAt;
    private LocalDateTime deliveryDeadline;
    private String partnerAvatar;
    private LocalDateTime inspectionDeadline;
}
