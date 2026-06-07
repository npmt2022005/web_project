package com.thuc_kien.freelance_marketplace.Service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileUploadService {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn một file ảnh!");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Chỉ cho phép upload hình ảnh!");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            
            return uploadResult.get("secure_url").toString();
            
        } catch (IOException e) {
            throw new RuntimeException("Đã xảy ra lỗi khi tải ảnh lên Cloudinary", e);
        }
    }
}
