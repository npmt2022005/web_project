package com.thuc_kien.freelance_marketplace.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.thuc_kien.freelance_marketplace.Service.FileUploadService;
import com.thuc_kien.freelance_marketplace.Service.OrderService;
import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.CompleteOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.CreateOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.DeliverOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.GigRequirementResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderListItemDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderStartRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO;
import com.thuc_kien.freelance_marketplace.DTO.RevisionOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.UpdateStatusRequest;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor

public class OrderController {
    private final OrderService orderService;
    private final FileUploadService fileUploadService;

    @PostMapping("")
    public ResponseEntity<APIResponse<Map<String, Object>>> createDraftOrder(
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        APIResponse<Map<String, Object>> apiResponse = new APIResponse<>();

        try {
            Long buyerId = currentUser.getUser().getId();
            Long orderId = orderService.createDraftOrder(request, buyerId);

            Map<String, Object> dataResult = new HashMap<>();
            dataResult.put("orderId", orderId);

            // Đóng gói Response thành công
            apiResponse.setStatus("success");
            apiResponse.setMessage("Tạo đơn hàng nháp thành công");
            apiResponse.setData(dataResult);

            return ResponseEntity.ok(apiResponse);

        } catch (Exception e) {
            apiResponse.setStatus("error");
            apiResponse.setMessage(e.getMessage());
            apiResponse.setData(null);

            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/{orderId}/summary")
    public ResponseEntity<APIResponse<OrderSummaryDTO>> getOrderSummary(@PathVariable Long orderId) {

        APIResponse<OrderSummaryDTO> apiResponse = new APIResponse<>();

        try {
            // Lấy dữ liệu lõi từ Service
            OrderSummaryDTO data = orderService.getOrderSummary(orderId);

            // Lắp ráp vào Generic Response
            apiResponse.setStatus("success");
            apiResponse.setMessage("Lấy thông tin hóa đơn thành công");
            apiResponse.setData(data);

            return ResponseEntity.ok(apiResponse);

        } catch (Exception e) {
            apiResponse.setStatus("error");
            apiResponse.setMessage(e.getMessage());
            apiResponse.setData(null);

            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("")
    public ResponseEntity<APIResponse<List<OrderListItemDTO>>> getOrdersByRole(
            @RequestParam(name = "role", required = false, defaultValue = "BUYER") String role,
            @RequestParam(name = "status", required = false) String status,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        APIResponse<List<OrderListItemDTO>> apiResponse = new APIResponse<>();
        try {
            Long currentUserId = currentUser.getUser().getId();
            List<OrderListItemDTO> orders = orderService.getOrdersForRole(currentUserId, role, status);

            apiResponse.setStatus("success");
            apiResponse.setMessage("Lấy danh sách đơn hàng thành công");
            apiResponse.setData(orders);
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            apiResponse.setStatus("error");
            apiResponse.setMessage(e.getMessage());
            apiResponse.setData(null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<APIResponse<OrderResponseDTO>> getOrderDetail(@PathVariable String orderId) {

        // Lấy ID người dùng từ Token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            Long numericOrderId;
            try {
                String cleanId = orderId.toUpperCase().replace("ORD-", "");
                numericOrderId = Long.parseLong(cleanId);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Mã đơn hàng không hợp lệ. Đúng chuẩn phải là ORD-xxxx");
            }
            // Gọi Service
            OrderResponseDTO detailDTO = orderService.getOrderDetail(numericOrderId, currentUserId);

            return ResponseEntity.ok(
                    APIResponse.<OrderResponseDTO>builder()
                            .status("success")
                            .message("Lấy chi tiết đơn hàng thành công")
                            .data(detailDTO)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<OrderResponseDTO>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @GetMapping("/{orderIdStr}/requirements")
    public ResponseEntity<APIResponse<List<GigRequirementResponseDTO>>> getOrderRequirements(
            @PathVariable String orderIdStr) {

        // Lấy ID người dùng từ Token JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            Long numericOrderId;
            try {
                String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
                numericOrderId = Long.parseLong(cleanId);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Mã đơn hàng không hợp lệ.");
            }

            // Gọi Service lấy danh sách câu hỏi
            List<GigRequirementResponseDTO> requirements = orderService.getRequirementsForOrder(numericOrderId,
                    currentUserId);

            return ResponseEntity.ok(
                    APIResponse.<List<GigRequirementResponseDTO>>builder()
                            .status("success")
                            .message("Lấy danh sách câu hỏi yêu cầu thành công")
                            .data(requirements)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<List<GigRequirementResponseDTO>>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }

    // ====================================================================
    // API: Khách hàng nộp Requirement và chính thức bắt đầu đơn hàng
    // ====================================================================
    @PostMapping("/{orderIdStr}/start")
    public ResponseEntity<APIResponse<Void>> startOrder(
            @PathVariable String orderIdStr,
            @RequestBody OrderStartRequestDTO request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
            Long numericOrderId = Long.parseLong(cleanId);

            orderService.startOrder(numericOrderId, currentUserId, request);

            return ResponseEntity.ok(
                    APIResponse.<Void>builder()
                            .status("success")
                            .message("Nộp yêu cầu thành công. Đơn hàng đã chính thức bắt đầu!")
                            .data(null)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<Void>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @PostMapping("/{orderIdStr}/status")
    public ResponseEntity<APIResponse<Void>> updateOrderStatus(
            @PathVariable String orderIdStr,
            @RequestBody UpdateStatusRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
            Long numericOrderId = Long.parseLong(cleanId);

            orderService.updateOrderStatus(numericOrderId, request, currentUserId);

            return ResponseEntity.ok(
                    APIResponse.<Void>builder()
                            .status("success")
                            .message("Cập nhật trạng thái đơn hàng thành công.")
                            .data(null)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<Void>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @PostMapping("/{orderIdStr}/deliver")
    public ResponseEntity<APIResponse<Void>> deliverOrder(
            @PathVariable String orderIdStr,
            @ModelAttribute DeliverOrderRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
            Long numericOrderId = Long.parseLong(cleanId);

            orderService.deliverOrder(numericOrderId, request, currentUserId);

            return ResponseEntity.ok(
                    APIResponse.<Void>builder()
                            .status("success")
                            .message("Nộp sản phẩm và giao hàng thành công.")
                            .data(null)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<Void>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @PostMapping("/{orderIdStr}/cancel-late")
    public ResponseEntity<APIResponse<Void>> cancelLateOrder(
            @PathVariable String orderIdStr) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
            Long numericOrderId = Long.parseLong(cleanId);

            orderService.cancelLateOrder(numericOrderId, currentUserId);

            return ResponseEntity.ok(
                    APIResponse.<Void>builder()
                            .status("success")
                            .message("Đã hủy đơn hàng trễ hạn. Tiền sẽ được hoàn lại cho bạn.")
                            .data(null)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<Void>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build());
        }
    }

    @PostMapping(value = "/{orderId}/revision", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIResponse<Map<String, Object>>> requestRevision(
            @PathVariable("orderId") String orderIdStr,
            @RequestParam("revisionNote") String revisionNote,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestAttribute("userId") Long currentUserId) {
        try {
            Long numericOrderId;
            try {
                String numericPart = orderIdStr.replace("ORD-", "");
                numericOrderId = Long.parseLong(numericPart);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(
                        new APIResponse<>("error", "Mã đơn hàng không hợp lệ.", null));
            }
            if (revisionNote == null || revisionNote.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new APIResponse<>("error", "Vui lòng nhập nội dung yêu cầu chỉnh sửa chi tiết.", null));
            }

            // 2. Upload file (nếu có)
            String uploadedFileUrl = null;
            if (file != null && !file.isEmpty()) {
                uploadedFileUrl = fileUploadService.uploadFile(file, "revisions");
            }

            // 3. Đóng gói DTO và gọi Service
            RevisionOrderRequest requestDto = new RevisionOrderRequest();
            requestDto.setRevisionNote(revisionNote);
            requestDto.setRevisionFileUrl(uploadedFileUrl);

            Orders updatedOrder = orderService.requestRevision(numericOrderId, requestDto, currentUserId);

            // 4. Lấy dữ liệu trả về cho block 'data'
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", updatedOrder.getId());
            data.put("newStatus", updatedOrder.getStatus());
            data.put("revisionCount", updatedOrder.getRevisionCount());
            data.put("revisionFileUrl", updatedOrder.getRevisionFileUrl());

            // 5. Trả về Response Thành công (HTTP 200)
            return ResponseEntity.ok(
                    new APIResponse<>("success", "Đã gửi yêu cầu chỉnh sửa đến người bán.", data));

        } catch (RuntimeException e) {
            // Bắt lỗi nghiệp vụ (HTTP 400)
            return ResponseEntity.badRequest().body(
                    new APIResponse<>("error", e.getMessage(), null));

        } catch (IOException e) {
            // Bắt lỗi hệ thống khi upload file (HTTP 500)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new APIResponse<>("error", "Đã xảy ra lỗi trong quá trình tải file đính kèm lên máy chủ.", null));
        }
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<APIResponse<Map<String, Object>>> completeOrder(
            @PathVariable("orderId") String orderId,
            @Valid @RequestBody CompleteOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Long numericOrderId;
            try {
                String numericPart = orderId.replace("ORD-", "");
                numericOrderId = Long.parseLong(numericPart);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(
                        new APIResponse<>("error", "Mã đơn hàng không hợp lệ.", null));
            }
            Long currentUserId = userDetails.getUser().getId();
            // Gọi Service để xử lý toàn bộ logic: Chốt đơn, Đánh giá, Cộng tiền, Ghi log,
            // Stripe
            Orders completedOrder = orderService.completeOrder(numericOrderId, request, currentUserId);

            // Gói dữ liệu trả về cho Frontend
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", completedOrder.getId());
            data.put("newStatus", completedOrder.getStatus());
            data.put("totalAmount", completedOrder.getTotalAmount());

            return ResponseEntity.ok(
                    new APIResponse<>("success",
                            "Nghiệm thu đơn hàng thành công! Tiền đã được chuyển vào ví người bán.", data));

        } catch (RuntimeException e) {
            // Bắt các lỗi nghiệp vụ (Không phải người mua, chưa giao hàng, ví đóng băng...)
            return ResponseEntity.badRequest().body(
                    new APIResponse<>("error", e.getMessage(), null));
        } catch (Exception e) {
            // Bắt lỗi hệ thống (Database, mạng, lỗi không lường trước)
            return ResponseEntity.internalServerError().body(
                    new APIResponse<>("error", "Đã xảy ra lỗi hệ thống: " + e.getMessage(), null));
        }
    }
}
