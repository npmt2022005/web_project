package com.thuc_kien.freelance_marketplace.Repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.thuc_kien.freelance_marketplace.Entity.Category;


@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>{
    // Lấy tất cả danh mục gốc (parent_id IS NULL) kèm theo các danh mục con của chúng
    @Query("SELECT DISTINCT c FROM Category c " +
            "LEFT JOIN FETCH c.children " +
            "WHERE c.parent IS NULL")
    List<Category> findRootCategoriesWithSubCategories();

    @Query("SELECT c.slug FROM Category c WHERE c.parent.slug = :parentSlug")
    List<String> findChildSlugsByParentSlug(String parentSlug);

    boolean existsByName(String name);
    
    // Kiểm tra tên danh mục tồn tại nhưng loại trừ ID hiện tại (dùng khi cập nhật)
    boolean existsByNameAndIdNot(String name, Long id);

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsByParentId(Long parentId);
    
    
}
