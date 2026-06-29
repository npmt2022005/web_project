package com.thuc_kien.freelance_marketplace.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thuc_kien.freelance_marketplace.DTO.APIResponse;
import com.thuc_kien.freelance_marketplace.Entity.ChatMessages;
import com.thuc_kien.freelance_marketplace.Entity.Conversation;
import com.thuc_kien.freelance_marketplace.Service.ConversationService;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;
    @GetMapping
    public ResponseEntity<APIResponse<List<Conversation>>> getAllMyConversations(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long currentUserId = userDetails.getUser().getId();
        List<Conversation> list = conversationService.getConversationsForUser(currentUserId);
    
        APIResponse<List<Conversation>> apiResponse = APIResponse.<List<Conversation>>builder()
                .status("success") // 200
                .message("Tải danh sách cuộc trò chuyện thành công!")
                .data(list)
                .build();
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<APIResponse<List<ChatMessages>>> getChatMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) { 
        
        // Gọi Service lấy mảng tin nhắn thật từ DB
        List<ChatMessages> messages = conversationService.getConversationMessages(conversationId);
        
        // Bọc dữ liệu trả về thông qua cấu trúc ApiResponse chuẩn hóa
        APIResponse<List<ChatMessages>> apiResponse = APIResponse.<List<ChatMessages>>builder()
                .status("success") // 200
                .message("Tải lịch sử tin nhắn thành công!")
                .data(messages)
                .build();
                
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/initiate/seller/{sellerId}")
    public ResponseEntity<APIResponse<Long>> initiateBySeller(
            @PathVariable Long sellerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        Long conversationId = conversationService.getOrCreateConversationBySellerId(currentUserId, sellerId);
        return ResponseEntity.ok(new APIResponse<>("success", "Khởi tạo cuộc trò chuyện thành công!", conversationId));
    }

    @PostMapping("/initiate/order/{orderIdStr}")
    public ResponseEntity<APIResponse<Long>> initiateByOrder(
            @PathVariable String orderIdStr,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new APIResponse<>("error", "Chưa đăng nhập", null));
        }
        Long currentUserId = userDetails.getUser().getId();
        
        String cleanId = orderIdStr.toUpperCase().replace("ORD-", "");
        Long orderId = Long.parseLong(cleanId);
        
        Long conversationId = conversationService.getOrCreateConversationByOrderId(currentUserId, orderId);
        return ResponseEntity.ok(new APIResponse<>("success", "Khởi tạo cuộc trò chuyện từ đơn hàng thành công!", conversationId));
    }
}
