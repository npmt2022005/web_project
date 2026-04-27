package com.thuc_kien.freelance_marketplace.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ForgotPasswordRequest {
    @NotBlank(message = "Tên định danh không được để trống")
    @Pattern(
        regexp = "^([A-Za-z0-9+_.-]+@(.+))|(0\\d{9})$", 
        message = "Định danh phải là Email hợp lệ hoặc Số điện thoại 10 chữ số"
    )
    @Schema(description = "Email hoặc Số điện thoại", example = "thuc@gmail.com hoặc 0987654321")
    private String identifier;
}
