package com.thuc_kien.freelance_marketplace.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.thuc_kien.freelance_marketplace.Entity.UserRole;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RegisterRequest {
    
    @Schema(description = "Họ và tên đầy đủ", example = "Nguyễn Văn A", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message="Fullname không được để trống")
    private String fullname;
    
    @Schema(description = "Địa chỉ email cá nhân", example = "nguyenvana@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng email không hợp lệ")
    private String email;

    @Schema(description = "Số điện thoại di động (10 số, bắt đầu bằng 0)", example = "0987654321", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message =  "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0")
    private String phone;
    
    @Schema(description = "Mật khẩu đăng nhập (tối thiểu 8 ký tự)", example = "Password123!", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    @Schema(description = "Nhập lại mật khẩu để xác nhận", example = "Password123!", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Mật khẩu xác thực không được để trống")
    private String confirmPassword;

    @Schema(description = "Tên đăng nhập duy nhất", example = "vana_nguyen", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "username không được để trống")
    private String username;

    @Schema(
        description = "Vai trò người dùng: BUYER (Người thuê) hoặc SELLER (Freelancer)",
        allowableValues = {"ROLE_BUYER", "ROLE_SELLER"}, // Hiển thị các giá trị được phép
        example = "ROLE_BUYER "
    )
    @NotNull(message = "Vai trò không được để trống")
    private UserRole role; 
}
