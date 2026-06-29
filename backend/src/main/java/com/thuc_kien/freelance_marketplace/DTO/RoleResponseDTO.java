package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RoleResponseDTO {
    private String role;
    private Long sellerId;
    
    public RoleResponseDTO(String role, Long sellerId) {
        this.role = role;
        this.sellerId = sellerId;
    }
}
