package com.thuc_kien.freelance_marketplace.Components;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.thuc_kien.freelance_marketplace.DTO.OrderStatus;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Entity.Payment;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;
import com.thuc_kien.freelance_marketplace.Repository.PaymentRepository;
import com.thuc_kien.freelance_marketplace.Service.PaymentService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@Component
public class OrderDeadlineScheduler {
    private final OrderRepository orderRepo;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepo;

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
        if (!overdueOrders.isEmpty())
            orderRepo.saveAll(overdueOrders);

        // --- BƯỚC 2: XỬ LÝ TRỄ HẠN MỨC 2 (VERY LATE) ---
        // Tìm các đơn đã LATE mà giờ hiện tại vượt qua (deliveryDate + 24 tiếng)
        LocalDateTime twentyFourHoursAgo = now.minusHours(24);
        List<Orders> veryLateOrders = orderRepo.findByStatusAndDeliveryDateBefore(OrderStatus.LATE.name(),
                twentyFourHoursAgo);

        for (Orders order : veryLateOrders) {
            order.setStatus(OrderStatus.VERY_LATE.name());
            System.out.println("[CRON] Đơn hàng #" + order.getId() + " đã chuyển sang VERY_LATE.");
            // TODO: Bắn thông báo cho Buyer: "Seller lặn mất tăm, bạn có muốn hủy đơn
            // không?"
        }
        if (!veryLateOrders.isEmpty())
            orderRepo.saveAll(veryLateOrders);
    }

    @Scheduled(cron = "0 0 * * * *") // Vẫn chạy mỗi giờ 1 lần
    @Transactional
    public void processAbandonedRequirements() {
        // Mốc thời gian giới hạn: 7 ngày trước so với thời điểm hiện tại
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        List<Orders> abandonedOrders = orderRepo.findAbandonedOrders(sevenDaysAgo);

        for (Orders order : abandonedOrders) {
            // 1. Chuyển trạng thái đơn hàng
            order.setStatus(OrderStatus.CANCELED.name());
            System.out.printf("[CRON] Hủy tự động đơn hàng #{} do khách không nộp Requirement quá 1 ngày.", order.getId());

            // 2. Thực hiện hoàn tiền qua Stripe
            if (order.getStripePaymentIntentId() != null && order.getTotalAmount() != null) {
                String refundId = paymentService.processRefund(order.getStripePaymentIntentId(),
                        order.getTotalAmount());

                // 3. Ghi log lịch sử hoàn tiền
                Payment refundRecord = Payment.builder()
                        .order(order)
                        .user(order.getBuyer())
                        .paymentType("REFUND")
                        .amount(order.getTotalAmount())
                        .currency("USD")
                        .paymentMethod("STRIPE")
                        .status("SUCCESS")
                        .transactionId(refundId)
                        .description("Hoàn tiền tự động do không nộp yêu cầu sau 7 ngày")
                        .build();

                paymentRepo.save(refundRecord);
            }

            // TODO: Bắn thông báo hoặc Email cho Buyer biết tiền đã được trả lại
        }

        if (!abandonedOrders.isEmpty()) {
            orderRepo.saveAll(abandonedOrders);
        }
    }
}
