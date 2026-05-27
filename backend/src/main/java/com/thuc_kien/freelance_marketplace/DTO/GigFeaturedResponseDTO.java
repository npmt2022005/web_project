package com.thuc_kien.freelance_marketplace.DTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GigFeaturedResponseDTO {
    
    private Long id;
    
    private String title;          
    
    private String thumbnailUrl;   
    
    private Double price;          
    
    private Double rating;        
    
    private Integer reviews;       
    
    private String seller;     
    
    private Integer deliveryTime; 

    private String country;
    
    private String level;
}