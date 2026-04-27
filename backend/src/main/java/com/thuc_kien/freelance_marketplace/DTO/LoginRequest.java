package com.thuc_kien.freelance_marketplace.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin yêu cầu đăng nhập")
public class LoginRequest {
    @Schema(description = "Tên đăng nhập (Username, Email hoặc Số điện thoại)", 
            example = "minhthuc@gmail.com", 
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String identifier;

    @Schema(description = "Mật khẩu tài khoản", 
            example = "Password123!", 
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
