package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
public class GigDetailResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Boolean isFeatured;
    private LocalDateTime createdAt;

    private GigStatsDTO stats;
    private SellerSummaryDTO seller;
    private List<PackageDTO> packages; 

    private MediaDTO media;

    @Data
    @Builder
    public static class SellerSummaryDTO {
        private Long id;
        private String fullName;
        private String avatarUrl;
        private String role;
        private String location;
    }

    @Data
    @Builder
    public static class GigStatsDTO {
        private Double rating;
        private Integer reviewCount;
        private Long  salesCount;
    }

    @Data
    @Builder
    public static class PackageDTO {
        private Long id;
        private String type; 
        private BigDecimal price;
        private String shortDescription;
        private Integer deliveryDays;
        private Integer revisions;
        
        // Map để vẽ dấu tick xanh: { "Source File": true, "Commercial Use": false }
        private Map<String, Boolean> features; 
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaDTO {
        private String mainImage;
        private List<String> gallery;
    }
}