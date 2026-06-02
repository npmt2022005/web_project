package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
class PackageDTO {
    private String type; 
    private BigDecimal price;
    private String shortDescription;
    private Integer deliveryDays;
    private Integer revisions;
    private Map<String, Boolean> features; 
}
