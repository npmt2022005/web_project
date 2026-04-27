package com.thuc_kien.freelance_marketplace.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Cấu trúc phản hồi chung từ hệ thống")
public class APIResponse<T> {

    @Schema(description = "Trạng thái phản hồi", example = "success")
    private String status;

    private String message;

    @Schema(description = "Dữ liệu trả về (có thể là Object, List hoặc null)")
    private T data;
}
