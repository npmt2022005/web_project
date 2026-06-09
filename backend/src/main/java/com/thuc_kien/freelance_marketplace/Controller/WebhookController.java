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
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            // Nếu chữ ký sai (Hacker giả mạo), lập tức chặn cửa, trả về lỗi 400
            System.out.println("⚠️ Cảnh báo: Phát hiện tin nhắn giả mạo Webhook!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        if ("payment_intent.succeeded".equals(event.getType())) {
            System.out.println("Đã nhận được Webhook từ Stripe!"); 
            // Giải nén gói dữ liệu thành Object PaymentIntent
            EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isPresent()) {
                PaymentIntent intent = (PaymentIntent) dataObjectDeserializer.getObject().get();

                // 3. MÓC ĐƠN HÀNG RA VÀ CẬP NHẬT DATABASE
                // Lấy ra cái order_id mà chúng ta đã giấu ở API số 2
                String orderIdStr = intent.getMetadata().get("order_id");
                
                if (orderIdStr != null) {
                    Long orderId = Long.parseLong(orderIdStr);
                    
                    orderService.updateOrderStatus(orderId,"PAID");
                    
                    System.out.println("✅ Webhook đã xử lý xong. Tiền đã vào hệ thống: " + orderId);
                }
            }
        }
        return ResponseEntity.ok("Received");
    }

}
