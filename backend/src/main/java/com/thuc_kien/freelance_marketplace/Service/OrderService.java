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

import com.thuc_kien.freelance_marketplace.DTO.BuyerDeliveryViewResponse;
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
import com.thuc_kien.freelance_marketplace.DTO.SellerRevisionViewResponse;
import com.thuc_kien.freelance_marketplace.Entity.Gig;
import com.thuc_kien.freelance_marketplace.Entity.GigPackages;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Entity.Payment;
import com.thuc_kien.freelance_marketplace.Entity.Review;
import com.thuc_kien.freelance_marketplace.Entity.Seller;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Entity.Wallet;
import com.thuc_kien.freelance_marketplace.Entity.WalletTransaction;
import com.thuc_kien.freelance_marketplace.Repository.GigRepository;
import com.thuc_kien.freelance_marketplace.Repository.GigsPackagesRepository;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;
import com.thuc_kien.freelance_marketplace.Repository.PaymentRepository;
import com.thuc_kien.freelance_marketplace.Repository.ReviewRepository;
import com.thuc_kien.freelance_marketplace.Repository.SellerRepository;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;
import com.thuc_kien.freelance_marketplace.Repository.WalletRepository;
import com.thuc_kien.freelance_marketplace.Repository.WalletTransactionRepository;
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
    private final PaymentRepository paymentRepo;
    private final WalletRepository walletRepo;
    private final WalletTransactionRepository walletTxRepo;

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
                .status("AWAITING_REQUIREMENT")
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
                .inspectionDeadline(order.getInspectionDeadline())
                .revisionCount(order.getRevisionCount() != null ? order.getRevisionCount() : 0)
                .requirementText(order.getRequirementText())
                .attachedFiles(order.getAttachedFiles())
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

        // 3. Chỉ cho phép buyer nộp requirement khi đơn hàng đã ở trạng thái AWAITING
        if (!OrderStatus.AWAITING_REQUIREMENT.name().equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái AWAITING_REQUIREMENT trước khi nộp requirement.");
        }

        order.setRequirementText(request.getRequirementText());
        if (request.getAttachedFiles() != null) {
            order.setAttachedFiles(request.getAttachedFiles()); //
        }

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

        // Kiểm tra xem ít nhất một trong hai thông tin bàn giao phải được cung cấp
        if ((request.getSubmissionLink() == null || request.getSubmissionLink().isBlank()) &&
                (request.getFile() == null || request.getFile().isEmpty())) {
            throw new RuntimeException("Bạn phải cung cấp ít nhất một tệp tin hoặc đường dẫn sản phẩm.");
        }

        // Lưu link thủ công
        order.setSubmissionLink(request.getSubmissionLink());

        // Xử lý upload file nếu có
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            try {
                String fileUrl = fileUploadService.uploadFile(request.getFile(), "orders");
                order.setSubmissionFileUrl(fileUrl);
            } catch (IOException e) {
                throw new RuntimeException("Đã xảy ra lỗi hệ thống khi tải file của bạn lên. Vui lòng thử lại sau!", e);
            }
        }

        order.setStatus(OrderStatus.DELIVERED.name());
        order.setSubmissionNote(request.getNote());
        order.setActualDeliveryDate(java.time.LocalDateTime.now());
        order.setInspectionDeadline(LocalDateTime.now().plusDays(3));
        return orderRepo.save(order);
    }

    @Transactional
    public Orders cancelLateOrder(Long orderId, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng: " + orderId));
        User buyer = order.getBuyer();
        if (!order.getBuyer().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này!");
        }

        if (!order.getStatus().equals(OrderStatus.LATE.name()) &&
                !order.getStatus().equals(OrderStatus.VERY_LATE.name())) {
            throw new RuntimeException("Bạn chỉ được phép hủy khi Seller giao hàng trễ hạn.");
        }

        order.setStatus(OrderStatus.CANCELED.name());

        String paymentIntentId = order.getStripePaymentIntentId();
        BigDecimal refundAmount = order.getTotalAmount();
        if (paymentIntentId != null && !paymentIntentId.isEmpty() && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            String stripeRefundId = paymentService.processRefund(paymentIntentId, refundAmount);

            Payment refundRecord = Payment.builder()
                    .order(order)
                    .user(buyer)
                    .paymentType("REFUND")
                    .amount(refundAmount)
                    .currency("USD") // Cứng hoặc lấy từ order.getCurrency() nếu hệ thống bạn có đa tiền tệ
                    .paymentMethod("STRIPE")
                    .status("SUCCESS")
                    .transactionId(stripeRefundId)
                    .description("Hoàn tiền vào thẻ do hủy đơn hàng trễ hạn #" + order.getId())
                    .build();

            paymentRepo.save(refundRecord);
        } else {
            throw new RuntimeException("Lỗi hệ thống: Không tìm thấy mã giao dịch thanh toán gốc của đơn hàng này.");
        }

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
        Gig gig = order.getGig();
        gig.setSalesCount(gig.getSalesCount() + 1);
        gigRepo.save(gig);
        order.setInspectionDeadline(null);

        Review review = new Review();
        review.setReviewer(order.getBuyer());

        Seller targetSeller = order.getGig().getSeller();
        review.setSeller(targetSeller);
        review.setRating(request.getRating());
        review.setComment(request.getReviewComment());
        review.setOrder(order); 
        reviewRepo.save(review);

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

        // ==========================================
        // PHẦN 4: LOGIC CHUYỂN TIỀN
        // ==========================================
        BigDecimal totalAmount = order.getTotalAmount();
        BigDecimal platformFeePercent = new BigDecimal("0.10");
        BigDecimal platformFee = totalAmount.multiply(platformFeePercent);
        BigDecimal sellerEarnings = totalAmount.subtract(platformFee);
        User sellerUser = targetSeller.getUser();
        Wallet sellerWallet = walletRepo.findByUserId(sellerUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người bán trong hệ thống."));
        if (!"ACTIVE".equalsIgnoreCase(sellerWallet.getStatus())) {
            throw new RuntimeException("Ví của người bán đang bị đóng băng, không thể nhận tiền.");
        }
        sellerWallet.setBalance(sellerWallet.getBalance().add(sellerEarnings));
        walletRepo.save(sellerWallet);

        // 4.2 BỔ SUNG: Ghi nhận Lịch sử giao dịch (Bắt buộc phải có để đối soát)
        WalletTransaction transactionLog = new WalletTransaction();
        transactionLog.setWallet(sellerWallet);
        transactionLog.setOrderId(order.getId());
        transactionLog.setAmount(sellerEarnings);
        transactionLog.setType("EARNING");
        transactionLog.setDescription("Nhận tiền từ việc hoàn thành đơn hàng #" + order.getId());
        walletTxRepo.save(transactionLog);

        // 5. GỌI STRIPE API: Thực hiện chuyển tiền thật từ ví tổng của sàn sang Stripe
        // Connected Account của Seller
        if (sellerWallet.getStripeAccountId() != null && !sellerWallet.getStripeAccountId().trim().isEmpty()) {
            try {
                // Tiến hành chuyển tiền thật qua Stripe
                paymentService.transferToSeller(
                        sellerWallet.getStripeAccountId(),
                        sellerEarnings,
                        sellerWallet.getCurrency(),
                        order.getId());
            } catch (Exception e) {
                System.err.println(
                        "Cảnh báo: Stripe Transfer thất bại (có thể do thiếu số dư tài khoản sàn): " + e.getMessage());
            }
        } else {
            System.out.println(
                    "Cảnh báo: Người bán chưa liên kết tài khoản Stripe Connect trên ví. Tiền giữ lại ở Ví nội bộ.");
        }
        return orderRepo.save(order);
    }

    // @Transactional
    // public Orders rejectOrder(Long orderId, Long currentUserId) {
    // Orders order = orderRepo.findById(orderId)
    // .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với
    // ID: " + orderId));

    // // 1. Phân quyền: Xác định ai đang gọi API (Buyer hay Seller)
    // boolean isBuyer = order.getBuyer() != null &&
    // order.getBuyer().getId().equals(currentUserId);
    // boolean isSeller =
    // order.getGig().getSeller().getUser().getId().equals(currentUserId);

    // if (!isBuyer && !isSeller) {
    // throw new RuntimeException("Bạn không có quyền từ chối hoặc hủy đơn hàng
    // này!");
    // }

    // // 2. Chặn logic: Không thể hủy nếu đơn đã hoàn tất (COMPLETED) hoặc đã bị
    // hủy
    // // trước đó (CANCELLED)
    // String currentStatus = order.getStatus();
    // if ("COMPLETED".equalsIgnoreCase(currentStatus) ||
    // "CANCELLED".equalsIgnoreCase(currentStatus)) {
    // throw new RuntimeException("Không thể thực hiện thao tác trên đơn hàng đã
    // hoàn tất hoặc đã bị hủy.");
    // }

    // order.setStatus("CANCELLED");

    // return orderRepo.save(order);
    // }

    // BUYER yeu cau chinh sua
    @Transactional
    public Orders requestRevision(Long orderId, RevisionOrderRequest request, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (order.getBuyer() == null || !order.getBuyer().getId().equals(currentUserId)) {
            throw new RuntimeException("Từ chối truy cập: Chỉ người mua mới có quyền yêu cầu chỉnh sửa.");
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Bạn chỉ có thể yêu cầu chỉnh sửa khi người bán đã nộp sản phẩm.");
        }

        GigPackages selectedPackage = pkgRepo.findById(order.getPackageId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ của đơn hàng này."));
        int maxRevisionsAllowed = selectedPackage.getRevisions() != null ? selectedPackage.getRevisions() : 0;
        int currentRevisions = order.getRevisionCount() != null ? order.getRevisionCount() : 0;

        if (currentRevisions >= maxRevisionsAllowed) {
            throw new RuntimeException(
                    "Bạn đã hết lượt yêu cầu chỉnh sửa miễn phí. Vui lòng bấm 'Chấp nhận' hoặc thỏa thuận thêm với người bán.");
        }

        order.setRevisionCount(currentRevisions + 1);
        order.setRevisionNote(request.getRevisionNote());
        order.setRevisionFileUrl(request.getRevisionFileUrl());
        order.setStatus("IN_PROGRESS");

        order.setInspectionDeadline(null);

        if (order.getDeliveryDate() != null) {
            order.setDeliveryDate(order.getDeliveryDate().plusDays(1));
        }

        return orderRepo.save(order);
    }

    public SellerRevisionViewResponse getSellerRevisionDetails(Long orderId, Long currentSellerId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Kiểm tra quyền: Đảm bảo đúng Seller của đơn hàng này mới được xem
        if (order.getGig() == null || !order.getGig().getSeller().getUser().getId().equals(currentSellerId)) {
            throw new RuntimeException("Bạn không có quyền xem thông tin đơn hàng này.");
        }

        // Đóng gói dữ liệu trả về cho giao diện Seller
        SellerRevisionViewResponse response = new SellerRevisionViewResponse();
        response.setOrderId(order.getId());
        response.setStatus(order.getStatus());

        // Nếu trạng thái là IN_PROGRESS (tức là đã bị trả về để sửa), lấy thêm note sửa
        // của Buyer
        if ("IN_PROGRESS".equalsIgnoreCase(order.getStatus()) && order.getRevisionNote() != null) {
            response.setRevisionNote(order.getRevisionNote());
            response.setRevisionFileUrl(order.getRevisionFileUrl());
        }

        return response;
    }

    public BuyerDeliveryViewResponse getDeliveryDetailsForBuyer(Long orderId, Long currentUserId) {
        Orders order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // 1. Kiểm tra quyền: Cho phép cả Buyer và Seller của đơn hàng này xem thông tin
        // bàn giao
        boolean isBuyer = order.getBuyer() != null && order.getBuyer().getId().equals(currentUserId);
        boolean isSeller = order.getGig() != null &&
                order.getGig().getSeller().getUser().getId().equals(currentUserId);

        if (!isBuyer && !isSeller) {
            throw new RuntimeException("Từ chối truy cập: Bạn không có quyền xem thông tin bàn giao này.");
        }

        // 2. Đóng gói dữ liệu
        BuyerDeliveryViewResponse response = new BuyerDeliveryViewResponse();
        response.setOrderId(order.getId());
        response.setStatus(order.getStatus());
        response.setSubmissionLink(order.getSubmissionLink());
        response.setSubmissionFileUrl(order.getSubmissionFileUrl());
        response.setSubmissionNote(order.getSubmissionNote());
        response.setInspectionDeadline(order.getInspectionDeadline());
        response.setRevisionCount(order.getRevisionCount() != null ? order.getRevisionCount() : 0);

        // Lấy số lượt sửa tối đa từ gói dịch vụ để Frontend chặn nút bấm nếu hết lượt
        GigPackages pkg = pkgRepo.findById(order.getPackageId()).orElse(null);
        response.setMaxRevisionsAllowed(pkg != null && pkg.getRevisions() != null ? pkg.getRevisions() : 0);

        return response;
    }

    /**
     * Logic tự động hoàn thành đơn hàng khi hết hạn nghiệm thu (Inspection
     * Deadline).
     * Phương thức này nên được gọi bởi một @Scheduled task trong Spring Boot.
     */
    @Transactional
    public void autoCompleteExpiredOrders() {
        LocalDateTime now = LocalDateTime.now();
        // Tìm các đơn hàng DELIVERED đã quá hạn nghiệm thu
        List<Orders> expiredOrders = orderRepo.findAll().stream()
                .filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus())
                        && o.getInspectionDeadline() != null
                        && o.getInspectionDeadline().isBefore(now))
                .collect(Collectors.toList());

        for (Orders order : expiredOrders) {
            try {
                // Tái sử dụng logic thanh toán và hoàn thành nhưng không cần Review
                order.setStatus("COMPLETED");
                Gig gig = order.getGig();
                gig.setSalesCount(gig.getSalesCount() + 1); // Tăng số lượng bán
                gigRepo.save(gig); // Lưu lại Gig đã cập nhật
                order.setInspectionDeadline(null);

                // Logic cộng tiền cho Seller tương tự như hàm completeOrder
                BigDecimal platformFee = order.getTotalAmount().multiply(new BigDecimal("0.10"));
                BigDecimal sellerEarnings = order.getTotalAmount().subtract(platformFee);

                Wallet wallet = walletRepo.findByUserId(order.getSeller().getUser().getId()).orElse(null);
                if (wallet != null && "ACTIVE".equalsIgnoreCase(wallet.getStatus())) {
                    wallet.setBalance(wallet.getBalance().add(sellerEarnings));
                    walletRepo.save(wallet);
                    orderRepo.save(order);
                }
            } catch (Exception e) {
                System.err.println("Lỗi tự động hoàn thành đơn #" + order.getId() + ": " + e.getMessage());
            }
        }
    }
}
