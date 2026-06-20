package com.thuc_kien.freelance_marketplace.Controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.CategoryDTO;
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
    @GetMapping("/all")
    public ResponseEntity<APIResponse<List<CategoryDTO>>> getAll() {
        List<CategoryDTO> list = categoryService.findAll();

        APIResponse<List<CategoryDTO>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Lấy danh sách danh mục thành công");
        response.setData(list);

        return ResponseEntity.ok(response);
    }
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<CategoryDTO>> create(@RequestBody CategoryDTO dto) {
        CategoryDTO newCategory = categoryService.save(dto);

        APIResponse<CategoryDTO> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Tạo danh mục mới thành công");
        response.setData(newCategory);

        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<CategoryDTO>> update(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        CategoryDTO updatedCategory = categoryService.update(id, dto);

        APIResponse<CategoryDTO> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Cập nhật danh mục thành công");
        response.setData(updatedCategory);

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<APIResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);

        APIResponse<Void> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Xóa vĩnh viễn danh mục thành công");
        response.setData(null); // Xóa thành công thì data để null giống chuẩn chung

        return ResponseEntity.ok(response);
    }
}
