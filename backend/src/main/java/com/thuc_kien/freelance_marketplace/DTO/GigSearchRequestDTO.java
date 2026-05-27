package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;

@Data
public class GigSearchRequestDTO {
    private String keyword;
    private String category;
    private Double minPrice;
    private Double maxPrice;
    private String level;
    private String location;
    private String deliveryTime;
    private int page = 0;
    private int size = 100; 

}
