package com.thuc_kien.freelance_marketplace.DTO;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class OrderSummaryDTO {
    private Long orderId;
    private GigSummary gig;
    private PaymentSummary paymentDetails;

    @Data
    @Builder
    public static class GigSummary {
        private String title;
        private String thumbnailUrl;
        private String sellerName;
    }

    @Data
    @Builder
    public static class PaymentSummary {
        private String selectedPackage;
        private BigDecimal gigPrice;
        private BigDecimal serviceFee;
        private BigDecimal totalAmount;
        private String currency; 
    }
}