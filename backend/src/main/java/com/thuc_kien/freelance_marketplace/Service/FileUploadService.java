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
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "folder", "freelance_marketplace/gigs", // 👈 Tự tạo thư mục trên Cloudinary
                "resource_type", "image"
            )
        );
            
            return uploadResult.get("secure_url").toString();
            
        } catch (IOException e) {
            throw new RuntimeException("Đã xảy ra lỗi khi tải ảnh lên Cloudinary", e);
        }
    }
    @SuppressWarnings("unchecked")
    public String uploadFile(MultipartFile file) throws IOException{
        if (file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn một file đính kèm!");
        }

        // 1. Lọc đuôi file cơ bản: Chặn các file thực thi nguy hiểm
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String lowerCaseName = originalFilename.toLowerCase();
            if (lowerCaseName.endsWith(".exe") || lowerCaseName.endsWith(".bat") || 
                lowerCaseName.endsWith(".sh") || lowerCaseName.endsWith(".msi")) {
                throw new RuntimeException("Định dạng file không được hỗ trợ để đảm bảo an toàn!");
            }
        }
        Map<String, Object> params = ObjectUtils.asMap(
            "resource_type", "auto",
            "folder", "freelance_marketplace/attachments",
            "use_filename", true,    // Yêu cầu Cloudinary giữ lại tên file của người dùng
            "unique_filename", true 
        );
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        return uploadResult.get("secure_url").toString();
    }
}
