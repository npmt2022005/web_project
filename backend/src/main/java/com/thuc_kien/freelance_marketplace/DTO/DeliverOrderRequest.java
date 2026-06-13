package com.thuc_kien.freelance_marketplace.DTO;

import javax.validation.constraints.NotBlank;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DeliverOrderRequest {
    @NotBlank(message = "Link sản phẩm không được để trống.")
    private String submissionLink;

    private MultipartFile file;
    private String note;
}
