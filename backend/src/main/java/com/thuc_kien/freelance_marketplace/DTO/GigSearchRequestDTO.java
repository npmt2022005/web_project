package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;
import java.util.*;
@Data
public class GigSearchRequestDTO {
    private String keyword;
    private String category;
    private Double minPrice;
    private Double maxPrice;
    private String level;
    private String location;
    private String deliveryTime;
    private List<String> languages;
    private String sortBy; // Nhận giá trị: "Recommended", "BestSeller", "NewArrivals"
    private int page = 0;
    private int size = 100; 

}
    