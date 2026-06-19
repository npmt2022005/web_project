package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

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

    private Set<PackageRequestDTO> packages;
    private Set<GigRequirementDTO> requirements;

    @Data
    public static class PackageRequestDTO {
        private Long id; // Bổ sung ID để định danh khi cập nhật
        private String type; 
        private BigDecimal price;
        private String shortDescription;
        private Integer deliveryDays;
        private Integer revisions;
        
        private java.util.Map<String, Boolean> features; 
        
    }
    @Data
    public static class GigRequirementDTO {
        private Long id; 
        private String question;
        private String answerType; 
        private Boolean isMandatory; 
    }
}
