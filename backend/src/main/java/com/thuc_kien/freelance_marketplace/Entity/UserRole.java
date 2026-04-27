package com.thuc_kien.freelance_marketplace.Entity;

import lombok.Getter;

@Getter
public enum UserRole {
    // Ánh xạ đúng với giá trị "buyer" mặc định trong database của bạn
    ROLE_BUYER("Khách mua hàng"),
    
    // Bạn có thể thêm các role khác tùy theo yêu cầu dự án
    ROLE_SELLER("Người bán hàng"),
    
    ROLE_ADMIN("Quản trị viên");

    private final String displayName;

    // Constructor để gán tên hiển thị (nếu cần dùng cho giao diện)
    UserRole(String displayName) {
        this.displayName = displayName;
    }
}
