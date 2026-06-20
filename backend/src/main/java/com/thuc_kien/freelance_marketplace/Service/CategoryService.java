package com.thuc_kien.freelance_marketplace.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.thuc_kien.freelance_marketplace.Repository.CategoryRepository;
import com.thuc_kien.freelance_marketplace.Repository.GigRepository;
import com.thuc_kien.freelance_marketplace.DTO.CategoryDTO;
import com.thuc_kien.freelance_marketplace.DTO.CategoryResponseDTO;
import com.thuc_kien.freelance_marketplace.Entity.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final GigRepository gigRepo;
    public List<CategoryResponseDTO> getCategoryTree() {
        List<Category> rootCategories = categoryRepository.findRootCategoriesWithSubCategories();

        return rootCategories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CategoryResponseDTO convertToDTO(Category category) {
        List<CategoryResponseDTO> subDTOs = null;

        if (category.getChildren() != null) {
            subDTOs = category.getChildren().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .subCategories(subDTOs)
                .imgUrl(category.getImgUrl())
                .build();
    }

    public List<String> getAllChildSlugByParentSlug(String parentSlug) {
        return categoryRepository.findChildSlugsByParentSlug(parentSlug);
    }

    // Hàm tự động tạo Slug từ Name (Ví dụ: "Web Development" -> "web-development")
    private String toSlug(String input) {
        if (input == null)
            return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase(Locale.ENGLISH)
                .replaceAll("[^a-z0-9-]", "");
    }
    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO2)
                .collect(Collectors.toList());
    }

    public CategoryDTO save(CategoryDTO dto) {
        String slug = toSlug(dto.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new RuntimeException("Danh mục với tên hoặc slug này đã tồn tại!");
        }

        Category category = new Category();
        category.setName(dto.getName().trim());
        category.setSlug(slug);
        category.setImgUrl(dto.getImgUrl());

        // Xử lý quan hệ danh mục cha nếu parentId được gửi lên
        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
            category.setParent(parent);
        }

        return convertToDTO2(categoryRepository.save(category));
    }

    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        String newSlug = toSlug(dto.getName());
        if (categoryRepository.existsBySlugAndIdNot(newSlug, id)) {
            throw new RuntimeException("Tên danh mục mới gây trùng lặp slug hệ thống!");
        }

        category.setName(dto.getName().trim());
        category.setSlug(newSlug);
        category.setImgUrl(dto.getImgUrl());

        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(id)) {
                throw new RuntimeException("Danh mục không thể làm cha của chính nó!");
            }
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
            category.setParent(parent);
        } else {
            category.setParent(null); // Reset nếu muốn chuyển thành danh mục gốc
        }

        return convertToDTO2(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        // Chặn xóa nếu có Gigs liên kết
        if (gigRepo.existsByCategoryId(id)) {
            throw new RuntimeException("Không thể xóa danh mục đang có dịch vụ hoạt động!");
        }

        // Chặn xóa nếu danh mục này đang là cha của danh mục khác
        if (categoryRepository.existsByParentId(id)) {
            throw new RuntimeException( "Không thể xóa! Danh mục này chứa các danh mục con bên trong.");
        }

        categoryRepository.delete(category);
    }

    private CategoryDTO convertToDTO2(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setImgUrl(category.getImgUrl());
        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
        }
        return dto;
    }
}
