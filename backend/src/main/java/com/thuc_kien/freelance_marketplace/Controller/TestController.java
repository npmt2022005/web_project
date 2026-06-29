package com.thuc_kien.freelance_marketplace.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.thuc_kien.freelance_marketplace.Components.OrderDeadlineScheduler;

import lombok.RequiredArgsConstructor;


@Controller
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/test")
public class TestController {
    private final OrderDeadlineScheduler orderDeadlineScheduler;

    @PostMapping("/run-deadline-bot")
    public ResponseEntity<String> forceRunOverdueScheduler() {
        try {
            // Gọi trực tiếp vào hàm chạy ngầm
            orderDeadlineScheduler.processOverdueOrders();
            
            return ResponseEntity.ok("✅ Đã kích hoạt Bot quét đơn trễ hạn chạy thủ công thành công. Hãy kiểm tra Console Log và Database!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("❌ Lỗi khi chạy Bot: " + e.getMessage());
        }
    }
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
