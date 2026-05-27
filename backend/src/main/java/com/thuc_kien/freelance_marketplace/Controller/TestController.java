package com.thuc_kien.freelance_marketplace.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


@Controller
@RestController
@RequestMapping("/api/test")
public class TestController {

    // Ai cũng có thể vào nếu đã đăng nhập
    @GetMapping("/common")
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    public String commonAccess() {
        return "Chào mừng! Bạn có quyền BUYER hoặc ADMIN.";
    }

    // Chỉ ADMIN mới có thể vào
    @GetMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminOnly() {
        return "Chỉ ADMIN mới thấy được nội dung bí mật này!";
    }

    // Chỉ USER mới có thể vào
    @GetMapping("/user-only")
    @PreAuthorize("hasRole('BUYER')")
    public String userOnly() {
        return "Đây là khu vực dành riêng cho người dùng thường.";
    }
}
