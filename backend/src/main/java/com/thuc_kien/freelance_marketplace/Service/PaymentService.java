package com.thuc_kien.freelance_marketplace.Service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.thuc_kien.freelance_marketplace.DTO.PaymentIntentRequest;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final  OrderRepository orderRepo;

    @Value("${stripe.api.secretKey}")
    private String stripeSecretkey;
    
    @Transactional
    public String createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        // 1. Khởi tạo khóa bảo mật
        Stripe.apiKey = stripeSecretkey;

        Orders order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Cảnh báo: Không tìm thấy đơn hàng mã " + request.getOrderId()));

        // 3. Quy đổi tiền tệ (Nhân với 100 để chuyển USD sang Cents)
        // Ví dụ: 72.08 * 100 = 7208
        long amountInCents = order.getTotalAmount().multiply(new BigDecimal("100")).longValue();

        // 4. Tạo gói dữ liệu (Params) gửi sang Stripe
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putMetadata("order_id", order.getId().toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();

        // 5. Gửi request sang máy chủ Stripe
        PaymentIntent intent = PaymentIntent.create(params);

        // 6. (Nâng cao) Lưu mã giao dịch của Stripe vào Database để dễ đối soát sau này
        // Giả sử trong Entity Orders bạn có trường stripePaymentIntentId
        // order.setStripePaymentIntentId(intent.getId()); // Lưu mã dạng pi_3Mtw...
        // ordersRepository.save(order);

        // 7. Trả về mã client_secret cho Frontend
        return intent.getClientSecret();
    }
}

