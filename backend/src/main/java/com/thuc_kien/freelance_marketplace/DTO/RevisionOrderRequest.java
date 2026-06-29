package com.thuc_kien.freelance_marketplace.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RevisionOrderRequest {
    @NotBlank(message = "Vui lòng nhập nội dung yêu cầu chỉnh sửa chi tiết.")
    private String revisionNote;

    private String revisionFileUrl; // Không bắt buộc, có thể null

}
