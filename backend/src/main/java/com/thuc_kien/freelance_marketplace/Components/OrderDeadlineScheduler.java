package com.thuc_kien.freelance_marketplace.Components;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.thuc_kien.freelance_marketplace.DTO.OrderStatus;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@AllArgsConstructor
@Component
public class OrderDeadlineScheduler {
    private final OrderRepository orderRepo;

    @Scheduled(cron = "0 0 * * * *") 
    @Transactional
    public void processOverdueOrders() {
        LocalDateTime now = LocalDateTime.now();

        // Tìm các đơn đang IN_PROGRESS mà giờ hiện tại đã vượt qua deliveryDate
        List<Orders> overdueOrders = orderRepo.findByStatusAndDeliveryDateBefore(OrderStatus.IN_PROGRESS.name(), now);
        
        for (Orders order : overdueOrders) {
            order.setStatus(OrderStatus.LATE.name());
            System.out.println("[CRON] Đơn hàng #" + order.getId() + " đã chuyển sang LATE.");
            // TODO: Bắn thông báo (Notification) cho Seller: "Bạn đã trễ hạn đơn hàng!" 
        }
        if (!overdueOrders.isEmpty()) orderRepo.saveAll(overdueOrders);

        // --- BƯỚC 2: XỬ LÝ TRỄ HẠN MỨC 2 (VERY LATE) ---
        // Tìm các đơn đã LATE mà giờ hiện tại vượt qua (deliveryDate + 24 tiếng)
        LocalDateTime twentyFourHoursAgo = now.minusHours(24);
        List<Orders> veryLateOrders = orderRepo.findByStatusAndDeliveryDateBefore(OrderStatus.LATE.name(), twentyFourHoursAgo);
        
        for (Orders order : veryLateOrders) {
            order.setStatus(OrderStatus.VERY_LATE.name());
            System.out.println("[CRON] Đơn hàng #" + order.getId() + " đã chuyển sang VERY_LATE.");
            // TODO: Bắn thông báo cho Buyer: "Seller lặn mất tăm, bạn có muốn hủy đơn không?"
        }
        if (!veryLateOrders.isEmpty()) orderRepo.saveAll(veryLateOrders);
    }
}
