package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor  
@AllArgsConstructor
public class GigCreateRequestDTO {
    private String title;
    private Long categoryId;
    private List<String> tags; 

    private String description;

    private String thumbnailUrl;
    private List<String> galleryUrls;

    private List<PackageRequestDTO> packages;
    private List<GigRequirementDTO> requirements;

    @Data
    public static class PackageRequestDTO {
        private String type; 
        private BigDecimal price;
        private String shortDescription;
        private Integer deliveryDays;
        private Integer revisions;
        
        private Map<String, Boolean> features; 
        
    }
    @Data
    public static class GigRequirementDTO {
        private String question;
        private String answerType; // VD: "TEXT" hoặc "ATTACHMENT"
        private Boolean isMandatory; // Bắt buộc hay không
    }
}
