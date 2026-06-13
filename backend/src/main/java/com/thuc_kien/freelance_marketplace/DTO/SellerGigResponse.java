package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SellerGigResponse {
    private Long id;
    private String gigCode;
    private String thumbnailUrl;
    private String title;
    private String categoryName;
    private BigDecimal startingPrice; 
    private Integer deliveryDays; 
}
