package com.thuc_kien.freelance_marketplace.DTO;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DeliverOrderRequest {
    private String submissionLink;

    private MultipartFile file;
    private String note;
}
