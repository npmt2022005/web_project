package com.thuc_kien.freelance_marketplace.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteOrderRequest {
    @NotNull(message = "Vui lòng chọn số sao đánh giá.")
    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao.")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao.")

    private Integer rating;

    private String reviewComment; 
    
}
