package com.thuc_kien.freelance_marketplace.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.Entity.ChatMessages;
import com.thuc_kien.freelance_marketplace.Entity.Conversation;
import com.thuc_kien.freelance_marketplace.Entity.Orders;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Repository.ChatMessageRepository;
import com.thuc_kien.freelance_marketplace.Repository.ConversationRepository;
import com.thuc_kien.freelance_marketplace.Repository.OrderRepository;
import com.thuc_kien.freelance_marketplace.Repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public List<Conversation> getConversationsForUser(Long userId) {
        List<Conversation> conversations = conversationRepository.findAllByUserId(userId);

        return conversations;
    }

    public List<ChatMessages> getConversationMessages(Long conversationId) {
        return chatMessageRepository.findByConversationIdOrderByIdAsc(conversationId);
    }

    @Transactional
    public Long getOrCreateConversationBySellerId(Long currentUserId, Long sellerId) {
        // Ngăn chặn việc tự chat với chính mình
        if (currentUserId.equals(sellerId)) {
            throw new RuntimeException("Bạn không thể khởi tạo cuộc trò chuyện với chính mình.");
        }

        // 1. Kiểm tra xem phòng chat đôi giữa 2 người này đã tồn tại chưa
        Optional<Conversation> existingChat = conversationRepository.findExistingConversation(currentUserId, sellerId);
        if (existingChat.isPresent()) {
            return existingChat.get().getId(); // Có rồi thì trả về ID phòng cũ ngay
        }

        // 2. Chưa có phòng -> Tra cứu thông tin Tên/Avatar của 2 bên từ DB để đồng bộ
        // hiển thị Sidebar
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng hiện tại"));
        User sellerUser = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người bán"));

        // 3. Khởi tạo thực thể phòng chat đôi mới tinh
        Conversation newConversation = new Conversation();
        newConversation.setUserOneId(currentUserId);
        newConversation.setUserTwoId(sellerId);

        newConversation.setUserOneName(currentUser.getFullname());
        newConversation.setUserTwoName(sellerUser.getFullname());
        newConversation.setUserOneAvatar(currentUser.getAvatarUrl());
        newConversation.setUserTwoAvatar(sellerUser.getAvatarUrl());

        newConversation.setLastMessage("Hệ thống: Cuộc hội thoại mới đã được kết nối.");
        newConversation.setUpdatedAt(LocalDateTime.now());

        Conversation savedConversation = conversationRepository.save(newConversation);
        return savedConversation.getId(); // Trả về ID phòng mới tạo
    }

    /**
     * Hàm 2: Xử lý Kịch bản chat xuyên qua một Đơn hàng (OrderId) cụ thể
     */
    @Transactional
    public Long getOrCreateConversationByOrderId(Long currentUserId, Long orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));

        // Xác định User ID của đối tác. 
        // QUAN TRỌNG: Phải lấy User ID của Seller (order.getSeller().getUser().getId()) 
        // chứ không phải Seller ID (order.getSeller().getId())
        Long partnerId = order.getBuyer().getId().equals(currentUserId) 
                ? order.getSeller().getUser().getId() 
                : order.getBuyer().getId();

        // 2. Tái sử dụng logic kiểm tra/tạo phòng chéo ở Hàm 1 thông qua partnerId tìm
        // được
        return getOrCreateConversationBySellerId(currentUserId, partnerId);
    }

}
