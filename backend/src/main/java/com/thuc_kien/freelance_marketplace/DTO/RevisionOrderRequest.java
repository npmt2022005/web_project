package com.thuc_kien.freelance_marketplace.DTO;

import jakarta.validation.constraints.NotBlank;

public class RevisionOrderRequest {
    @NotBlank(message = "Vui lòng nhập chi tiết yêu cầu chỉnh sửa để người bán có thể khắc phục.")
    private String revisionNote;
}
