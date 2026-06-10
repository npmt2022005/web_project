package com.thuc_kien.freelance_marketplace.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.Service.OrderService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;



import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.DTO.CreateOrderRequest;
import com.thuc_kien.freelance_marketplace.DTO.OrderSummaryDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor

public class OrderController {
    private final OrderService orderService;

    @PostMapping("")
public ResponseEntity<APIResponse<Map<String, Object>>> createDraftOrder( // 🛠️ Vị trí 1: Kiểu trả về của hàm
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
}
