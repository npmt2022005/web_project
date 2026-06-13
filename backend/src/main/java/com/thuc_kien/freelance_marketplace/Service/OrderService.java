package com.thuc_kien.freelance_marketplace.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.elasticsearch.ResourceNotFoundException;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;

import com.thuc_kien.freelance_marketplace.DTO.CompleteOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.CreateOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.DeliverOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.GigRequirementResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderListItemDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderStartRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderStatus;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO;
import com.thuc_kien.freelance_marketplace.DTO.UpdateStatusRequest;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO.*;
import com.thuc_kien.freelance_marketplace.DTO.RevisionOrderRequest;
import com.thuc_kien.freelance_marketplace.Entity.Gig;
import com.thuc_kien.freelance_marketplace.Entity.GigPackages;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Entity.Review;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Repository.GigRepository;
import com.thuc_kien.freelance_marketplace.Repository.GigsPackagesRepository;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;
import com.thuc_kien.freelance_marketplace.Repository.ReviewRepository;
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
    private final PaymentService paymentService;
    private final FileUploadService fileUploadService;
    private final ReviewRepository reviewRepo;

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
                .status("PAID")
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
                System.out.println("Người bán đã giao hàng cho đơn: " + orderId);
                break;

            case "COMPLETED":
                System.out.println("Đơn hàng hoàn thành, chuẩn bị cộng tiền cho Seller!");
                break;

            case "CANCELED":
                // Đơn bị hủy -> Có thể cần gọi Stripe API để hoàn tiền (Refund) cho Buyer
                System.out.println("Đơn hàng bị hủy!");
                break;

            default:
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
                .partnerAvatar("")
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

        // 3. Chỉ cho phép buyer nộp requirement khi đơn hàng đã ở trạng thái PAID
        if (!OrderStatus.PAID.name().equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái PAID trước khi nộp requirement.");
        }

        // 4. Lưu câu trả lời và danh sách link vào đơn hàng
        order.setRequirementText(request.getRequirementText());
        if (request.getAttachedFiles() != null) {
            order.setAttachedFiles(request.getAttachedFiles()); // JPA sẽ tự động chèn vào bảng phụ order_attachments
        }

        // 5. Cập nhật trạng thái đơn thành PENDING sau khi buyer đã nộp requirement
        order.setStatus(OrderStatus.PENDING.name());
        order.setDeliveryDate(null);

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
                    .orElse(order.getGig().getDeliveryTime()); // Fallback: Nếu không tìm thấy, lấy thời gian mặc định
                                                               // của Gig
        }
        if (order.getGig() != null && order.getGig().getDeliveryTime() != null) {
            return order.getGig().getDeliveryTime();
        }
        return 3;
    }

    @Transactional
    public Orders updateOrderStatus(Long orderId, UpdateStatusRequest request, Long currentUserId) {
        // 1. Tìm đơn hàng
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // 2. Bảo mật: Kiểm tra xem User hiện tại có phải là Seller của đơn hàng này
        // không
        if (!order.getGig().getSeller().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền xử lý đơn hàng này!");
        }

        if (!OrderStatus.PENDING.name().equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng này đã được xử lý trước đó rồi.");
        }

        OrderStatus newStatus = request.getStatus();
        if (newStatus != OrderStatus.ACCEPTED && newStatus != OrderStatus.REJECTED) {
            throw new RuntimeException("Hành động không hợp lệ. Bạn chỉ có thể ACCEPTED hoặc REJECTED.");
        }

        if (newStatus == OrderStatus.ACCEPTED && order.getDeliveryDate() == null) {
            int deliveryDays = getDeliveryDaysFromOrder(order);
            order.setDeliveryDate(java.time.LocalDateTime.now().plusDays(deliveryDays));
        }

        if (newStatus == OrderStatus.ACCEPTED) {
            order.setStatus(OrderStatus.IN_PROGRESS.name()); // Thành công -> Đang chờ làm (Pending)
        } else if (newStatus == OrderStatus.REJECTED) {
            order.setStatus(OrderStatus.CANCELED.name()); // Từ chối -> Hủy luôn (Canceled)
        }
        return orderRepo.save(order);
    }

    @Transactional
    public Orders deliverOrder(Long orderId, DeliverOrderRequest request, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getGig().getSeller().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền giao sản phẩm cho đơn hàng này!");
        }

        if (!"IN_PROGRESS".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái đang thực hiện mới có thể giao hàng.");
        }
        String finalLink = request.getSubmissionLink();
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            try {
                finalLink = fileUploadService.uploadFile(request.getFile(), "orders");
            } catch (IOException e) {
                throw new RuntimeException("Đã xảy ra lỗi hệ thống khi tải file của bạn lên. Vui lòng thử lại sau!", e);
            }
        }
        if (finalLink == null || finalLink.trim().isEmpty()) {
            throw new RuntimeException("Bạn phải upload file hoặc cung cấp link sản phẩm!");
        }

        order.setStatus(OrderStatus.DELIVERED.name());
        order.setSubmissionLink(finalLink);
        order.setSubmissionNote(request.getNote());
        order.setActualDeliveryDate(java.time.LocalDateTime.now());

        return orderRepo.save(order);
    }

    @Transactional
    public Orders cancelLateOrder(Long orderId, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng: " + orderId));

        // 1. Kiểm tra quyền: Chỉ Buyer của đơn này mới được hủy
        if (!order.getBuyer().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này!");
        }

        // 2. Chặn điều kiện: Chỉ cho phép Buyer chủ động hủy khi đơn hàng đã LATE hoặc
        // VERY_LATE
        if (!order.getStatus().equals(OrderStatus.LATE.name()) &&
                !order.getStatus().equals(OrderStatus.VERY_LATE.name())) {
            throw new RuntimeException("Bạn chỉ được phép hủy khi Seller giao hàng trễ hạn.");
        }

        // 3. Xử lý hủy
        order.setStatus(OrderStatus.CANCELED.name());

        // TODO: Gọi logic hoàn tiền (Refund) về ví cho Buyer tại đây nếu có

        return orderRepo.save(order);
    }

    @Transactional
    public Orders completeOrder(Long orderId, CompleteOrderRequest request, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (order.getBuyer() == null || !order.getBuyer().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền nghiệm thu đơn hàng này!");
        }

        // 2. Kiểm tra trạng thái: Phải đang ở DELIVERED
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể nghiệm thu khi người bán đã giao hàng.");
        }

        // 3. Cập nhật trạng thái và lưu đánh giá
        order.setStatus("COMPLETED");
        Review review = new Review();
        review.setReviewer(order.getBuyer());

        Seller targetSeller = order.getGig().getSeller();
        review.setSeller(targetSeller);
        review.setRating(request.getRating());
        review.setComment(request.getReviewComment());
        reviewRepo.save(review);

        Gig gig = order.getGig();
        Long gigId = gig.getId();

        Double rawGigAvg = reviewRepo.calculateAverageRatingByGig(gigId);
        Integer totalGigReviews = reviewRepo.countReviewsByGig(gigId);

        if (rawGigAvg != null) {
            // Làm tròn đến 1 chữ số thập phân (Ví dụ: 4.6666 -> 4.7)
            double roundedGigAvg = Math.round(rawGigAvg * 10.0) / 10.0;
            gig.setRatingAvg(roundedGigAvg);
            gig.setTotalReviews(totalGigReviews);
            gigRepo.save(gig);
        }

        // Cap nhat seller
        Long sellerId = targetSeller.getId();
        Double rawSellerAvg = reviewRepo.calculateAverageRatingBySeller(sellerId);
        Integer totalSellerReviews = reviewRepo.countReviewsBySeller(sellerId);

        if (rawSellerAvg != null) {
            double roundedSellerAvg = Math.round(rawSellerAvg * 10.0) / 10.0;

            targetSeller.setRatingAvg(roundedSellerAvg);
            targetSeller.setTotalReviews(totalSellerReviews);
            sellerRepo.save(targetSeller);
        }
        return orderRepo.save(order);
    }

    @Transactional
    public Orders rejectOrder(Long orderId, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // 1. Phân quyền: Xác định ai đang gọi API (Buyer hay Seller)
        boolean isBuyer = order.getBuyer() != null && order.getBuyer().getId().equals(currentUserId);
        boolean isSeller = order.getGig().getSeller().getUser().getId().equals(currentUserId);

        if (!isBuyer && !isSeller) {
            throw new RuntimeException("Bạn không có quyền từ chối hoặc hủy đơn hàng này!");
        }

        // 2. Chặn logic: Không thể hủy nếu đơn đã hoàn tất (COMPLETED) hoặc đã bị hủy
        // trước đó (CANCELLED)
        String currentStatus = order.getStatus();
        if ("COMPLETED".equalsIgnoreCase(currentStatus) || "CANCELLED".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("Không thể thực hiện thao tác trên đơn hàng đã hoàn tất hoặc đã bị hủy.");
        }

        // 3. Cập nhật trạng thái
        order.setStatus("CANCELLED");

        return orderRepo.save(order);
    }

    @Transactional
    public Orders refundOrderDueToMissingRequirement(Long orderId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!OrderStatus.PAID.name().equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chỉ đơn hàng đã thanh toán và chưa nộp requirement mới được hoàn tiền.");
        }

        if (order.getStripePaymentIntentId() == null || order.getStripePaymentIntentId().isBlank()) {
            throw new RuntimeException("Đơn hàng không có thông tin Stripe để hoàn tiền.");
        }

        try {
            paymentService.refundPayment(order.getStripePaymentIntentId());
            order.setStatus(OrderStatus.REFUNDED.name());
            return orderRepo.save(order);
        } catch (Exception e) {
            throw new RuntimeException("Hoàn tiền thất bại: " + e.getMessage(), e);
        }
    }

    // @Transactional
    // public Orders requestRevision(Long orderId, RevisionOrderRequest request, Long currentUserId) {
    //     Orders order = orderRepo.findById(orderId)
    //             .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

    //     if (order.getBuyer() == null || !order.getBuyer().getId().equals(currentUserId)) {
    //         throw new RuntimeException("Từ chối truy cập: Chỉ người mua mới có quyền yêu cầu chỉnh sửa.");
    //     }

    //     if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
    //         throw new RuntimeException("Bạn chỉ có thể yêu cầu chỉnh sửa khi người bán đã nộp sản phẩm.");
    //     }

    //     // 3. LOGIC CHỐNG SPAM (Giới hạn số lần sửa)
    //     GigPackages selectedPackage = pkgRepo.findById(order.getPackageId())
    //             .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ của đơn hàng này."));
    //     int maxRevisionsAllowed = selectedPackage.getRevisions() != null ? selectedPackage.getRevisions() : 0;
    //     int currentRevisions = order.getRevisionCount() != null ? order.getRevisionCount() : 0;

    //     if (currentRevisions >= maxRevisionsAllowed) {
    //         throw new RuntimeException(
    //                 "Bạn đã hết lượt yêu cầu chỉnh sửa miễn phí. Vui lòng bấm 'Chấp nhận' hoặc thỏa thuận thêm với người bán.");
    //     }

    //     // Tăng biến đếm số lần đã sửa lên 1
    //     order.setRevisionCount(currentRevisions + 1);

    //     order.setStatus("IN_PROGRESS");

    //     // Ghi lại lời nhắn bắt lỗi của Buyer
    //     // order.setRevisionNote(request.getRevisionNote());

    //     // Xóa file nộp bài cũ đi để ép Seller phải nộp lại file mới
    //     order.setSubmissionLink(null);
    //     order.setSubmissionNote(null);

    //     // (Tùy chọn) Bạn có thể cộng thêm 1-2 ngày vào deliveryDeadline nếu việc sửa
    //     // tốn nhiều thời gian
    //     // order.setDeliveryDate(order.getDeliveryDate().plusDays(1));

    //     return orderRepo.save(order);
    // }

}
