package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.ExperienceRequestDTO;
import com.thuc_kien.freelance_marketplace.Entity.Experience;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Repository.ExperienceRepository;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ExperienceService {

    private final ExperienceRepository expRepo;
    private final SellerRepository sellerRepo;

    public Long createExperience(Long userId, ExperienceRequestDTO dto) {
        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa đăng ký Seller"));

        Experience exp = new Experience();
        exp.setCompany(dto.getCompany());
        exp.setRole(dto.getRole());
        exp.setDuration(dto.getDuration());
        exp.setDescription(dto.getDescription());
        exp.setSeller(seller);
        
        return expRepo.save(exp).getId();
    }

    public void updateExperience(Long userId, Long expId, ExperienceRequestDTO dto) {
        Experience exp = expRepo.findById(expId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kinh nghiệm này"));

        // Kiểm tra quyền sở hữu
        if (!exp.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa thông tin này!");
        }

        exp.setCompany(dto.getCompany());
        exp.setRole(dto.getRole());
        exp.setDuration(dto.getDuration());
        exp.setDescription(dto.getDescription());
        expRepo.save(exp);
    }

    public void deleteExperience(Long userId, Long expId) {
        Experience exp = expRepo.findById(expId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kinh nghiệm này"));

        // Kiểm tra quyền sở hữu
        if (!exp.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa thông tin này!");
        }

        expRepo.delete(exp);
    }
}
