package com.thuc_kien.freelance_marketplace.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


import com.thuc_kien.freelance_marketplace.DTO.CreateOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.GigRequirementResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderListItemDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderStartRequestDTO;
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
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

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
    public Long createDraftOrder(CreateOrderRequest request, Long buyerId) {

        Gig gig = gigRepo.findById(request.getGigId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Gig với ID " + request.getGigId()));
        User buyer = userRepo.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Người mua với ID " + buyerId));
        Seller seller = sellerRepo.findById(gig.getSeller().getId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Người bán"));
        GigPackages selectedPackage = gig.getPackages().stream()
                .filter(p -> p.getName().equalsIgnoreCase(request.getPackageType()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "Lỗi: Bài Gig này không có gói nào tên là " + request.getPackageType()));
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

    @Transactional
    public void updateOrderStatus(Long orderId, String newStatus) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy đơn hàng mã " + orderId));
        if (order.getStatus().equals("CANCELED")) {
            throw new RuntimeException("Đơn hàng đã bị hủy, không thể thay đổi trạng thái!");
        }
        switch (newStatus.toUpperCase()) {
            case "IN_PROGRESS":
                if (order.getDeliveryDate() == null) {
                    GigPackages pkg = pkgRepo.findById(order.getPackageId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ"));

                    int deliveryDays = pkg.getDeliveryDays();
                    LocalDateTime deadline = LocalDateTime.now().plusDays(deliveryDays);
                    order.setDeliveryDate(deadline);
                }
                break;

            case "DELIVERED":
                // Người bán đã nộp sản phẩm -> Bạn có thể lưu vết thời gian nộp bài thực tế ở
                // đây nếu có cột delivered_at
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
        order.setStatus(newStatus.toUpperCase());
        orderRepo.save(order);

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

    public List<OrderListItemDTO> getOrdersForRole(Long currentUserId, String role, String statusFilter) {
        String normalizedRole = (role == null || role.isBlank()) ? "BUYER" : role.toUpperCase();
        boolean hasStatusFilter = (statusFilter != null && !statusFilter.isBlank());
        List<String> allowedStatuses = hasStatusFilter ? normalizeStatusFilter(statusFilter) : List.of();
        List<Orders> orders = orderRepo.findOrdersOptimized(
                currentUserId,
                normalizedRole,
                hasStatusFilter,
                allowedStatuses);

        return orders.stream()
                .map(order -> mapToListItem(order, normalizedRole))
                .collect(Collectors.toList());
    }

    private OrderListItemDTO mapToListItem(Orders order, String role) {
        String gigTitle = order.getGig() != null ? order.getGig().getTitle() : null;
        String gigThumbnail = order.getGig() != null ? order.getGig().getThumbnailUrl() : null;
        String buyerName = order.getBuyer() != null ? order.getBuyer().getFullname() : null;
        String sellerName = order.getSeller() != null && order.getSeller().getUser() != null
                ? order.getSeller().getUser().getFullname()
                : null;
        String dynamicPartnerName = role.equals("BUYER") ? sellerName : buyerName;
        String orderId = "ORD-" + order.getId();
        return OrderListItemDTO.builder()
                .orderId(orderId)
                .gigTitle(gigTitle)
                .gigThumbnail(gigThumbnail)
                .partnerName(dynamicPartnerName)
                .buyerName(buyerName)
                .packageSelected(order.getPackageId() != null ? getPackageName(order.getPackageId(), order) : null)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .build();
    }

    private String getPackageName(Long packageId, Orders order) {
        return order.getGig() != null && order.getGig().getPackages() != null
                ? order.getGig().getPackages().stream()
                        .filter(pkg -> pkg.getId().equals(packageId))
                        .findFirst()
                        .map(pkg -> pkg.getName())
                        .orElse(null)
                : null;
    }

    private List<String> normalizeStatusFilter(String statusFilter) {
        String value = statusFilter.trim().toUpperCase();
        switch (value) {
            case "ACTIVE":
                return List.of("PENDING", "IN_PROGRESS", "DELIVERED");
            case "ONGOING":
                return List.of("IN_PROGRESS", "DELIVERED");
            case "PENDING":
                return List.of("PENDING");
            case "COMPLETED":
                return List.of("COMPLETED");
            case "CANCELLED":
                return List.of("CANCELED");
            case "DELIVERED":
                return List.of("DELIVERED");
            default:
                return List.of(value);
        }
    }

    public OrderResponseDTO getOrderDetail(Long orderId, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng #" + orderId));

        boolean isBuyer = order.getBuyer() != null && order.getBuyer().getId().equals(currentUserId);
        boolean isSeller = order.getSeller() != null
                && order.getSeller().getUser() != null
                && order.getSeller().getUser().getId().equals(currentUserId);

        if (!isBuyer && !isSeller) {
            throw new RuntimeException("Từ chối truy cập: Bạn không có quyền xem đơn hàng này.");
        }

        String partnerName = "Ẩn danh";
        if (isBuyer) {
            partnerName = (order.getSeller() != null && order.getSeller().getUser() != null)
                    ? order.getSeller().getUser().getFullname()
                    : "Người bán ẩn danh";
        } else if (isSeller) {
            partnerName = order.getBuyer() != null
                    ? order.getBuyer().getFullname()
                    : "Người mua ẩn danh";
        }

        // 4. Map sang DTO
        return OrderResponseDTO.builder()
                .orderId("ORD-" + order.getId())
                .status(order.getStatus())
                .gigTitle(order.getGig() != null ? order.getGig().getTitle() : "Dịch vụ không xác định")
                .gigDescription(order.getGig() != null ? order.getGig().getDescription() : "")
                .deliveryDeadline(order.getDeliveryDate())
                .partnerAvatar("") // Tạm để trống, sau này nối với link S3/Cloudinary của User
                .partnerName(partnerName)
                .packageSelected(order.getPackageId() != null ? getPackageName(order.getPackageId(), order) : "")
                .createdAt(order.getCreatedAt())
                .totalAmount(order.getTotalAmount())
                .currency("USD")
                .build();
    }
    public List<GigRequirementResponseDTO> getRequirementsForOrder(Long orderId, Long currentUserId) {
        // 1. Tìm đơn hàng
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng #" + orderId));

        // 2. Bảo mật: Chỉ Buyer hoặc Seller của đơn này mới được xem câu hỏi
        boolean isBuyer = order.getBuyer() != null && order.getBuyer().getId().equals(currentUserId);
        boolean isSeller = order.getSeller() != null 
                        && order.getSeller().getUser() != null 
                        && order.getSeller().getUser().getId().equals(currentUserId);

        if (!isBuyer && !isSeller) {
            throw new RuntimeException("Từ chối truy cập: Bạn không có quyền xem yêu cầu của đơn hàng này.");
        }

        // 3. Lấy Gig từ đơn hàng
        Gig gig = order.getGig();
        if (gig == null || gig.getRequirements() == null || gig.getRequirements().isEmpty()) {
            return List.of(); 
        }

        return gig.getRequirements().stream()
                .map(req -> GigRequirementResponseDTO.builder()
                        .question(req.getQuestion())
                        .answerType(req.getAnswerType())
                        .isMandatory(req.getIsMandatory())
                        .build())
                .collect(Collectors.toList());
    }
    @Transactional
    public void startOrder(Long orderId, Long currentUserId, OrderStartRequestDTO request) {
        // 1. Tìm đơn hàng
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng #" + orderId));

        // 2. Bảo mật: Chỉ người Mua (Buyer) của đơn này mới có quyền nộp yêu cầu
        if (order.getBuyer() == null || !order.getBuyer().getId().equals(currentUserId)) {
            throw new RuntimeException("Từ chối truy cập: Bạn không có quyền khởi động đơn hàng này.");
        }

        // 3. Kiểm tra nếu đơn hàng đã bắt đầu rồi thì không cho nhấn lại
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được khởi động từ trước.");
        }

        // 4. Lưu câu trả lời và danh sách link vào đơn hàng
        order.setRequirementText(request.getRequirementText());
        if (request.getAttachedFiles() != null) {
            order.setAttachedFiles(request.getAttachedFiles()); // JPA sẽ tự động chèn vào bảng phụ order_attachments
        }

        // 5. Cập nhật trạng thái và tính toán deadline
        order.setStatus("PENDING");
        int deliveryDays = getDeliveryDaysFromOrder(order); 
        order.setDeliveryDate(java.time.LocalDateTime.now().plusDays(deliveryDays));

        // 6. Lưu xuống Database
        orderRepo.save(order);
    }
    private int getDeliveryDaysFromOrder(Orders order) {
        // 1. Kiểm tra xem đơn hàng và Gig có tồn tại thông tin Package không
        if (order.getPackageId() != null && order.getGig() != null && order.getGig().getPackages() != null) {
            
            // 2. Tìm chính xác gói Package mà khách đã mua
            return order.getGig().getPackages().stream()
                    .filter(pkg -> pkg.getId().equals(order.getPackageId()))
                    .findFirst()
                    .map(pkg -> pkg.getDeliveryDays()) // Rút trích số ngày giao hàng của gói này
                    .orElse(order.getGig().getDeliveryTime()); // Fallback: Nếu không tìm thấy, lấy thời gian mặc định của Gig
        }
        if (order.getGig() != null && order.getGig().getDeliveryTime() != null) {
            return order.getGig().getDeliveryTime();
        }
        return 3; 
    }
}
