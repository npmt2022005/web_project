package com.thuc_kien.freelance_marketplace.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Cấu trúc danh mục theo dạng cây (Cha - Con) hiển thị trên thanh điều hướng")
public class CategoryResponseDTO {

    @Schema(description = "ID của danh mục", example = "1")
    private Long id;

    @Schema(description = "Tên hiển thị của danh mục", example = "Programming & Tech")
    private String name;

    @Schema(description = "Đường dẫn thân thiện của danh mục", example = "programming-tech")
    private String slug;

    @Schema(description = "Đường dẫn hình ảnh danh mục ", example = "đường link")
    private String imgUrl;

    @Schema(description = "Danh sách các danh mục con trực thuộc")
    private List<CategoryResponseDTO> subCategories;

}