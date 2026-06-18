package com.thuc_kien.freelance_marketplace.Controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import com.thuc_kien.freelance_marketplace.DTO.ChatMessageDTO;
import com.thuc_kien.freelance_marketplace.Entity.ChatMessages;
import com.thuc_kien.freelance_marketplace.Entity.Conversation;
import com.thuc_kien.freelance_marketplace.Repository.ChatMessageRepository;
import com.thuc_kien.freelance_marketplace.Repository.ConversationRepository;
import com.thuc_kien.freelance_marketplace.security.CustomUserDetails;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    @Transactional
    @MessageMapping("/chat.send")
    public void processMessage(@Payload ChatMessageDTO message,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 🟢 ĐẶT LOG KIỂM TRA KHẨN CẤP
        System.out.println("================================================");
        System.out.println("👉 Cổng /chat.send ĐÃ ĐÓN NHẬN REQUEST THÀNH CÔNG!");
        System.out.println("Nội dung tin nhắn nhận được: " + message.getText());

        // 🛠️ SỬA LỖI: Lấy senderId an toàn. Ưu tiên từ UserDetails, nếu không lấy từ DTO 
        Long senderId = (userDetails != null && userDetails.getUser() != null) 
                        ? userDetails.getUser().getId() 
                        : message.getSenderId();

        if (senderId == null) {
            throw new RuntimeException("Không thể xác định danh tính người gửi.");
        }

        ChatMessages chatMessage = new ChatMessages();
        chatMessage.setConversationId(message.getConversationId());
        chatMessage.setSenderId(senderId);
        chatMessage.setReceiverId(message.getReceiverId());
        chatMessage.setText(message.getText());
        chatMessage.setFileUrl(message.getFileUrl());
        chatMessage.setFileType(message.getFileType());
        chatMessage.setCreatedAt(LocalDateTime.now().toString());

        // 1. Đồng bộ thời gian thực cho dữ liệu truyền tải lên Frontend
        message.setId(System.currentTimeMillis());

        ChatMessages savedMessage = messageRepository.save(chatMessage);

        // 2. Cập nhật trạng thái tin nhắn cuối cùng của Hộp hội thoại (Conversations)
        // để đồng bộ thanh Sidebar
        conversationRepository.findById(message.getConversationId()).ifPresent(conv -> {
            conv.setLastMessage(message.getText());
            conv.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conv);
        });

        broadcastMessage(savedMessage);
    }

    private void broadcastMessage(ChatMessages savedMessage) {
        // 1. Gửi tin nhắn tới Topic của người nhận
        messagingTemplate.convertAndSend("/topic/messages/" + savedMessage.getReceiverId(), savedMessage);

        // 2. Chỉ gửi lại tới Topic của người gửi nếu người gửi khác người nhận
        // Điều này ngăn chặn việc tin nhắn bị hiển thị lặp lại khi logic xác định đối tác ở Frontend bị sai
        if (!savedMessage.getSenderId().equals(savedMessage.getReceiverId())) {
            messagingTemplate.convertAndSend("/topic/messages/" + savedMessage.getSenderId(), savedMessage);
        }
    }
}
