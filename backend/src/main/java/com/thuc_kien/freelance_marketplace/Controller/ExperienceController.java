package com.thuc_kien.freelance_marketplace.Controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.ProfileResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.ExperienceRequestDTO;
import com.thuc_kien.freelance_marketplace.Service.ExperienceService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/profile/experience")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService experienceService;

    @PostMapping
    public ResponseEntity<APIResponse<ProfileResponseDTO.TimelineDTO>> addExperience(@RequestBody ExperienceRequestDTO dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        ProfileResponseDTO.TimelineDTO savedExp = experienceService.createExperience(currentUserId, dto);
        return ResponseEntity.ok(new APIResponse<>("success", "Thêm kinh nghiệm thành công", savedExp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<ProfileResponseDTO.TimelineDTO>> updateExperience(@PathVariable Long id, @RequestBody ExperienceRequestDTO dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        ProfileResponseDTO.TimelineDTO updatedExp = experienceService.updateExperience(currentUserId, id, dto);
        return ResponseEntity.ok(new APIResponse<>("success", "Cập nhật kinh nghiệm thành công", updatedExp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<Void>> deleteExperience(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        experienceService.deleteExperience(currentUserId, id);
        return ResponseEntity.ok(new APIResponse<>("success", "Xóa kinh nghiệm thành công", null));
    }
}
