package com.thuc_kien.freelance_marketplace.DTO;


import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    @Schema(description = "JWT Access Token", example = "eyJhbGciOiJIUzI1Ni...")
    private String token;

    @Schema(description = "Tên tài khoản", example = "thucpham123")
    private String username;

    @Schema(description = "Họ và tên đầy đủ", example = "Phạm Nguyễn Minh Thức")
    private String fullname;

    @Schema(description = "Danh sách các vai trò sở hữu", example = "[\"ROLE_BUYER\", \"ROLE_SELLER\"]")
    private Set<String> roles;

    @Schema(description = "Vai trò hiện tại đang hiển thị", example = "ROLE_BUYER")
    private String currentRole;

    @Schema(description = "Loại token", example = "Bearer")
    private String type;

    @Schema(description = "thời hạn token")
    private long expiresIn;
}
