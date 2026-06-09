package com.thuc_kien.freelance_marketplace.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;


import com.thuc_kien.freelance_marketplace.DTO.CreateOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO.*;
import com.thuc_kien.freelance_marketplace.Entity.Gig;
import com.thuc_kien.freelance_marketplace.Entity.GigPackages;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Repository.GigRepository;
import com.thuc_kien.freelance_marketplace.Repository.GigsPackagesRepository;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;
    private final GigRepository gigRepo;
    private final UserRepository userRepo;
    private final SellerRepository sellerRepo;
    private final GigsPackagesRepository pkgRepo;
    @Transactional
    public Long createDraftOrder(CreateOrderRequest request, Long buyerId){
        
        Gig gig = gigRepo.findById(request.getGigId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Gig với ID " + request.getGigId()));
        User buyer = userRepo.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Người mua với ID " + buyerId));
        Seller seller = sellerRepo.findById(gig.getSeller().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Người bán"));
        GigPackages selectedPackage = gig.getPackages().stream()
                            .filter(p -> p.getName().equalsIgnoreCase(request.getPackageType()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Lỗi: Bài Gig này không có gói nào tên là " + request.getPackageType()));
        BigDecimal packagePrice = selectedPackage.getPrice();
        BigDecimal serviceFee = packagePrice.multiply(new BigDecimal("0.10"));
        BigDecimal totalAmount = packagePrice.add(serviceFee);
        Orders draftOther = Orders.builder()
                        .gig(gig)
                        .seller(seller)
                        .buyer(buyer)     
                        .packageId(selectedPackage.getId())
                        .status("PENDING")      
                        .gigPrice(packagePrice)
                        .serviceFee(serviceFee)
                        .totalAmount(totalAmount)
                        .build();
        
        Orders saveOrders = orderRepo.save(draftOther);
        return saveOrders.getId();
    }
    public void updateOrderStatus(Long orderId, String newStatus){
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy đơn hàng mã " + orderId));
        if (order.getStatus().equals("CANCELED")) {
            throw new RuntimeException("Đơn hàng đã bị hủy, không thể thay đổi trạng thái!");
        }
        switch (newStatus.toUpperCase()) {
            case "PAID":
                if (order.getDeliveryDate() == null) {
                    GigPackages pkg = pkgRepo.findById(order.getPackageId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ"));
                        
                    int deliveryDays = pkg.getDeliveryDays(); 
                    LocalDateTime deadline = LocalDateTime.now().plusDays(deliveryDays);
                    order.setDeliveryDate(deadline);
                }
                break;

            case "DELIVERED":
                // Người bán đã nộp sản phẩm -> Bạn có thể lưu vết thời gian nộp bài thực tế ở đây nếu có cột delivered_at
                System.out.println("Người bán đã giao hàng cho đơn: " + orderId);
                break;

            case "COMPLETED":
                // Người mua bấm "Chấp nhận sản phẩm" -> Đơn hoàn thành
                // Thường ở đây sẽ có logic gọi qua WalletService để cộng tiền cho Người bán
                System.out.println("Đơn hàng hoàn thành, chuẩn bị cộng tiền cho Seller!");
                break;

            case "CANCELED":
                // Đơn bị hủy -> Có thể cần gọi Stripe API để hoàn tiền (Refund) cho Buyer
                System.out.println("Đơn hàng bị hủy!");
                break;

            default:
                // Các trạng thái khác (như IN_PROGRESS, LATE...) không cần xử lý đặc biệt
                break;
        }

    }
    @Transactional
    public OrderSummaryDTO getOrderSummary(Long orderId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy đơn hàng với ID " + orderId));
        Gig gig = order.getGig();
        Seller seller = order.getSeller();
        GigPackages selectedPackage = gig.getPackages().stream()
                .filter(p -> p.getId().equals(order.getPackageId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy gói dịch vụ tương ứng với đơn hàng"));

        GigSummary gigSummary = GigSummary.builder()
                .title(gig.getTitle())
                .thumbnailUrl(gig.getThumbnailUrl()) 
                .sellerName(seller.getUser().getFullname()) 
                .build();
        PaymentSummary paymentSummary = PaymentSummary.builder()
                .selectedPackage(selectedPackage.getName()) 
                .gigPrice(order.getGigPrice())
                .serviceFee(order.getServiceFee())
                .totalAmount(order.getTotalAmount())
                .currency("USD")
                .build();

        return OrderSummaryDTO.builder()
                .orderId(order.getId())
                .gig(gigSummary)
                .paymentDetails(paymentSummary)
                .build();

    }
}
