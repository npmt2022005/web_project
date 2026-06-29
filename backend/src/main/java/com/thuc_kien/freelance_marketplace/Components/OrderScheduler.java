package com.thuc_kien.freelance_marketplace.Components;

import com.thuc_kien.freelance_marketplace.Service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderScheduler {

    private final OrderService orderService;

    // Chạy mỗi giờ một lần (vào phút thứ 0 của mỗi giờ)
    // Bạn có thể điều chỉnh cron expression theo nhu cầu (ví dụ: mỗi 5 phút, mỗi ngày...)
    @Scheduled(cron = "0 0 * * * *") 
    public void runAutoCompleteExpiredOrders() {
        log.info("Bắt đầu chạy tác vụ tự động hoàn thành đơn hàng quá hạn nghiệm thu...");
        orderService.autoCompleteExpiredOrders();
        log.info("Kết thúc tác vụ tự động hoàn thành đơn hàng quá hạn nghiệm thu.");
    }

    // Đảm bảo Spring Boot kích hoạt tính năng @Scheduled bằng cách thêm @EnableScheduling vào lớp @SpringBootApplication của bạn.
}