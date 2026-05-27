package com.thuc_kien.freelance_marketplace.Components;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.thuc_kien.freelance_marketplace.Service.GigService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSyncRunner {

    private final GigService gigService;

    @EventListener(ApplicationReadyEvent.class)
    public void initElasticsearchData() {
        System.out.println(">>> Bắt đầu tự động đồng bộ dữ liệu sang Elasticsearch...");
        try {
            gigService.syncAllGigsFromMySQLToElastic();
            System.out.println(">>> Đồng bộ hoàn tất. Hệ thống tìm kiếm đã sẵn sàng!");
        } catch (Exception e) {
            System.err.println(">>> [LỖI] Không thể đồng bộ dữ liệu sang Elasticsearch!");
            System.err.println(">>> Lý do lỗi cụ thể: " + e.getMessage());
            e.printStackTrace(); // Dòng này sẽ in ra chính xác lỗi nằm ở đâu cho bạn xem
        }
    }
}