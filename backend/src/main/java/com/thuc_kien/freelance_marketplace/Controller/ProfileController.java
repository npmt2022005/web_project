package com.thuc_kien.freelance_marketplace.Controller;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.ProfileResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.ProfileUpdateRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.RoleResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.StripeOnboardingResponse;
import com.thuc_kien.freelance_marketplace.Service.ProfileService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;import jakarta.servlet.http.HttpServletRequest;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/profile")
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
                .message("Lấy thông tin hồ sơ thành công")
                .data(profile)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/bank-setup")
    public ResponseEntity<APIResponse<StripeOnboardingResponse>> setupBankConnection(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        try {
            String origin = request.getHeader("Origin");
            if (origin == null || origin.isBlank()) {
                String scheme = request.getHeader("X-Forwarded-Proto");
                if (scheme == null || scheme.isBlank()) {
                    scheme = request.getScheme();
                }

                String host = request.getHeader("X-Forwarded-Host");
                if (host == null || host.isBlank()) {
                    host = request.getHeader("Host");
                }
                if (host == null || host.isBlank()) {
                    host = request.getServerName();
                    if ((request.getScheme().equals("http") && request.getServerPort() != 80)
                            || (request.getScheme().equals("https") && request.getServerPort() != 443)) {
                        host += ":" + request.getServerPort();
                    }
                }
                origin = scheme + "://" + host;
            }
            String onboardingUrl = profileService.createStripeConnectAccount(currentUserId, origin);

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

    @PostMapping("/me/upgrade")
    public ResponseEntity<APIResponse<RoleResponseDTO>> upgradeToSeller(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        try {
            Long sellerId = profileService.upgradeToSeller(currentUserId);
            return ResponseEntity.ok(APIResponse.<RoleResponseDTO>builder()
                    .status("success")
                    .message("Tài khoản đã được nâng cấp lên người bán")
                    .data(new RoleResponseDTO("ROLE_SELLER", sellerId))
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new APIResponse<>("error", e.getMessage(), null));
        }
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