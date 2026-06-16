package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.DTO.ExperienceRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.ProfileResponseDTO;
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

    public ProfileResponseDTO.TimelineDTO createExperience(Long userId, ExperienceRequestDTO dto) {
        Seller seller = sellerRepo.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa đăng ký Seller"));

        Experience exp = new Experience();
        // Khóa chính id của Experience sẽ tự tăng, không dùng setId(userId)
        exp.setCompany(dto.getCompany());
        exp.setRole(dto.getRole());
        exp.setDuration(dto.getDuration());
        exp.setDescription(dto.getDescription());
        exp.setSeller(seller);
        
        Experience savedExp = expRepo.save(exp);
        return mapExperienceToTimelineDTO(savedExp);
    }

    public ProfileResponseDTO.TimelineDTO updateExperience(Long userId, Long expId, ExperienceRequestDTO dto) {
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
        return mapExperienceToTimelineDTO(exp);
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

    // Helper method to map Experience entity to ProfileResponseDTO.TimelineDTO
    private ProfileResponseDTO.TimelineDTO mapExperienceToTimelineDTO(Experience exp) {
        return ProfileResponseDTO.TimelineDTO.builder()
                .id(exp.getId())
                .duration(exp.getDuration()) // Thời gian làm việc
                .title(exp.getRole())        // Vị trí/Chức danh (Hiện thị ở dòng chính/Title)
                .subtitle(exp.getCompany())  // Tên công ty (Hiển thị ở dòng phụ/Subtitle)
                .description(exp.getDescription())
                .build();
    }
}
