package com.thuc_kien.freelance_marketplace.Service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.thuc_kien.freelance_marketplace.Entity.Notification;
import com.thuc_kien.freelance_marketplace.Entity.User;
import com.thuc_kien.freelance_marketplace.Repository.NotificationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepo;

    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void sendNotification(User recipient, String message, String relatedUrl) {

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setRelatedUrl(relatedUrl);
        Notification savedNotification = notificationRepo.save(notification);

        // 2. Bắn Real-time xuống kênh riêng của User đó
        // Ví dụ ID của Seller là 5 -> Kênh sẽ là: /topic/notifications/5
        String destination = "/topic/notifications/" + recipient.getId();
        
        // Đẩy thẳng object JSON của thông báo vừa lưu xuống cho React
        messagingTemplate.convertAndSend(destination, savedNotification);
    }
}
