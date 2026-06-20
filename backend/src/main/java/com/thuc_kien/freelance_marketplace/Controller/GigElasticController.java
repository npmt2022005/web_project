package com.thuc_kien.freelance_marketplace.Controller;

import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.GigSearchResponseDTO;
import com.thuc_kien.freelance_marketplace.Service.*;

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
    private final SellerService sellerService;

    @Operation(summary = "Tìm kiếm và đa bộ lọc dịch vụ siêu tốc", description = "API gộp đa năng: Phục vụ cả tìm kiếm ở trang chủ lẫn việc bấm chọn các bộ lọc (Budget, Level, Country, Delivery Time) ở trang kết quả.")
    @GetMapping("/search")
    public ResponseEntity<APIResponse<List<GigSearchResponseDTO>>> searchGigs(
            @Parameter(description = "Cục đối tượng gom tất cả các điều kiện lọc và phân trang truyền từ URL") @ModelAttribute GigSearchRequestDTO searchRequest) {
        // Gọi xuống hàm Service xử lý Criteria động đã sửa ở bước trước
        List<GigSearchResponseDTO> results = gigService.searchGigs(searchRequest);

        // Bọc vào cấu trúc APIResponse chuẩn của hệ thống
        APIResponse<List<GigSearchResponseDTO>> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Tìm kiếm và áp dụng các bộ lọc từ Elasticsearch thành công");
        response.setData(results);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy dữ liệu cấu hình bộ lọc (Filter Metadata)", description = "Trả về danh sách quốc gia, giá cao nhất hệ thống, cấp độ người bán và mốc thời gian giao hàng. Giúp Frontend (React) xây dựng bộ lọc động mà không cần hardcode.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy dữ liệu thành công", content = @Content(mediaType = "application/json", schema = @Schema(implementation = APIResponse.class))),
            @ApiResponse(responseCode = "500", description = "Lỗi hệ thống ngầm khi tính toán dữ liệu", content = @Content)
    })
    @GetMapping("/meta/filters")
    public ResponseEntity<APIResponse<Map<String, Object>>> getFilterMetadata() {
        Map<String, Object> meta = new HashMap<>();

        try {
            System.out.println("DEBUG: Đang lấy locations...");
            meta.put("locations", userService.getDistinctActiveCountries());

            System.out.println("DEBUG: Đang lấy maxPrice...");
            meta.put("maxSystemPrice", gigService.getMaximumPrice());

            System.out.println("DEBUG: Đang lấy languages...");
            meta.put("languages", sellerService.getAllLanguage());

            meta.put("sellerLevels", List.of("New Seller", "Level One", "Level Two", "Top Rated"));
            meta.put("deliveryTimes", List.of("Express 24h", "Up to 3 days", "Up to 7 days", "Over 7 days"));

            System.out.println("DEBUG: Đang lấy popularTags...");
            meta.put("popularTags", gigService.getPopularCategoryNames());

            return ResponseEntity.ok(new APIResponse<>("success", "Lấy metadata bộ lọc thành công", meta));
        } catch (Exception e) {
            e.printStackTrace(); // 🚩 Dòng này sẽ chỉ rõ hàm nào bị lỗi
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new APIResponse<>("error", "Lỗi: " + e.getMessage(), null));
        }
    }

    // @Operation(
    // summary = "Admin - Đồng bộ dữ liệu từ MySQL sang Elasticsearch",
    // description = "API đặc quyền dành cho Admin/Hệ thống dùng để quét sạch MySQL
    // và nạp (Bulk Insert) lại toàn bộ sang Elasticsearch."
    // )
    // @PostMapping("/admin/sync")
    // public ResponseEntity<APIResponse<String>> syncDatabaseWithElastic() {
    // // Gọi hàm kích hoạt đồng bộ dữ liệu ban đầu
    // gigService.syncAllGigsFromMySQLToElastic();

    // APIResponse<String> response = new APIResponse<>();
    // response.setStatus("success");
    // response.setMessage("Đồng bộ toàn bộ dữ liệu sang Elasticsearch hoàn tất!");
    // response.setData(null);

    // return ResponseEntity.ok(response);
    // }
}