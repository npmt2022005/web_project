package com.thuc_kien.freelance_marketplace.Controller;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.ProfileResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.ProfileUpdateRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.StripeOnboardingResponse;
import com.thuc_kien.freelance_marketplace.Service.ProfileService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/profiles")
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<APIResponse<ProfileResponseDTO>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 1. Lấy ID người dùng
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        ProfileResponseDTO profile = profileService.getFullProfile(currentUserId);
        APIResponse<ProfileResponseDTO> response = APIResponse.<ProfileResponseDTO>builder()
                .status("success")
                .message("Dang Profile thanh cong")
                .data(profile)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/bank-setup")
    public ResponseEntity<APIResponse<StripeOnboardingResponse>> setupBankConnection(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        try {
            String onboardingUrl = profileService.createStripeConnectAccount(currentUserId);

            return ResponseEntity.ok(new APIResponse<>(
                    "success",
                    "Khởi tạo thành công, vui lòng chuyển hướng người dùng",
                    new StripeOnboardingResponse(onboardingUrl)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new APIResponse<>(
                    "error",
                    "Không thể khởi tạo Stripe: " + e.getMessage(),
                    null));
        }
    }

    @GetMapping("/me/verify-bank")
    public ResponseEntity<APIResponse<String>> verifyBank(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        profileService.verifyAndSyncStripeStatus(currentUserId);
        return ResponseEntity.ok(new APIResponse<>("success", "Đã đồng bộ trạng thái", null));
    }

    @PatchMapping("/me")
    public ResponseEntity<APIResponse<String>> updateProfile(
            @RequestBody ProfileUpdateRequestDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        profileService.updateBasicInfo(currentUserId, dto);
        return ResponseEntity.ok(APIResponse.<String>builder()
                .status("success")
                .message("Cập nhật hồ sơ thành công")
                .build());
    }

    
    @PostMapping("/avatar")
    public ResponseEntity<APIResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        String newUrl = profileService.updateAvatar(currentUserId, file);

        return ResponseEntity.ok(APIResponse.<String>builder()
                .status("success")
                .message("Cập nhật ảnh đại diện thành công")
                .data(newUrl)
                .build());
    }
    
    
}