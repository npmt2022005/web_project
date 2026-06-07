package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Dữ liệu trả về cho mỗi thẻ dịch vụ trên trang kết quả tìm kiếm và lọc")
public class GigSearchResponseDTO {

    @Schema(description = "ID duy nhất của bài đăng dịch vụ (Gig ID)", example = "15")
    private Long id;

    @Schema(description = "Tiêu đề của dịch vụ (Chứa từ khóa tìm kiếm)", example = "I will build a responsive React website")
    private String title;

    @Schema(description = "Đường dẫn hình ảnh đại diện của dịch vụ lấy từ Cloud", example = "https://res.cloudinary.com/.../web-dev.jpg")
    private String thumbnailUrl;

    @Schema(description = "Giá khởi điểm của dịch vụ ($ USD)", example = "200.0")
    private BigDecimal price;

    @Schema(description = "Điểm đánh giá trung bình (được tính toán từ các review trong hệ thống)", example = "4.9")
    private Double rating;

    @Schema(description = "Tổng số lượng lượt đánh giá hiện tại của dịch vụ", example = "89")
    private Integer reviews;

    // --- THÔNG TIN NGƯỜI BÁN ---
    
    @Schema(description = "Họ và tên của người bán dịch vụ", example = "David Pham")
    private String seller;

    @Schema(description = "Thời gian dự kiến hoàn thành dịch vụ (đơn vị ngày)", example = "10")
    private Integer deliveryTime;

    
    @Schema(description = "Tên danh mục con trực tiếp chứa bài đăng này", example = "Web Development")
    private String categoryName;

    @Schema(description = "Quốc gia của người bán", example = "Vietnam")
    private String country;

    @Schema(description = "Cấp độ của người bán", example = "New Seller")
    private String level;
}
