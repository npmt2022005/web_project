package com.thuc_kien.freelance_marketplace.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.Service.FileUploadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/uploads")
public class FileUploadController {
    private final FileUploadService fileUploadService;
    @PostMapping("/image")
    public ResponseEntity<APIResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file 
    ) {
        
        String imageUrl = fileUploadService.uploadImage(file);

        APIResponse<String> response = new APIResponse<>();
        response.setStatus("success");
        response.setMessage("Tải ảnh lên mây thành công!");
        response.setData(imageUrl); 

        return ResponseEntity.ok(response);
    }
}
