package com.thuc_kien.freelance_marketplace.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.Service.OrderService;
import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.CreateOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.GigRequirementResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderListItemDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderResponseDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderStartRequestDTO;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor

public class OrderController {
    private final OrderService orderService;

    @PostMapping("")
    public ResponseEntity<APIResponse<Map<String, Object>>> createDraftOrder( 
            @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        // 🛠️ Vị trí 2 & 3: Đổi Long thành Map<String, Object> ở dòng khởi tạo này
        APIResponse<Map<String, Object>> apiResponse = new APIResponse<>(); 

        try {
            Long buyerId = currentUser.getUser().getId();
            Long orderId = orderService.createDraftOrder(request, buyerId);

            // Tạo bản đồ (Map) để đóng gói ID thành Object
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
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
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

    // ====================================================================
    // 2. API TRA CỨU: Xem chi tiết 1 đơn hàng cụ thể
    // ====================================================================
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
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<OrderResponseDTO>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build()
            );
        }
    }



    @GetMapping("/{orderIdStr}/requirements")
    public ResponseEntity<APIResponse<List<GigRequirementResponseDTO>>> getOrderRequirements(@PathVariable String orderIdStr) {
        
        // Lấy ID người dùng từ Token JWT
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();

        try {
            // Xử lý chuỗi mã đơn hàng dạng ORD-xxxx
            Long numericOrderId;
            try {
                String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
                numericOrderId = Long.parseLong(cleanId);
            } catch (NumberFormatException e) {
                throw new RuntimeException("Mã đơn hàng không hợp lệ.");
            }

            // Gọi Service lấy danh sách câu hỏi
            List<GigRequirementResponseDTO> requirements = orderService.getRequirementsForOrder(numericOrderId, currentUserId);

            return ResponseEntity.ok(
                    APIResponse.<List<GigRequirementResponseDTO>>builder()
                            .status("success")
                            .message("Lấy danh sách câu hỏi yêu cầu thành công")
                            .data(requirements)
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<List<GigRequirementResponseDTO>>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build()
            );
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
                            .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    APIResponse.<Void>builder()
                            .status("error")
                            .message(e.getMessage())
                            .data(null)
                            .build()
            );
        }
    }
}
