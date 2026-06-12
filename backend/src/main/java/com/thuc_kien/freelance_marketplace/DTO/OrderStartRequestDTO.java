package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;
import java.util.List;

@Data
public class OrderStartRequestDTO {
    private String requirementText;
    private List<String> attachedFiles; 
}
