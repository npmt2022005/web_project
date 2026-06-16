package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;
import java.util.List;
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
    private String requirementText; // Nội dung yêu cầu từ Buyer
    private List<String> attachedFiles; // Danh sách URL file đính kèm từ Buyer
    private Integer revisionCount; // Số lần đã yêu cầu sửa đổi
}
