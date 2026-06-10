package com.thuc_kien.freelance_marketplace.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.PaymentIntentRequest;
import com.thuc_kien.freelance_marketplace.Service.PaymentService;


import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")

public class PaymentController {
    private final PaymentService paymentService;
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        try {
            String clientSecret = paymentService.createPaymentIntent(request);

            Map<String, Object> data = new HashMap<>();
            data.put("clientSecret", clientSecret);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Tạo Payment Intent thành công");
            response.put("data", data);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Lỗi kết nối cổng thanh toán: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

}
