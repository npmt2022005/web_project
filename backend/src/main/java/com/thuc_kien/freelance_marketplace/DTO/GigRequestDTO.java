package com.thuc_kien.freelance_marketplace.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GigRequestDTO {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    
    @NotBlank(message = "Mô tả không được để trống")
    private String description;
    
    @Min(value = 5, message = "Giá tối thiểu là $5")
    private Double basePrice;
    
    @NotNull(message = "Vui lòng chọn danh mục")
    private Long categoryId;
    
    private String thumbnailUrl;
}
