package com.thuc_kien.freelance_marketplace.Controller;

import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchResponseDTO;
import com.thuc_kien.freelance_marketplace.Service.CategoryService;
import com.thuc_kien.freelance_marketplace.Service.GigService;
import com.thuc_kien.freelance_marketplace.Service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/gigs_v1")
@RequiredArgsConstructor
@Tag(name = "Gig Search (Elasticsearch)", description = "Các API tìm kiếm và lọc dịch vụ nâng cao sử dụng bộ máy Elasticsearch")
public class GigElasticController {

    private final GigService gigService;
    private final UserService userService;

    @Operation(
        summary = "Tìm kiếm và đa bộ lọc dịch vụ siêu tốc (Fuzzy Search)", 
        description = "API gộp đa năng: Phục vụ cả tìm kiếm ở trang chủ lẫn việc bấm chọn các bộ lọc (Budget, Level, Country, Delivery Time) ở trang kết quả."
    )
    @GetMapping("/search")
    public ResponseEntity<APIResponse<List<GigSearchResponseDTO>>> searchGigs(
            @Parameter(description = "Cục đối tượng gom tất cả các điều kiện lọc và phân trang truyền từ URL")
            @ModelAttribute GigSearchRequestDTO searchRequest
    ) {
        // Gọi xuống hàm Service xử lý Criteria động đã sửa ở bước trước
        List<GigSearchResponseDTO> results = gigService.searchGigs(searchRequest);

        // Bọc vào cấu trúc APIResponse chuẩn của hệ thống
        APIResponse<List<GigSearchResponseDTO>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Tìm kiếm và áp dụng các bộ lọc từ Elasticsearch thành công");
        response.setData(results);

        return ResponseEntity.ok(response);
    }
    @Operation(
        summary = "Lấy dữ liệu cấu hình bộ lọc (Filter Metadata)",
        description = "Trả về danh sách quốc gia, giá cao nhất hệ thống, cấp độ người bán và mốc thời gian giao hàng. Giúp Frontend (React) xây dựng bộ lọc động mà không cần hardcode."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Lấy dữ liệu thành công",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = APIResponse.class))
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Lỗi hệ thống ngầm khi tính toán dữ liệu", 
            content = @Content
        )
    })
    @GetMapping("/meta/filters")
    public ResponseEntity<APIResponse<Map<String, Object>>> getFilterMetadata() {
        Map<String, Object> meta = new HashMap<>();
        
        // Lấy động từ Database
        meta.put("locations", userService.getDistinctActiveCountries()); // "Vietnam", "USA"
        meta.put("maxSystemPrice", gigService.getMaximumPrice()); // Trả về ví dụ: 5000.0 để Frontend làm mốc kéo tối đa
        
        // Trả về kèm các cấu hình hệ thống (Nếu không muốn hardcode ở React)
        meta.put("sellerLevels", List.of("New Seller", "Level One", "Level Two", "Top Rated"));
        meta.put("deliveryTimes", List.of("Express 24h", "Up to 3 days", "Up to 7 days"));
        meta.put("languages", List.of("English", "Vietnamese", "Spanish", "French", "Chinese"));
        List<Map<String, String>> sortOptions = List.of(
            Map.of("value", "Recommended", "label", "Đề xuất cho bạn"),
            Map.of("value", "BestSeller", "label", "Bán chạy nhất"),
            Map.of("value", "NewArrivals", "label", "Mới nhất")
        );
        meta.put("sortOptions", sortOptions);
        return ResponseEntity.ok(new APIResponse<>("success", "Lấy metadata bộ lọc thành công", meta));
    }

    
    // @Operation(
    //     summary = "Admin - Đồng bộ dữ liệu từ MySQL sang Elasticsearch", 
    //     description = "API đặc quyền dành cho Admin/Hệ thống dùng để quét sạch MySQL và nạp (Bulk Insert) lại toàn bộ sang Elasticsearch."
    // )
    // @PostMapping("/admin/sync")
    // public ResponseEntity<APIResponse<String>> syncDatabaseWithElastic() {
    //     // Gọi hàm kích hoạt đồng bộ dữ liệu ban đầu
    //     gigService.syncAllGigsFromMySQLToElastic();

    //     APIResponse<String> response = new APIResponse<>();
    //     response.setStatus("success");
    //     response.setMessage("Đồng bộ toàn bộ dữ liệu sang Elasticsearch hoàn tất!");
    //     response.setData(null);

    //     return ResponseEntity.ok(response);
    // }
}