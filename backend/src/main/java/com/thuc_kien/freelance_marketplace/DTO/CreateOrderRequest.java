package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor  
@AllArgsConstructor
public class CreateOrderRequest {
    private Long gigId;
    private String packageType; 
    private Integer quantity;
}
