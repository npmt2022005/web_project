package com.thuc_kien.freelance_marketplace.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PaymentIntentRequest {
    private Long orderId;
    // private String paymentMethod;
}
