package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.EducationRequestDTO;
import com.thuc_kien.freelance_marketplace.Entity.Education;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Repository.EducationRepository;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EducationService {

    private final EducationRepository eduRepo;
    private final SellerRepository sellerRepo;

    // 1. Tạo mới học vấn
    public Long createEducation(Long userId, EducationRequestDTO dto) {
        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa đăng ký Seller"));

        Education edu = new Education();
        edu.setSchool(dto.getSchool());
        edu.setDegree(dto.getDegree());
        edu.setDuration(dto.getDuration());
        edu.setDescription(dto.getDescription());
        edu.setSeller(seller); // Gán quan hệ

        return eduRepo.save(edu).getId();
    }

    // 2. Cập nhật học vấn
    public void updateEducation(Long userId, Long eduId, EducationRequestDTO dto) {
        // Tìm education, nếu không thấy văng lỗi
        Education edu = eduRepo.findById(eduId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục học vấn"));

        // QUAN TRỌNG: Kiểm tra quyền sở hữu
        // Chỉ cho phép cập nhật nếu giáo dục này thuộc về đúng Seller (User) đó
        if (!edu.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa mục này!");
        }
        // Cập nhật thông tin
        edu.setSchool(dto.getSchool());
        edu.setDegree(dto.getDegree());
        edu.setDuration(dto.getDuration());
        edu.setDescription(dto.getDescription());
        
        eduRepo.save(edu);
    }

    // 3. Xóa học vấn
    public void deleteEducation(Long userId, Long eduId) {
        Education edu = eduRepo.findById(eduId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục học vấn"));

        // QUAN TRỌNG: Kiểm tra quyền sở hữu
        if (!edu.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa mục này!");
        }

        eduRepo.delete(edu);
    }
}
