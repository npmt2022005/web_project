package com.thuc_kien.freelance_marketplace.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.*;
import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.GigFeaturedResponseDTO;
import com.thuc_kien.freelance_marketplace.Service.GigService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/gigs")
@RequiredArgsConstructor
@Tag(name = "Gig Management", description = "Các API quản lý và hiển thị bài đăng dịch vụ (Gigs)")
public class GigController {
    
    private final GigService gigService;

    @Operation(summary = "Lấy danh sách dịch vụ nổi bật (Featured Gigs)", 
            description = "API này mở công khai để lấy các dịch vụ có rating và lượt review cao nhất hiển thị lên trang chủ.")
    @GetMapping("/featured")
    public ResponseEntity<APIResponse<List<GigFeaturedResponseDTO>>> getFeaturedGigs(
            @Parameter(description = "Số lượng dịch vụ tối đa muốn lấy ra để hiển thị", example = "4")
            @RequestParam(defaultValue = "8") int limit
    ) {
        List<GigFeaturedResponseDTO> featuredGigs = gigService.getFeaturedGigs(limit);
        
        APIResponse<List<GigFeaturedResponseDTO>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Lấy danh sách dịch vụ nổi bật thành công");
        response.setData(featuredGigs);
        
        return ResponseEntity.ok(response);
    }
    
}
