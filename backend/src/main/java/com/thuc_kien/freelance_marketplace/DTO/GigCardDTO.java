package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;

import com.thuc_kien.freelance_marketplace.DTO.GigDetailResponseDTO.GigStatsDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigDetailResponseDTO.SellerSummaryDTO;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class GigCardDTO {
    private Long id;
    private String thumbnailUrl;
    private Boolean isFeatured;
    private String title;
    
    private GigStatsDTO stats; // Tái sử dụng class GigStatsDTO bạn đã có
    private BigDecimal startingPrice; // Tính bằng giá rẻ nhất trong 3 packages
    private String deliveryTimeStr; 
    
    private SellerSummaryDTO seller; // Tái sử dụng SellerSummaryDTO
    private Boolean isFavorite;
}
