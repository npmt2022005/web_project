package com.thuc_kien.freelance_marketplace.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.CategoryResponseDTO;
import com.thuc_kien.freelance_marketplace.Service.CategoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category Management", description = "API lấy danh mục hiển thị đa cấp cho Menu")
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "Lấy cấu trúc cây danh mục", 
            description = "Trả về toàn bộ danh mục lớn công khai, bên trong mỗi danh mục lớn tự ôm danh sách danh mục con.")
    @GetMapping
    public ResponseEntity<APIResponse<List<CategoryResponseDTO>>> getCategoryTree() {
        List<CategoryResponseDTO> tree = categoryService.getCategoryTree();

        APIResponse<List<CategoryResponseDTO>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Lấy cấu trúc cây danh mục thành công");
        response.setData(tree);

        return ResponseEntity.ok(response);
    }
}
