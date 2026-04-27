package com.thuc_kien.freelance_marketplace.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Yêu cầu đặt lại mật khẩu")
public class ResetPasswordRequest {
    @Schema(description = "Email hoặc Số điện thoại của tài khoản", example = "thucpham@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Thông tin định danh không được để trống")
    @Pattern(
        regexp = "^([A-Za-z0-9+_.-]+@(.+))|(0\\d{9})$", 
        message = "Identifier phải là Email hoặc Số điện thoại 10 chữ số"
    )
    private String identifier;

    @Schema(description = "Mã xác thực OTP đã gửi qua Email/SMS", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Mã OTP không được để trống")
    @Size(min = 6, max = 6, message = "Mã OTP phải có đúng 6 chữ số")
    private String otp;

    @Schema(description = "Mật khẩu mới", example = "NewPassword123!", minLength = 8, requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String newPassword;

    @Schema(description = "Nhập lại mật khẩu mới", example = "NewPassword123!", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
}
