package com.thuc_kien.freelance_marketplace.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.Repository.CategoryRepository;
import com.thuc_kien.freelance_marketplace.DTO.CategoryResponseDTO;
import com.thuc_kien.freelance_marketplace.Entity.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

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
    
}
