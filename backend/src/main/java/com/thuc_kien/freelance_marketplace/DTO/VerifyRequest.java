package com.thuc_kien.freelance_marketplace.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu xác thực mã OTP")
public class VerifyRequest {
    @Schema(description = "Email hoặc Số điện thoại đã dùng để nhận OTP", 
            example = "thuc@gmail.com", 
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Identifier không được để trống")
    @Pattern(
        regexp = "^([A-Za-z0-9+_.-]+@(.+))|(0\\d{9})$", 
        message = "Identifier phải là Email hoặc Số điện thoại 10 chữ số"
    )
    private String identifier;


    @Schema(description = "Mã xác thực gồm 6 chữ số", 
            example = "123456", 
            minLength = 6, 
            maxLength = 6, 
            requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Mã OTP không được để trống")
    @Size(min = 6, max = 6, message = "Mã OTP phải có đúng 6 chữ số")
    private String otp;
}
