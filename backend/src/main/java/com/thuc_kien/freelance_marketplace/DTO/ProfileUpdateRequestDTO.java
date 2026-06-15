package com.thuc_kien.freelance_marketplace.DTO;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateRequestDTO {
    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description; 
    @Pattern(regexp = "^(http|https)://.*", message = "URL ảnh không hợp lệ")
    private String avatarUrl;
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải từ 10-11 chữ số")
    private String phone;
    @Size(max = 50, message = "Quốc gia không được quá 50 ký tự")
    private String country;
    @Size(max = 50, message = "Thành phố không được quá 50 ký tự")
    private String city;
    
}
