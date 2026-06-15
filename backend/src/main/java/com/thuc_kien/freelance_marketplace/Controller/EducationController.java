package com.thuc_kien.freelance_marketplace.Controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.EducationRequestDTO;
import com.thuc_kien.freelance_marketplace.Service.EducationService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/profiles/educations")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;

    @PostMapping
    public ResponseEntity<APIResponse<Long>> addEducation(@RequestBody EducationRequestDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        Long eduId = educationService.createEducation(currentUserId, dto);
        return ResponseEntity.ok(new APIResponse<>("success", "Thêm học vấn thành công", eduId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<APIResponse<String>> updateEducation(@PathVariable Long id,
            @RequestBody EducationRequestDTO dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        educationService.updateEducation(currentUserId, id, dto);
        return ResponseEntity.ok(new APIResponse<>("success", "Cập nhật học vấn thành công", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<APIResponse<String>> deleteEducation(@PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        educationService.deleteEducation(currentUserId, id);
        return ResponseEntity.ok(new APIResponse<>("success", "Xóa học vấn thành công", null));
    }

}
