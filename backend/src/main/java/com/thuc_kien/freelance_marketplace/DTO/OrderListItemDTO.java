package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderListItemDTO {
    private String orderId;
    private String gigTitle;
    private String gigThumbnail;
    private String partnerName;
    private String buyerName;
    private String packageSelected;
    private BigDecimal totalAmount;
    private String status;
}
