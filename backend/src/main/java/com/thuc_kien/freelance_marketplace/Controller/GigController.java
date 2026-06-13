package com.thuc_kien.freelance_marketplace.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.*;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.GigCardDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigCreateRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigDetailResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigFeaturedResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.SellerGigResponse;
import com.thuc_kien.freelance_marketplace.Service.GigService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/gigs")
@RequiredArgsConstructor
@Tag(name = "Gig Management", description = "Các API quản lý và hiển thị bài đăng dịch vụ (Gigs)")
public class GigController {

    private final GigService gigService;

    @Operation(summary = "Lấy danh sách dịch vụ nổi bật (Featured Gigs)", description = "API này mở công khai để lấy các dịch vụ có rating và lượt review cao nhất hiển thị lên trang chủ.")

    @GetMapping("/featured")
    public ResponseEntity<APIResponse<List<GigFeaturedResponseDTO>>> getFeaturedGigs(
            @Parameter(description = "Số lượng dịch vụ tối đa muốn lấy ra để hiển thị", example = "4") @RequestParam(defaultValue = "8") int limit) {
        List<GigFeaturedResponseDTO> featuredGigs = gigService.getFeaturedGigs(limit);

        APIResponse<List<GigFeaturedResponseDTO>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Lấy danh sách dịch vụ nổi bật thành công");
        response.setData(featuredGigs);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gigId}")
    public ResponseEntity<APIResponse<GigDetailResponseDTO>> getGigDetail(@PathVariable Long gigId) {
        GigDetailResponseDTO detailGig = gigService.getDetailGig(gigId);
        APIResponse<GigDetailResponseDTO> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Lấy danh sách dịch vụ nổi bật thành công");
        response.setData(detailGig);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gigId}/similar")
    public ResponseEntity<APIResponse<Map<String, List<GigCardDTO>>>> getSimilarGigs(@PathVariable Long gigId) {

        Map<String, List<GigCardDTO>> similarGigs = gigService.getSimilarGigs(gigId);

        APIResponse<Map<String, List<GigCardDTO>>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Lấy danh sách dịch vụ tương tự thành công");
        response.setData(similarGigs);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/create_gig")
    public ResponseEntity<APIResponse<Long>> createGig(@AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody GigCreateRequestDTO request) {

        Long currentSellerId = userDetails.getUser().getId();

        Long newGigId = gigService.createGig(currentSellerId, request);

        // Trả kết quả chuẩn JSON
        APIResponse<Long> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Đăng bài dịch vụ thành công!");
        response.setData(newGigId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete_gig/{gigId}")
    public ResponseEntity<APIResponse<String>> deleteGig(@AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long gigId) {

        Long currentSellerId = userDetails.getUser().getId();

        gigService.deleteGig(gigId, currentSellerId);

        APIResponse<String> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Đã xóa bài dịch vụ thành công!");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<APIResponse<Page<SellerGigResponse>>> getMyGigs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long currentSellerId = userDetails.getUser().getId();

            Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<SellerGigResponse> myGigs = gigService.getGigsBySeller(currentSellerId, pageable);

            return ResponseEntity.ok(
                    APIResponse.<Page<SellerGigResponse>>builder()
                            .status("success")
                            .message("Lấy danh sách dịch vụ thành công.")
                            .data(myGigs)
                            .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<Page<SellerGigResponse>>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }
}
