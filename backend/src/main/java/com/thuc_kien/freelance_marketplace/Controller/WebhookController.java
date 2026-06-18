package com.thuc_kien.freelance_marketplace.Controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.thuc_kien.freelance_marketplace.Service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {
    private final OrderService orderService;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload, 
            @RequestHeader("Stripe-Signature") String sigHeader 
    ) {

        Event event = null;
        System.out.println("Robot Stripe đã gõ cửa Endpoint Webhook!");
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            // Nếu chữ ký sai (Hacker giả mạo), lập tức chặn cửa, trả về lỗi 400
            System.out.println("⚠️ Cảnh báo: Phát hiện tin nhắn giả mạo Webhook!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi giải mã Payload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }
        System.out.println("🔍 Gói tin vua vao mang ten la: [" + event.getType() + "]");
        if ("payment_intent.succeeded".equals(event.getType())) {
            System.out.println("🟢 [1] Đã nhảy vào khối payment_intent.succeeded!");
            // Giải nén gói dữ liệu thành Object PaymentIntent
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            PaymentIntent intent = null;
            if (dataObjectDeserializer.getObject().isPresent()) {
                intent = (PaymentIntent) dataObjectDeserializer.getObject().get();
            } else {
                System.out.println("⚠️ Cảnh báo lệch Version: Đang kích hoạt ép kiểu Unsafe!");
                try {
                    intent = (PaymentIntent) dataObjectDeserializer.deserializeUnsafe();
                } catch (com.stripe.exception.EventDataObjectDeserializationException e) {
                    System.out.println("🔴 [LỖI] Quá trình ép kiểu Unsafe thất bại: " + e.getMessage());
                }
            }
            if (intent != null){
                System.out.println("🟢 [2] Toàn bộ Metadata nhận được từ Stripe: " + intent.getMetadata());
                // 3. MÓC ĐƠN HÀNG RA VÀ CẬP NHẬT DATABASE
                // Lấy ra cái order_id mà chúng ta đã giấu ở API số 2
                String orderIdStr = intent.getMetadata().get("order_id");
                System.out.println("🟢 [3] Giá trị orderIdStr lấy ra được là: " + orderIdStr);
                if (orderIdStr != null) {
                    try {
                        Long orderId = Long.parseLong(orderIdStr);
                        System.out.println("🟢 [4] Chuẩn bị gọi Service cập nhật đơn: " + orderId);
                        orderService.updateOrderStatus(orderId,"IN_PROGRESS");
                        
                        System.out.println("✅ Webhook đã xử lý xong. Tiền đã vào hệ thống: " + orderId);
                    }
                    catch (Exception e){
                        System.out.println("🔴 [LỖI] Service updateOrderStatus đã bị sập: " + e.getMessage());
                        e.printStackTrace();
                    }
                    
                } else {
                    System.out.println("🔴 [LỖI] Metadata không chứa 'order_id'. Bị rớt từ API tạo Intent!");
                }
            }
        }
        return ResponseEntity.ok("Received");
    }
}
